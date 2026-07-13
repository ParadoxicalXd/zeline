export const run = {
  cmd: ['acc', 'open', 'close'],
  category: 'owner',
  description: 'manage group access and open/close group',
  settings: {
    owner: true,
    group: true,
    admin: true
  },
  run: async (m, { sock, prefix, command, args }) => {
    const action = (args[0] || command)?.toLowerCase()
    const targetChat = args[1] || m.chat

    // Get current group settings
    const metadata = await sock.groupMetadata(m.chat)

    if (command === 'open' || action === 'open') {
      if (!metadata.announce) {
        return m.reply('The group is already open 🔓.')
      }

      await sock.groupSettingUpdate(m.chat, 'not_announcement')
      return m.reply('🔓 The group has been opened. All members can now send messages.')
    }

    if (command === 'close' || action === 'close') {
      if (metadata.announce) {
        return m.reply('The group is already closed 🔒.')
      }

      await sock.groupSettingUpdate(m.chat, 'announcement')
      return m.reply('🔒 The group has been closed. Only admins can now send messages.')
    }

    if (action === 'add') {
      if (global.db.groups[targetChat]?.access) {
        return m.reply('This group already has access.')
      }

      global.db.groups[targetChat].access = true
      return m.reply('Access granted to this group.')
    }

    if (action === 'del') {
      if (!global.db.groups[targetChat]?.access) {
        return m.reply('This group does not have access.')
      }

      global.db.groups[targetChat].access = false
      return m.reply('Access revoked from this group.')
    }
  }
}
