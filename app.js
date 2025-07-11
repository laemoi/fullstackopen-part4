const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config.js')
const blogRouter = require('./controllers/blogs.js')
const userRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login.js')
const middleware = require('./utils/middleware.js')

mongoose.connect(config.MONGODB_URI)

app.use(cors())
app.use(express.json())

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use('/api/blogs', middleware.userExtractor, blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

app.use(middleware.errorHandler)

module.exports = app