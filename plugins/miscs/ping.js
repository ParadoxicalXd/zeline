export const run = {
  cmd: ['ping'],
  hidden: ['p'],
  category: 'miscs',
  description: 'show bot status',
  run: async (m, { sock }) => {

    const cap = `🏓 *Pong!*

*Bot Speed :* ${Date.now() - m.timestamps} ms
*Uptime Bot :* ${Func.toDate(process.uptime())}`

    await m.reply(cap)
  }
}
