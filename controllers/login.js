const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user.js')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })

  const correctCredentials = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!correctCredentials) {
    return response.status(401).json({ error: 'Incorrect username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  response.status(200).json({ token, username: user.username, name: user.name })
})

module.exports = loginRouter