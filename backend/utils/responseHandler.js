/**
 * Standard API Response Handlers
 */

function sendSuccess(res, message = "Operation completed successfully", data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null
  });
}

function sendError(res, message = "An error occurred", errors = null, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: Array.isArray(errors) ? errors : (errors ? [errors] : [])
  });
}

module.exports = {
  sendSuccess,
  sendError
};
