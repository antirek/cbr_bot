const cron = require('node-cron');
const config = require('config');
const moment = require('moment');

const {CBRClient} = require('../../api-clients');
const {Pair} = require('../../models');

const cbrClient = new CBRClient();

async function run() {
  
  const object = await cbrClient.getParsedData();
  console.log('parsed data', JSON.stringify(object, null, 2));

  const pair = await cbrClient.getPairObject();
  console.log('KGS', pair, pair.Value);
  const value = (Number(Number(pair.Value.replace(',','.')) / 100)).toFixed(6);
  console.log('value', value);
  const dateUpdated = moment().unix();
  console.log('dateUpdated', dateUpdated);
  const condition = {
    from: 'KGS',
    to: 'RUB',
  };
  let dbPair = await Pair.findOne(condition);
  if (!dbPair) {
    dbPair = new Pair({
      ...condition,
      value,
      dateUpdated,
    });
    await dbPair.save();
  } else {
    dbPair.value = value; 
    dbPair.dateUpdated = dateUpdated;
    await dbPair.save();
  }
  console.log('dbPair', dbPair);
}

cron.schedule(config.get('apps.cron-updater.schedule'), ()=>{
  run().catch(console.log);
});

console.log('start cron', config);
