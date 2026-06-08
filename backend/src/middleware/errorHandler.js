const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      });
    }
  
    // Sequelize unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path || 'field';
      return res.status(409).json({ error: `${field} already exists` });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
  
    // Axios errors (Polygon API)
    if (err.isAxiosError) {
      return res.status(err.response?.status || 502).json({
        error: 'External API error',
        message: err.response?.data?.message || err.message,
      });
    }
  
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };
  
  module.exports = errorHandler;