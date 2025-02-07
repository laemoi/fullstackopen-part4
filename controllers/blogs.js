const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')

const getToken = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const blogObject = request.body.likes
    ? request.body
    : { likes: 0, ...request.body }

  if (blogObject.title && blogObject.url) {
    const token = getToken(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Invalid token'})
    }
    const user = await User.findById(decodedToken.id)
    const blog = new Blog({ user: user._id, ...blogObject })
    user.blogs = user.blogs.concat(blog._id)
    await user.save()
    const result = await blog.save()
    response.status(201).json(result)
  } else {
    response.status(400).send()
  }
})

blogRouter.delete('/:id', async (request, response) => {
  const result = await Blog.findByIdAndDelete(request.params.id)
  if (result) {
    response.status(204).send()
  } else {
    response.status(404).send(`Blog with id ${request.params.id} was not found`)
  }
})

blogRouter.put('/:id', async (request, response) => {
  const updatedNote = request.body
  const result = await Blog.findByIdAndUpdate(request.params.id, updatedNote, { new: true })
  if (result) {
    response.status(200).json(result)
  } else {
    response.status(404).send(`Blog with id ${request.params.id} was not found`)
  }
})

module.exports = blogRouter