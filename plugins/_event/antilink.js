export const run = {
  event: async (m, { sock }) => {
    if (!m.isGroup || !db.groups[m.chat].antilink) return false

    const hasNestedForwardedNewsletterInfo = (message) => {
      if (!message || typeof message !== 'object') return false

      if (message.contextInfo?.forwardedNewsletterMessageInfo) return true

      for (const value of Object.values(message)) {
        if (
          value &&
          typeof value === 'object' &&
          hasNestedForwardedNewsletterInfo(value)
        ) {
          return true
        }
      }

      return false
    }

    const message = m.message

    const contextInfo =
      message?.contextInfo ||
      message?.extendedTextMessage?.contextInfo ||
      message?.imageMessage?.contextInfo ||
      message?.videoMessage?.contextInfo ||
      message?.documentMessage?.contextInfo

    // Detect WhatsApp Channel Posts
    const isChannelPost = Boolean(
      message?.contextInfo?.forwardedNewsletterMessageInfo ||
      contextInfo?.forwardedNewsletterMessageInfo ||
      hasNestedForwardedNewsletterInfo(message)
    )

    // Allowed links
    const isAllowedLink = Boolean(
      // Chrome Web Store
      m.text?.includes(
        'https://chromewebstore.google.com/detail/vu-toolkit-quiz-firewall/fkffpcgkilifkfofbklahpfjmgbdflho'
      ) ||

      // YouTube
      /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(m.text)
    )

    // Ignore current group's own invite link
    const isSameGroupLink = async () => {
      if (!m.text) return false

      const match = m.text.match(
        /https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i
      )

      if (!match) return false

      try {
        const info = await sock.groupInviteInfo(match[1])
        return info.id === m.chat
      } catch {
        return false
      }
    }

    const sameGroupLink = await isSameGroupLink()

    // Detect WhatsApp links
    const isChannelLink = Boolean(
      m.text &&
      Func.validUrl(m.text, 'whatsapp.com') &&
      !sameGroupLink &&
      !isAllowedLink
    )

    if (!isChannelPost && !isChannelLink) return false

    if (m.isAdmin || m.isOwner) return false

    const group = db.groups[m.chat]

    const warnings = group.warnings ?? (group.warnings = {})

    const tag = m.sender.split('@')[0]

    const typeLabel = isChannelPost
      ? 'Channel Posts'
      : 'Links'

    const count = (warnings[m.sender] || 0) + 1

    warnings[m.sender] = count

    const warningText =
      count <= 1
        ? `_Hey @${tag}!_\nSharing *${typeLabel}* here is not allowed.\nBe careful! You will be removed next time.\n*© 𝑷𝒂𝒓𝒂𝒅𝒐𝒙𝒊𝒄𝒂𝒍*`
        : `_HUH @${tag}!_\n\nI already warned you last time!\nDon't share *${typeLabel}* here.\nDo you think that was a joke to you?\n*© 𝑷𝒂𝒓𝒂𝒅𝒐𝒙𝒊𝒄𝒂𝒍*`

    if (m.isBotAdmin) {
      await sock.sendMessage(m.chat, {
        delete: m.key
      })
    }

    await sock.sendMessage(m.chat, {
      text: warningText,
      mentions: [m.sender]
    })

    if (m.isBotAdmin && count > 1) {
      await sock.groupParticipantsUpdate(
        m.chat,
        [m.sender],
        'remove'
      )

      delete warnings[m.sender]
    }

    return false
  }
}
