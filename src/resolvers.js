const posts = [
    { id: 1, author_id: 10, title: 'new shit', description: 'Lorem Ipsum', date: new Date() },
    { id: 2, author_id: 11, title: 'old shit', description: 'Sic dolor amet', date: new Date() }
]
const authors = [
    { id: 10, username: 'johndoe', first_name: 'John', last_name: 'Doe', phone_number: '+447479559980', avatar_url: 'http://acme.com/avatars/10' },
    { id: 11, username: 'janedoe', first_name: 'Jane', last_name: 'Doe', phone_number: '+447479559980', avatar_url: 'http://acme.com/avatars/11' },
]

const resolvers = {
  Query: {
    Posts: (_, __, context) => {
      // console.log(context.db)
      return context.db.models.post.findAll()
    },
    Post: (_, { id }, context) => context.pg.select().table('Post').where({ id: id }),
    Users: (_, __, context) => {
      // console.log(context.db)
      return context.db.models.user.findAll()
    },
  },
  Post: {
    id: post => post.id,
    title: post => post.title,
    description: post => post.description,
    user: (post, { id }, context)  => context.db.models.user.findById(post.userId),
  },
  User: {
    posts: ({ id }, _, context) => {
      return context.db.models.post.findAll()
    },
    notifications: ({ id }, _, context) => {
      return context.db.models.notification.findAll({
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
      console.log('fire!')
      return context.db.models.like.create({
        postId: data.id,
        userId: '1'
      })
    }
  }
}

module.exports = resolvers
