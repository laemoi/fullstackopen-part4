const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app.js')
const Blog = require('../models/blog.js')
const User = require('../models/user.js')

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

const initialUser = {
  username: 'tteekkari',
  password: 'secret password'
}

let token = null
let userId = null

/*
  Set up test database with:
    1. one user
    2. three blogs that belong to that user
*/
beforeEach(async () => {
  // Set up user
  await Blog.deleteMany({})
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(initialUser.password, 10)
  const firstUser = new User({
    username: initialUser.username,
    name: 'Teemu',
    passwordHash
  })
  await firstUser.save()
  userId = firstUser.toJSON().id
  const res = await api
    .post('/api/login')
    .send(initialUser)
    .expect(200)
  assert.strictEqual(res.body.username, initialUser.username)
  token = res.body.token

  // Set up blogs (and add them to the 'blogs'-field of the user)
  const promiseArray = initialBlogs.map(b => {
    const blogObject = new Blog({ user: userId, ...b })
    firstUser.blogs = firstUser.blogs.concat(blogObject._id)
    return blogObject.save()
  })
  await Promise.all(promiseArray)
  await firstUser.save()
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

describe('creating and deleting blogs', () => {
  describe('when creating a blog resource', () => {
    test('creating a new blog increases total blog count by one', async () => {
      const newBlog = {
        title: 'I am new here!',
        author: 'Tatu Teekkari',
        url: 'https://tietokilta.fi/fi',
        likes: 1
      }
      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, initialBlogs.length + 1)
    })

    test('new blog is saved to database correctly', async () => {
      const newBlog = {
        title: 'I am new here!',
        author: 'Tatu Teekkari',
        url: 'https://tietokilta.fi/fi',
        likes: 1
      }
      const res = await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
      const { id: _, ...returnedBlog } = res.body
      assert.deepStrictEqual(returnedBlog, { user: userId, ...newBlog })
    })

    test('if \'likes\' property is missing, default value is zero', async () => {
      const newBlog = {
        title: 'I am new here!',
        author: 'Tatu Teekkari',
        url: 'https://tietokilta.fi/fi'
      }
      const res = await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
      assert.strictEqual(res.body.likes, 0)
    })

    test('status code 400 is returned if \'title\' property is missing', async () => {
      const newBlog = {
        author: 'Tatu Teekkari',
        url: 'https://tietokilta.fi/fi',
        likes: 1
      }
      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(400)
    })

    test('status code 401 is returned if a token is not provided', async () => {
      const newBlog = {
        title: 'I am new here!',
        author: 'Tatu Teekkari',
        url: 'https://tietokilta.fi/fi',
        likes: 1
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, initialBlogs.length)
    })
  })

  describe('when deleting a blog resource', () => {
    test('blog should be deleted if \'id\' is valid', async () => {
      const blogToDelete = (await api.get('/api/blogs')).body[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(204)
      const updatedBlogs = (await api.get('/api/blogs')).body
      const updatedIDs = updatedBlogs.map(b => b.id)
      assert(!updatedIDs.includes(blogToDelete.id))
    })

    test('status code 404 should be returned if blog does not exist', async () => {
      const invalidID = '679a62fd6385886385afdddd'
      await api
        .delete(`/api/blogs/${invalidID}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
    })
  })
})

describe('when updating a blog resource', () => {
  test('blog should be updated correctly', async () => {
    const blogToUpdate = (await api.get('/api/blogs')).body[0]
    const modifiedBlog = { ...blogToUpdate, likes: 6314 }
    const res = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(modifiedBlog)
    assert.strictEqual(res.body.likes, 6314)
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