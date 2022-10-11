const axios = require('axios');
const xml2js = require('xml2js');
const moment = require('moment');

class CBRClient {
  constructor() {
    this.axios = axios.create({
      baseURL: 'https://www.cbr.ru/scripts/XML_dynamic.asp',
    });    
  }

  async load() {
    const date1 = moment().subtract(5, 'days').format('DD/MM/YYYY');
    const date2 = moment().format('DD/MM/YYYY');
    const currency = 'R01370';
    const params = {
      date_req1: date1,
      date_req2: date2,
      VAL_NM_RQ: currency,
    };
    console.log('params', params);
    const response = await this.axios.get('', {params});
    return response.data;
  }

  async parseXML (data) {
    const parser = new xml2js.Parser({
      explicitArray: false,
      trim: true,
    });
    const object = await parser.parseStringPromise(data);
    return object;
  }

  async getParsedData () {
    const data = await this.load();
    const object = await this.parseXML(data);
    return object;
  }

  async getPairObject () {
    const object = await this.getParsedData();
    const list = object && object.ValCurs && object.ValCurs.Record ? object.ValCurs.Record : null;
    if (!list) {return};
    const pair = list[list.length - 1];
    // console.log('object', pair);
    return pair;
  }
}

module.exports = {
  CBRClient,
}
