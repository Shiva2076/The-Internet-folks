const mongoose = require('mongoose');
const snowflake = require('@theinternetfolks/snowflake');

const roleSchema = new mongoose.Schema({
  id: {
    type: String,
    default: snowflake.Snowflake.generate,
    unique: true
  },
  name: {
    type: String,
    maxlength: 64,
    unique: true,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Role', roleSchema);