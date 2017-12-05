const { sendCode, getToken, isAdminOrSelf, isLoggedIn } = require('./auth')
const { upload } = require('./storage')

const resolvers = {
  Query: {
    Posts: (_, args, context) => context.db.models.post.findAll(),
    Post: (_, { id }, context) => context.db.models.post.findById(id),
    Users: (_, args, context) => context.db.models.user.findAll(),
    User: (_, { id }, context) => context.db.models.user.findById(id)
  },
  Post: {
    id: post => post.id,
    title: post => post.title,
    description: post => post.description,
    user: (post, context) => context.db.models.user.findById(post.userId)
  },
  User: {
    posts: ({ id }, args, context) => {
      return context.db.models.post.findAll({
        where: {
          userId: id
        }
      })
    },
    notifications: async ({ id }, args, { user, db }) => {
      isAdminOrSelf(user, id)
      return db.models.notification.findAll({
        where: {
          userId: id
        }
      })
    }
  },
  Mutation: {
    createPost: async (_, { input }, { db, user }) => {
      isLoggedIn(user)
      return db.models.post.create({
        ...input,
        userId: user.id
      })
    },
    followUser: (_, { id }, { user, db }) => {
      isLoggedIn(user)
      return db.models.follow.create({
        userId: user.id,
        subjectId: id
      })
    },
    likePost: (_, args, { user, db }) => {
      isLoggedIn(user)
      return db.models.like.create({
        postId: args.id,
        userId: user.id
      })
    },
    login: async (_, args, context) => {
      const code = await sendCode(args.phoneNumber)
      await context.db.models.user.upsert({
        verificationCode: code,
        phoneNumber: args.phoneNumber
      })
      return true
    },
    verifyCode: async (_, args, context) => {
      const user = await context.db.models.user.findOne({
        where: {
          verificationCode: args.verificationCode,
          phoneNumber: args.phoneNumber
        }
      })
      if (user) {
        return getToken(user.dataValues)
      } else {
        return null
      }
    },
    singleUpload: async (_, args, context) => {
      const { url } = await upload(args)
      return context.db.models.file.upsert({
        url
      })
    }
  }
}

module.exports = resolvers
