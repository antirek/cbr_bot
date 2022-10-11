const config = require('config');

const {createBot} = require('./bot');

const bootstrap = async () => {
  console.log('starting with config', config);
  const bot = await createBot({token: config.apps.bot.token});
  await bot.launch();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

(bootstrap)()
