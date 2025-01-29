const Blog = require('../models/blog.js')
const blogRouter = require('express').Router()

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const blogObject = request.body.likes
    ? request.body
    : { likes: 0, ...request.body }
  if (blogObject.title && blogObject.url) {
    const blog = new Blog(blogObject)
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

module.exports = blogRouter