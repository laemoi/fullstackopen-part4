const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const errorHandler = (error, request, response, next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'Expected \'username\' to be unique' })
  } else if (error.name === 'JsonWebTokenError' || error.name === 'SyntaxError') {
    return response.status(401).json({ error: 'Invalid token' })
  }

  next(error)
}

const userExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  const token = authorization && authorization.startsWith('Bearer ')
    ? authorization.replace('Bearer ', '')
    : null
  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    request.user = decodedToken
  }
  next()
}

module.exports = {
  errorHandler,
  userExtractor
}
