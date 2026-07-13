export const run = {
  cmd: ['acc', 'open', 'close'],
  category: 'owner',
  description: 'manage group access and open/close group',
  settings: {
    owner: true,
    group: true
  },
  run: async (m, { prefix, command, args }) => {
    const action = (args[0] || command)?.toLowerCase()
    const targetChat = args[1] || m.chat

    if (command === 'open' || action === 'open') {
      await sock.groupSettingUpdate(m.chat, 'not_announcement')
      return m.reply('group opened.')
    }

    if (command === 'close' || action === 'close') {
      await sock.groupSettingUpdate(m.chat, 'announcement')
      return m.reply('group closed.')
    }

    if (action === 'add') {
      if (global.db.groups[targetChat]?.access) {
        return m.reply('this group already has access.')
      }

      global.db.groups[targetChat].access = true
      return m.reply('access granted to this group.')
    }

    if (action === 'del') {
      if (!global.db.groups[targetChat]?.access) {
        return m.reply('this group does not have access.')
      }

      global.db.groups[targetChat].access = false
      return m.reply('access revoked from this group.')
    }
  }
}
