const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app.js')
const Blog = require('../models/blog.js')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Testing blogs',
    author: 'Teemu Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 99,
  },
  {
    title: 'Testing blogs again',
    author: 'Tiina Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 21,
  },
  {
    title: 'I have the most blogs now!',
    author: 'Tiina Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 15,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  const promiseArray = initialBlogs.map(b => {
    const blogObject = new Blog(b)
    return blogObject.save()
  })
  await Promise.all(promiseArray)
})

test.only('blogs are returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test.only('correct amount of blogs is returned', async () => {
  const res = await api.get('/api/blogs')
  assert.strictEqual(res.body.length, initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})