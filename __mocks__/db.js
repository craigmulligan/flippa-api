const {
  posts,
  users
} = require('./data');

module.exports = {
  models: {
    post: {
      findAll: () => Promise.resolve(posts),
      findById: (id) => Promise.resolve(posts.find(p => p.id === id))
    },
    user: {
      findAll: () => Promise.resolve(users),
      findById: (id) => Promise.resolve(users.find(p => p.id === id))
    }
  }
}
