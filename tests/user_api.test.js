const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app.js')
const User = require('../models/user.js')

const api = supertest(app)

describe('when there is one initial user in database', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secret password', 10)
    const firstUser = new User({
      username: 'root',
      name: 'Admin',
      passwordHash
    })
    await firstUser.save()
  })

  test('user with unique username should be created properly', async () => {
    const newUser = {
      username: 'tteekkari',
      name: 'Teemu Teekkari',
      password: 'teemupassword'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = (await api.get('/api/users')).body
    assert(usersAtEnd.length === 2)
  })

  test('user with existing username should not be created', async () => {
    const newUser = {
      username: 'root',
      name: 'Tiina Teekkari',
      password: 'tiinapassword'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert(res.body.error.includes('Expected \'username\' to be unique'))
    const usersAtEnd = (await api.get('/api/users')).body
    assert(usersAtEnd.length === 1)
  })

  test('user with missing username should not be created', async () => {
    const newUser = {
      name: 'Teemu Teekkari',
      password: 'teemupassword'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert(res.body.error.includes('Missing username or password'))
    const usersAtEnd = (await api.get('/api/users')).body
    assert(usersAtEnd.length === 1)
  })

  test('user with invalid username should not be created', async () => {
    const newUser = {
      username: 'T',
      name: 'Teemu Teekkari',
      password: 'teemupassword'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert(res.body.error.includes('must be at least 3 characters long'))
    const usersAtEnd = (await api.get('/api/users')).body
    assert(usersAtEnd.length === 1)
  })

  test('user with missing password should not be created', async () => {
    const newUser = {
      username: 'tteekkari',
      name: 'Teemu Teekkari'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert(res.body.error.includes('Missing username or password'))
    const usersAtEnd = (await api.get('/api/users')).body
    assert(usersAtEnd.length === 1)
  })

  test('user with invalid password should not be created', async () => {
    const newUser = {
      username: 'tteekkari',
      name: 'Teemu Teekkari',
      password: 'tp'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert(res.body.error.includes('must be at least 3 characters long'))
    const usersAtEnd = (await api.get('/api/users')).body
    assert(usersAtEnd.length === 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
