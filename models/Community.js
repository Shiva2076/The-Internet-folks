const mongoose = require('mongoose');
const snowflake = require('@theinternetfolks/snowflake');

const communitySchema = new mongoose.Schema({
  id: {
    type: String,
    default: snowflake.Snowflake.generate,
    unique: true
  },
  name: {
    type: String,
    maxlength: 128,
    required: true
  },
  slug: {
    type: String,
    maxlength: 255,
    unique: true,
    required: true
  },
  owner: {
    type: String,
    ref: 'User',
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

module.exports = mongoose.model('Community', communitySchema);