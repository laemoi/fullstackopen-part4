const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  if (blogs.length > 0) {
    return blogs.map(b => b.likes).reduce((sum, curr) => sum + curr, 0)
  }
  return 0
}

module.exports = {
  dummy,
  totalLikes
}