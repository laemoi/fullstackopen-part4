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
  const blog = new Blog(blogObject)
  const result = await blog.save()
  response.status(201).json(result)
})

module.exports = blogRouter