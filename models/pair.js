const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
  from: String,
  to: String,
  value: String,
  dateUpdated: String,
});

module.exports = {
  pairSchema,
};
