const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(status).json({ error: err.message, status });
};

module.exports = errorHandler;
