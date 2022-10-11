const { Telegraf, Markup } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const mongoose = require('mongoose');
const { session } = require('telegraf-session-mongoose');
const config = require('config');

const {
  Contact,
  Pair,
} = require('../../models');

const getContactFromDB = async (data) => {
  let contact;
  contact = await Contact.findOne({id: data.id});
  if(!contact) {
    const contactData = {...data, name: data.first_name};
    console.log('create contact', contactData);
    contact = new Contact(contactData);
    await contact.save();
  }
  return contact;
}

const createBot = async ({token}) => {

  await mongoose.connect(config.mongodb);

  const bot = new Telegraf(token);
  bot.use(session({collectionName: 'sessions'}));

  bot.start(async (ctx) => {
    const contactData = ctx.update.message.from;
    console.log('ctx update message from', contactData)

    const contact = await getContactFromDB(contactData);
    console.log('contact', contact);

    ctx.telegram.sendMessage(ctx.chat.id, 'Введите число');
  });

  bot.help((ctx) => {
    console.log(ctx.chat);
    console.log(ctx.chat.id);
    // log('require help');
    ctx.telegram.sendMessage(ctx.chat.id, 'справка');
  })
  
  bot.on('message', async (ctx) => {
    // console.log('message', JSON.stringify(ctx));
    console.log('message', ctx);

    let message_type = "";
    let keys = Object.keys(ctx.message);

    console.log('ctx keys', keys);
    
    if (keys.includes("text")) {
      message_type = "text";
    } else if (keys.includes("sticker")) {
      message_type = "sticker";
    } else if (keys.includes("photo")) {
      message_type = "photo";
    } else if (keys.includes("voice")) {
      message_type = "voice";
    } else if (keys.includes("document")) {
      message_type = "document";
    } else if (keys.includes("contact")) {
      message_type = "contact";
    }
    console.log(`Message Type is: ${message_type}`);

    try {
      const contact = await getContactFromDB(ctx.message.from);
      if (message_type === 'text') {
        const summa = Number(ctx.message.text);
        console.log('send summa', summa);
        
        ctx.session.summa = summa;
        const keyboard = Keyboard.inline([
          Key.callback('сом -> рубль', 'KGS_TO_RUB'),
          Key.callback('рубль -> сом', 'RUB_TO_KGS'),
        ], {
          columns: 2,
        });

        return ctx.reply(summa.toString(), keyboard);
      }
    } catch (e) {
      console.log('err', e);
    }
  });

  bot.on('callback_query', async (ctx) => {
    try {
      console.log('ctx session', ctx.session);
      const summa = ctx.session.summa;

      const command = ctx.callbackQuery.data;
      console.log({command, summa});

      let convertedSumma, from, to;
      if (command === 'KGS_TO_RUB') {
        [from, to] = command.split('_TO_');
        console.log('from, to', from, to);
        const pair = await Pair.findOne({from, to});
        convertedSumma = (Number(summa * pair.value)).toFixed(2);
      }
      if (command === 'RUB_TO_KGS') {
        [from, to] = command.split('_TO_');
        console.log('from, to', from, to);
        const pair = await Pair.findOne({from: to, to: from});
        convertedSumma = (Number(summa / pair.value)).toFixed(2);
      }
      const message = `${summa} ${from} = ${convertedSumma} ${to}`;
      ctx.reply(message);
    } catch (e) {
      console.log('error', e);
    }
    // return ctx.answerCbQuery()
  })

  return bot;
}

module.exports = {
  createBot,
}
