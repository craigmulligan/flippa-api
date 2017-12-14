const { sendCode, getToken, isAdminOrSelf, isLoggedIn } = require('./auth')
// const debug = require('debug')('resolvers')
const upload = require('./storage')
const QUERY_DEFUALTS = {
  sortOrder: 'DESC',
  sortField: 'createdAt',
  limit: 100,
  offset: 0
}

const resolvers = {
  Query: {
    Tags: (_, args, context) => {
      return context.db.models.tag.findAll()
    },
    Posts: (_, args, context) => {
      return context.db.models.post.findAll({
        ...QUERY_DEFUALTS,
        ...args
      })
    },
    Feed: async (_, args, { user, db }) => {
      // isLoggedIn(user)
      const following = await db.models.user
        .findById(args.id)
        .then(u => u.getFollowing())
        .then(f => f.map(x => x.get().id))

      if (following.length < 1) {
        return []
      }

      return db.models.post.findAll({
        ...QUERY_DEFUALTS,
        ...{
          where: {
            userId: {
              [db.Op.any]: following
            }
          }
        },
        ...args
      })
    },
    Post: (_, { id }, context) =>
      context.db.models.post.findById(id),
    Users: (_, args, context) => context.db.models.user.findAll(),
    User: (_, { id }, { user, db }) => {
      const uid = id ? id : user.id
      return db.models.user.findById(uid)
    },
    Files: (_, args, context) => context.db.models.file.findAll()
  },
  Post: {
    id: post => post.id,
    title: post => post.title,
    description: post => post.description,
    user: (post, args, context) => context.db.models.user.findById(post.userId),
    files: (post, args, context) => {
       return post.getFiles()
    },
    likes: (post, args, { db }) => {
      return post.getLikes()
    },
    tags: (post, args, { db }) => {
      return post.getTags()
    }
  },
  User: {
    posts: ({ id }, args, { db }) => {
      return db.models.post.findAll({
        where: {
          userId: id
        }
      })
    },
    followers: u => {
      return u.getFollowers()
    },
    following: u => {
      return u.getFollowing()
    },
    likes: u => {
      return u.getLikes()
    },
    notifications: async ({ id }, args, { user, db }) => {
      //isAdminOrSelf(user, id)
      return db.models.notification.findAll({
        where: {
          userId: id
        },
        include: [
          {
            model: db.models.user
          },
          {
            model: db.models.user,
            as: 'actor'
          },
          {
            model: db.models.post,
            as: 'post'
          }
        ]
      })
    }
  },
  Mutation: {
    updateUser: async (_, { input }, { db, user }) => {
      isLoggedIn(user)
      return db.models.user.update(input, { where: { id: user.id } })
    },
    createPost: async (_, { input }, { db, user }) => {
      isLoggedIn(user)
      const p = await db.models.post.create({
        ...input,
        userId: user.id
      })
      await p.setTags(input.tags)
      return p 
    },
    followUser: (_, { id }, { user, db }) => {
      // isLoggedIn(user)
      return db.models.follow.create({
        userId: 2,
        subjectId: id
      })
    },
    likePost: (_, args, { user, db }) => {
      // isLoggedIn(user)
      return db.models.like.create({
        postId: args.id,
        userId: 2
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
    singleUpload: async (_, { file }, { user, db }) => {
      const data = await upload({
        file,
        user
      })
      return db.models.file.create(data)
    }
  }
}

module.exports = resolvers
