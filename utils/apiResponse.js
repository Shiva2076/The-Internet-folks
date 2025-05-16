const successResponse = (data, meta = null) => {
  return {
    status: true,
    content: meta ? { data, meta } : { data }
  };
};

const errorResponse = (message, code) => {
  return {
    status: false,
    errors: [{ message, code }]
  };
};

module.exports = {
  successResponse,
  errorResponse
};