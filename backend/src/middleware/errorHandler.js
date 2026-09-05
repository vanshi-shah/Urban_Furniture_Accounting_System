function errorHandler(err, req, res, next) {
  // Always log full technical error and stack trace on the backend
  console.error('\n🔴 [Backend Error Log]:');
  console.error(err.stack || err);

  let statusCode = err.statusCode || 500;
  let message = 'An unexpected internal server error occurred. Please try again.';

  // 1. Zod Validation Errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors && err.errors.length > 0
      ? err.errors.map(e => `${e.path.join('.') || 'field'}: ${e.message}`).join(', ')
      : 'Invalid request data provided.';
  }
  // 2. Prisma Database Connection / Initialization Errors
  else if (
    err.name === 'PrismaClientInitializationError' ||
    err.name === 'PrismaClientRustPanicError' ||
    err.code === 'P1000' ||
    err.code === 'P1001' ||
    err.code === 'P1002' ||
    err.code === 'P1003' ||
    (typeof err.message === 'string' && (
      err.message.includes("Can't reach database server") ||
      err.message.includes('Authentication failed against database server') ||
      err.message.includes('database server is running')
    ))
  ) {
    statusCode = 503;
    message = 'Database service is currently unreachable. Please check database server connection.';
  }
  // 3. Prisma Known Request Errors
  else if (err.code === 'P2002') {
    statusCode = 400;
    const target = err.meta?.target ? ` on (${Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target})` : '';
    message = `A record with this information already exists${target}.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Operation could not be completed due to related record constraints.';
  }
  // 4. JWT Errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session has expired or is invalid. Please sign in again.';
  }
  // 5. Explicit client errors (e.g. 400/401/403/404 with custom safe messages)
  else if (err.statusCode && err.statusCode < 500 && err.message && !err.message.includes('\n') && !err.message.includes('\\')) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 6. Generic errors with safe single-line custom messages
  else if (err.message && !err.message.includes('invocation in') && !err.message.includes('at ') && !err.message.includes('\\') && !err.message.includes('/')) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    data: null,
  });
}

module.exports = { errorHandler };

