const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  if (blogs.length > 0) {
    return blogs.map(b => b.likes).reduce((sum, curr) => sum + curr, 0)
  }
  return 0
}

const favoriteBlog = (blogs) => {
  let initialFave = blogs[0]
  blogs.forEach(b => {
    if (b.likes > initialFave.likes) {
      initialFave = b
    }
  })
  return initialFave
}

const mostBlogs = (blogs) => {
  if (blogs.length > 0) {
    const res = _.maxBy(_.toPairs(_.countBy(blogs, b => b.author)), (entry) => entry[1])
    return {
      author: res[0],
      blogs: res[1]
    }
  }
  return undefined
}

const mostLikes = (blogs) => {
  if (blogs.length > 0) {
    const authorsAndBlogs = _.groupBy(blogs, b => b.author)
    const authorsAndLikes = _.mapValues(authorsAndBlogs, (blogs) => totalLikes(blogs))
    const res = _.maxBy(_.toPairs(authorsAndLikes), (entry) => entry[1])
    return {
      author: res[0],
      likes: res[1]
    }
  }
  return undefined
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}