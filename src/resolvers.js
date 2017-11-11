const { sendCode, getToken, isAdminOrSelf } = require('./auth')

const resolvers = {
  Query: {
    Posts: (_, __, context) => context.db.models.post.findAll(),
    Post: (_, { id }, context) => context.db.models.user.findById(id),
    Users: (_, __, context) => context.db.models.user.findAll()
  },
  Post: {
    id: post => post.id,
    title: post => post.title,
    description: post => post.description,
    user: (post, context) =>
      context.db.models.user.findById(post.userId)
  },
  User: {
    posts: ({ id }, _, context) => {
      return context.db.models.post.findAll({
        where: {
          userId: id
        }
      })
    },
    notifications: async ({ id }, _, { db, user }) => {
      await isAdminOrSelf(user, id)
      return db.models.notification.findAll({
        where: {
          userId: id
        }
      })
    }
  },
  Mutation: {
    createPost: (_, data, context) => {
      return context.db.models.post.create(data)
    },
    createUser: (_, data, context) => {
      return context.db.models.user.create(data)
    },
    followUser: (_, data, context) => {
      return context.db.models.follow.create(data)
    },
    likePost: (_, data, context) => {
      return context.db.models.like.create({
        postId: data.id,
        userId: '1'
      })
    },
    login: async (_, data, context) => {
      const code = await sendCode(data.phoneNumber)
      await context.db.models.user.upsert({
        verificationCode: code,
        phoneNumber: data.phoneNumber
      })
      return true
    },
    verifyCode: async (_, data, context) => {
      const user = await context.db.models.user.findOne({
        where: {
          verificationCode: data.verificationCode,
          phoneNumber: data.phoneNumber
        }
      })
      if (user) {
        return getToken(user.dataValues)
      } else {
        return null
      }
    }
  }
}

module.exports = resolvers
