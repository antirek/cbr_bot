const config = require('config');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const dataConnection = mongoose.createConnection(config.mongodb);

const {contactSchema} = require('./contact');
const {pairSchema} = require('./pair');

const Contact = dataConnection.model('Contact', contactSchema);
const Pair = dataConnection.model('Pair', pairSchema);

module.exports = {
  Contact,
  Pair,
};
