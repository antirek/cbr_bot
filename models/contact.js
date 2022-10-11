const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: String,
  username: String,
  phone: String,
  language_code: String,
});

module.exports = {
  contactSchema,
};
