function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors ? err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') : 'Validation error';
  } else if (err.code === 'P2002') {
    statusCode = 400;
    message = 'A unique constraint was violated';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    data: null,
  });
}

module.exports = { errorHandler };
