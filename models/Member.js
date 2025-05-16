const mongoose = require('mongoose');
const snowflake = require('@theinternetfolks/snowflake');

const memberSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: snowflake.Snowflake.generate
  },
  community: {
    type: String,
    ref: 'Community',
    required: true
  },
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    ref: 'Role',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

module.exports = mongoose.model('Member', memberSchema);