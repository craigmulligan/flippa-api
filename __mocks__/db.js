const {
  posts,
  users,
  notifications,
  follow,
  like
} = require('./data');

module.exports = {
  models: {
    post: {
      findAll: () => Promise.resolve(posts),
      findById: (id) => Promise.resolve(posts.find(p => p.id === id)),
      create: (data) => {
        posts.push(data)
        return Promise.resolve(data)
      }
    },
    user: {
      findAll: () => Promise.resolve(users),
      findById: (id) => Promise.resolve(users.find(p => p.id === id))
    },
    notification: {
      findAll: () => Promise.resolve(notifications),
    },
    follow: {
      create: (data) => {
        follow.push(data)
        return Promise.resolve(data)
      }
    },
    like: {
      create: (data) => {
        like.push(data)
        return Promise.resolve(data)
      }
    }
  }
}
