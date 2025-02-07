const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user.js')

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  if (!username || !password) {
    return response.status(400).json({
      error: 'Missing username or password'
    })
  }
  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: 'Both username and password must be at least 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  response.status(200).json(users)
})

module.exports = userRouter
