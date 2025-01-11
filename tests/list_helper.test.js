const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

const emptyBlogList = []
const listWithOneBlog = [
  {
    _id: 'a000',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  }
]
const listWithMultipleBlogs = [
  {
    _id: 'a001',
    title: 'Testing blogs',
    author: 'Teemu Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 99,
    __v: 0
  },
  {
    _id: 'a002',
    title: 'Testing blogs again',
    author: 'Tiina Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 21,
    __v: 0
  },
  {
    _id: 'a003',
    title: 'I have the most blogs now!',
    author: 'Tiina Teekkari',
    url: 'https://tietokilta.fi/fi',
    likes: 15,
    __v: 0
  }
]

describe('total likes', () => {
  test('when list is empty, equals zero', () => {
    const result = listHelper.totalLikes(emptyBlogList)
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that blog', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs, equals the sum of the likes of each blog', () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs)
    assert.strictEqual(result, 135)
  })
})

describe('favorite blog', () => {
  test('when list is empty, favorite should be undefined', () => {
    const result = listHelper.favoriteBlog(emptyBlogList)
    assert.strictEqual(result, undefined)
  })

  test('when list has only one blog, favorite should be that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(
      result,
      {
        _id: 'a000',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
      }
    )
  })

  test('when list has multiple blogs, favorite should be the blog with most likes', () => {
    const result = listHelper.favoriteBlog(listWithMultipleBlogs)
    assert.deepStrictEqual(
      result,
      {
        _id: 'a001',
        title: 'Testing blogs',
        author: 'Teemu Teekkari',
        url: 'https://tietokilta.fi/fi',
        likes: 99,
        __v: 0
      }
    )
  })
})

describe('author with most blogs', () => {
  test('when list is empty, should be undefined', () => {
    const result = listHelper.mostBlogs(emptyBlogList)
    assert.strictEqual(result, undefined)
  })

  test('when list has only one blog, should be the author of that blog', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual(
      result,
      {
        author: 'Edsger W. Dijkstra',
        blogs: 1
      }
    )
  })

  test('when list has multiple blogs, should be the author with most blogs', () => {
    const result = listHelper.mostBlogs(listWithMultipleBlogs)
    assert.deepStrictEqual(
      result,
      {
        author: 'Tiina Teekkari',
        blogs: 2
      }
    )
  })
})