const { test, describe, beforeEach, after } = require('node:test')
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

test('blogs are returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct amount of blogs is returned', async () => {
  const res = await api.get('/api/blogs')
  assert.strictEqual(res.body.length, initialBlogs.length)
})

test('unique identifier property should be named \'id\'', async () => {
  const res = await api.get('/api/blogs')
  objectKeys = Object.keys(res.body[0])
  assert(objectKeys.includes('id') && !objectKeys.includes('_id'))
})

test('creating a new blog increases total blog count by one', async () => {
  const newBlog = {
    title: 'I am new here!',
    author: 'Tatu Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  const res = await api.get('/api/blogs')
  assert(initialBlogs.length + 1 === res.body.length)
})

test('new blog is saved to database correctly', async () => {
  const newBlog = {
    title: 'I am new here!',
    author: 'Tatu Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 1
  }
  const res = await api.post('/api/blogs').send(newBlog)
  const { id: _, ...returnedBlog } = res.body
  assert.deepStrictEqual(newBlog, returnedBlog)
})

test('if \'likes\' property is missing, default value is one', async () => {
  const newBlog = {
    title: 'I am new here!',
    author: 'Tatu Teekkari',
    url: 'https://tietokilta.fi/fi'
  }
  const res = await api.post('/api/blogs').send(newBlog)
  assert(res.body.likes === 0)
})

test('status code 400 is returned if \'title\' property is missing', async () => {
  const newBlog = {
    author: 'Tatu Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('status code 400 is returned if \'url\' property is missing', async () => {
  const newBlog = {
    title: 'I am new here!',
    author: 'Tatu Teekkari',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

describe('when deleting a blog resource', () => {
  test('blog should be deleted if \'id\' is valid', async () => {
    const blogToDelete = (await api.get('/api/blogs')).body[0]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
    const updatedBlogs = (await api.get('/api/blogs')).body
    const updatedIDs = updatedBlogs.map(b => b.id)
    assert(!updatedIDs.includes(blogToDelete.id))
  })

  test('status code 404 should be returned if blog does not exist', async () => {
    const invalidID = '679a62fd6385886385afdddd'
    await api
      .delete(`/api/blogs/${invalidID}`)
      .expect(404)
  })
})

describe('when updating a blog resource', () => {
  test('blog should be updated correctly', async () => {
    const blogToUpdate = (await api.get('/api/blogs')).body[0]
    const modifiedBlog = { ...blogToUpdate, likes: 6314}
    const res = (await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(modifiedBlog)).body
    assert.deepStrictEqual(res, modifiedBlog)
    assert(res.likes === 6314)
  })

  test('status code 404 should be returned if blog does not exist', async () => {
    const invalidID = '679a62fd6385886385afdddd'
    await api
      .put(`/api/blogs/${invalidID}`)
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})