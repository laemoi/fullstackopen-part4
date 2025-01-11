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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}