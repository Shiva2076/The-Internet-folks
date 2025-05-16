const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: false,
      errors: [{ message: err.message }]
    });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({
      status: false,
      errors: [{ message: 'Duplicate key error' }]
    });
  }
  
  res.status(500).json({
    status: false,
    errors: [{ message: 'Something went wrong on the server.' }]
  });
};

module.exports = errorHandler;