const Sequelize = require('sequelize')
const constants = require('../constants')
const sequelize = new Sequelize(constants.DB_CONNECTION, {
 logging: false 
})

const NOTIFICATION_TYPES = {
  follow: 'FOLLOW',
  like: 'LIKE'
}

const User = sequelize.define('user', {
  displayName: Sequelize.STRING,
  verificationCode: {
    type: Sequelize.STRING
  },
  phoneNumber: {
    type: Sequelize.STRING,
    unique: true
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

sequelize.define('file', {
  url: Sequelize.STRING
})

const Like = sequelize.define('like', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER
  },
  postId: {
    type: Sequelize.INTEGER
  }
})

const Follow = sequelize.define('follow', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER
  },
  subjectId: {
    type: Sequelize.INTEGER
  }
})

const Notification = sequelize.define('notification', {
  sourceType: {
    type: Sequelize.STRING
  },
  read: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

User.hasMany(Post)

const Tag = sequelize.define('tag', {
  title: {
    type: Sequelize.STRING, 
    unique: true
  }
})

const File = sequelize.define('file', {
  url: {
    type: Sequelize.STRING,
    unique: true
  },
  name: {
    type: Sequelize.STRING,
  }
}) 

Post.hasMany(File)

Post.belongsToMany(Tag, {
  through: 'tagConnection'
})

Tag.belongsToMany(Post, {
  through: 'tagConnection'
})

Notification.belongsTo(User)
Notification.belongsTo(User, {
  as: 'actor'
})

Notification.belongsTo(Post, {
  as: 'post'
})

Post.belongsToMany(User, {
  as: 'likes',
  foreignKey: 'postId',
  through: {
    model: Like
  }
})

User.belongsToMany(Post, {
  as: 'likes',
  foreignKey: 'userId',
  through: {
    model: Like
  }
})

User.belongsToMany(User, {
  as: 'followers',
  foreignKey: 'subjectId',
  through: {
    model: Follow
  }
})

User.belongsToMany(User, {
  as: 'following',
  foreignKey: 'userId',
  through: {
    model: Follow
  }
})

Follow.addHook('afterCreate', 'follow', follow => {
  Notification.create({
    actorId: follow.userId,
    userId: follow.subjectId,
    sourceType: NOTIFICATION_TYPES.follow
  })
})

Like.addHook('afterCreate', 'like', async like => {
  const post = await Post.find({ where: { id: like.postId } })
  Notification.create({
    actorId: like.userId,
    userId: post.userId,
    sourceType: NOTIFICATION_TYPES.like,
    postId: post.id
  })
})

module.exports = sequelize
