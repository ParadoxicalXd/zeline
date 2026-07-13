export const run = {
  event: async (m, { sock }) => {
    if (!m.isGroup || !db.groups[m.chat].antilink) return false

    const hasNestedForwardedNewsletterInfo = (message) => {
      if (!message || typeof message !== 'object') return false

      const contextInfo = message.contextInfo
      if (contextInfo?.forwardedNewsletterMessageInfo) return true

      for (const value of Object.values(message)) {
        if (value && typeof value === 'object' && hasNestedForwardedNewsletterInfo(value)) {
          return true
        }
      }

      return false
    }

    const message = m.message
    const contextInfo = message?.contextInfo || message?.extendedTextMessage?.contextInfo || message?.imageMessage?.contextInfo || message?.videoMessage?.contextInfo || message?.documentMessage?.contextInfo
    const hasForwardedNewsletterInfo = Boolean(
      message?.contextInfo?.forwardedNewsletterMessageInfo ||
      contextInfo?.forwardedNewsletterMessageInfo ||
      hasNestedForwardedNewsletterInfo(message)
    )

    const url = m.text ? Func.validUrl(m.text, 'whatsapp.com') : null

    if (!url && !hasForwardedNewsletterInfo) return false

    if (m.isAdmin || m.isOwner) return false

    const group = db.groups[m.chat]
    const warnings = group.warnings ?? (group.warnings = {})
    const tag = m.sender.split('@')[0]
    const typeLabel = 'links'
    const count = (warnings[m.sender] || 0) + 1
    warnings[m.sender] = count

    const warningText = count <= 1
      ? `_Hey @${tag}!_\nSharing *${typeLabel}* here is not allowed.\nBe careful! You will be removed next time.\n*© 𝑷𝒂𝒓𝒂𝒅𝒐𝒙𝒊𝒄𝒂𝒍*`
      : `_HUH @${tag}!_\n\nI already warned you last time!\nDon't share *${typeLabel}* here.\nDo you think that was a joke to you?\n*© 𝑷𝒂𝒓𝒂𝒅𝒐𝒙𝒊𝒄𝒂𝒍*`

    await sock.sendMessage(
      m.chat,
      {
        text: warningText,
        mentions: [m.sender]
      },
      { quoted: m }
    )

    if (m.isBotAdmin) {
      await sock.sendMessage(m.chat, { delete: m.key })

      if (count > 1) {
        await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }
    }

    return false
  }
}
