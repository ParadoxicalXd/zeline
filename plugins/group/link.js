export const run = {
    cmd: ['link'],
    hidden: ['getlink'],
    category: 'group',
    settings: {
        group: true,
        botAdmin: true,
        admin: true,
    },
    description: 'get this group invite link',
    run: async (m, { sock }) => {
        m.reply(`https://chat.whatsapp.com/${await sock.groupInviteCode(m.chat)}`)
    }
}
