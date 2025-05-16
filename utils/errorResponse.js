
/**
 * Standardized error response format
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} code - Error code
 */
const errorResponse = (res, statusCode, message, code) => {
  return res.status(statusCode).json({
    status: false,
    errors: [{ message, code }]
  });
};

module.exports = errorResponse;