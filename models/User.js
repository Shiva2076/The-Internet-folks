const mongoose = require('mongoose');
const snowflake = require('@theinternetfolks/snowflake');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: snowflake.Snowflake.generate,
    unique: true
  },
  name: {
    type: String,
    maxlength: 64,
    default: null
  },
  email: {
    type: String,
    maxlength: 128,
    unique: true,
    required: true
  },
  password: {
    type: String,
    maxlength: 64,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);