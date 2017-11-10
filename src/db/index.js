const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgresql://localhost:5432/flippa')
const Model = {}
const Promise = require('bluebird')

const NOTIFICATION_TYPES = {
  follow: 'FOLLOW',
  like: 'LIKE'
}

const URL_TYPE = {
  type: Sequelize.STRING,
  validate: {
    isUrl: true
  },
  allowNull: true,
  defaultValue: null
}

const User = sequelize.define('user', {
  displayName: Sequelize.STRING,
  phoneNumer: {
    type: Sequelize.STRING,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null
  }
})

const Post = sequelize.define('post', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  price: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: null
  },
  archived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

const Image = sequelize.define('image', {
  url: URL_TYPE,
  small: URL_TYPE,
  medium: URL_TYPE,
  large: URL_TYPE
})

const Like = sequelize.define('like', {
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  },
  postId: {
    type: Sequelize.INTEGER,
    references: {
      model: Post,
      key: 'id',
    }
  }
})

const Follow = sequelize.define('follow', {
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  },
  subjectId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  }
})

const Nofitcation = sequelize.define('notification', {
  type: {
    type: Sequelize.STRING
  },
  actorId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  },
  meta: {
    type: Sequelize.JSONB,
    allowNull: true
  },
  read: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

const Category = sequelize.define('category', {
  title: {
    type: Sequelize.TEXT,
  },
})

Post.belongsTo(User)
Post.belongsTo(Category)
Nofitcation.belongsTo(User)
Image.belongsTo(Post)


Follow.addHook('afterCreate', 'follow', (follow, options) => {
  Nofitcation.create({
    actorId: follow.userId,
    userId: follow.subjectId,
    type: NOTIFICATION_TYPES.follow
  })
})

Like.addHook('afterCreate', 'like', async (like, options) => {
  const post = await Post.find({ where: { id : like.postId }})
  Nofitcation.create({
    actorId: like.userId,
    userId: post.userId,
    type: NOTIFICATION_TYPES.like
  })
})

const Models = [
  Post,
  User,
  Like,
  Image,
  Follow,
  Category,
  Nofitcation
]

module.exports = sequelize
