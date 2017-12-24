const { sendCode, getToken, isAdminOrSelf, isLoggedIn } = require('./auth')
const debug = require('debug')('resolvers')
const upload = require('./storage')
const GraphQLJSON = require('graphql-type-json')

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
    Posts: (_, args, { db }) => {
      const { filter } = args
      debug(filter)
      return db.models.post.findAll({
        ...QUERY_DEFUALTS,
        ...args,
        ...(() => (
          filter ? filter : {}
        ))()
     })
    },
    PostsByLikers: (_, args, { db }) => {
      const { filter } = args
      debug(filter)
      return db.models.post.findAll({
        ...QUERY_DEFUALTS,
        ...args,
        include: [
          {
            model: db.models.user,
            as: 'likes',
            where: {
              id: args.filter.likers 
            }
          }
        ]
      })
    },
    Feed: async (_, args, { user, db }) => {
      // isLoggedIn(user)
      const following = await db.models.user
        .findById(user.id)
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
    Whoami: (_, args, { db, user }) => db.models.user.findById(user.id),
    User: (_, { id }, { user, db }) => {
      uid = Boolean(id) ? id : user.id
      return db.models.user.findById(uid)
    },
    Files: (_, args, context) => context.db.models.file.findAll()
  },
  Post: {
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
          actorId: user.id 
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
  JSON: GraphQLJSON,
  Mutation: {
    updateUser: async (_, { input }, { db, user }) => {
      isLoggedIn(user)
      return db.models.user.update(input, { where: { id: user.id } })
    },
    createPost: async (_, { input }, { db, user }) => {
      isLoggedIn(user)
      const {
        files,
        tags
      } = input

      const p = await db.models.post.create({
        ...input,
        userId: user.id
      })
      if (tags) {
        await p.setTags(tags)
      }
      if (files) {
        await p.setFiles(files)
      }
      return p 
    },
    followUser: async (_, { id }, { user, db }) => {
      // isLoggedIn(user)
      try {
        res = await db.models.follow.create({
          userId: user.id,
          subjectId: id
        })
      } catch(err) {
        if (err.message == 'Validation error') {
          const instance = await db.models.follow.find({
            where: {
              userId: user.id,
              subjectId: id
            }
          })

          return instance.destroy({ force: true }) 
        } else {
          return err
        }
      }
    },
    likePost: async (_, args, { user, db }) => {
      // isloggedin(user)
      try {
        res = await db.models.like.create({
          postId: args.id,
          userId: user.id 
        })

        return res
      } catch (err) {
        if (err.message == 'Validation error') {
          const instance = await db.models.like.find({
            where: {
              postId: args.id,
              userId: user.id
            }
          })

          return instance.destroy({ force: true })
        } else {
          return err
        }
      } 
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
    },
    markNotificationAsRead: (_, { id }, { db, user }) => {
      const ids = isArray(id) ? id : [id]
      return db.models.notification.update({
        read: true,
      }, {
        where: {
          id: {
            [db.Op.any]: args.ids.map(d => Number(d)) 
          }
        }
      }) 
    }
  }
}

module.exports = resolvers
