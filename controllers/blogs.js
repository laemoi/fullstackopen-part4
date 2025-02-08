const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const blogObject = request.body.likes
    ? request.body
    : { likes: 0, ...request.body }

  if (blogObject.title && blogObject.url) {
    const user = request.user
    if (!user?.id) {
      return response.status(401).json({ error: 'Invalid token'})
    }

    const blog = new Blog({ user: user.id, ...blogObject })
    const userInDb = await User.findById(user.id)
    userInDb.blogs = userInDb.blogs.concat(blog._id)
    await userInDb.save()
    const result = await blog.save()
    response.status(201).json(result)
  } else {
    response.status(400).send()
  }
})

blogRouter.delete('/:id', async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id)
  const user = request.user

  if (blogToDelete) {
    if (user.id === blogToDelete.user.toString()) {
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).send()
    } else {
      response.status(401).json({ error: 'Only the user that created a blog can delete it' })
    }
  } else {
    response.status(404).send(`Blog with id ${request.params.id} was not found`)
  }
})

blogRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const blogToUpdate = (await Blog.findById(request.params.id))?.toJSON()
  if (blogToUpdate) {
    const newBlog = { ...blogToUpdate, title, author, url, likes } 
    const result = await Blog.findByIdAndUpdate(request.params.id, newBlog, { new: true })
    if (result) {
      response.status(200).json(result)
    } else {
      response.status(400).send()
    }
  } else {
    response.status(404).send(`Blog with id ${request.params.id} was not found`)
  }
})

module.exports = blogRouter