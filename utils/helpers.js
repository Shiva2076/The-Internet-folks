const snowflake = require('@theinternetfolks/snowflake');

function generateId() {
  return snowflake.Snowflake.generate();
}

function formatResponse(data, meta = null) {
  return {
    status: true,
    content: {
      data,
      meta
    }
  };
}

module.exports = {
  generateId,
  formatResponse
};