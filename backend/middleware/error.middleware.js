/**
 * middleware/error.middleware.js
 *
 * Centralised error handling middleware.
 *  - notFound  : catches unmatched routes and creates a 404 error.
 *  - errorHandler : formats all errors into a consistent JSON response.
 */

/**
 * 404 Not Found — attach to app AFTER all routes.
 */
const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global Error Handler — attach to app as the LAST middleware.
 * @param {Error} err
 */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists — please choose a different value` });
  }

  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ success: false, message: 'Invalid token — please log in again' });
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ success: false, message: 'Session expired — please log in again' });

  // Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File size exceeds the allowed limit' });

  res.status(statusCode).json({
    success : false,
    message : err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
