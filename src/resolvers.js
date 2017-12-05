const { sendCode, getToken, isAdminOrSelf } = require('./auth')
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
    notifications: async ({ id }, args, ctx) => {
      console.log('USER', ctx)
      await isAdminOrSelf(ctx.user, id)
      return ctx.db.models.notification.findAll({
        where: {
          userId: id
        }
      })
    }
  },
  Mutation: {
    createPost: (_, args, context) => {
      return context.db.models.post.create(args)
    },
    createUser: (_, args, context) => {
      return context.db.models.user.create(args)
    },
    followUser: (_, args, context) => {
      return context.db.models.follow.create(args)
    },
    likePost: (_, args, context) => {
      return context.db.models.like.create({
        postId: args.id,
        userId: '1'
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
