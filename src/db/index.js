const Sequelize = require('sequelize')
const constants = require('../constants')
const sequelize = new Sequelize(constants.DB_CONNECTION)

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
  },
  fileId: {
    type: Sequelize.INTEGER,
    allowNull: true
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
    type: Sequelize.INTEGER,
  },
  postId: {
    type: Sequelize.INTEGER,
  }
})

const Follow = sequelize.define('follow', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
  },
  subjectId: {
    type: Sequelize.INTEGER,
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
      key: 'id'
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
    type: Sequelize.TEXT
  }
})

Post.belongsTo(User)
Post.belongsTo(Category)

Nofitcation.belongsTo(User)

//Like.belongsTo(Post)

Post.belongsToMany(User, { as: 'likes', foreignKey: 'postId', through: {
  model: Like
}})

User.belongsToMany(Post, { as: 'likes', foreignKey: 'userId', through: {
  model: Like
}})

User.belongsToMany(User, { as: 'followers', foreignKey: 'subjectId', through: {
  model: Follow
}});

User.belongsToMany(User, { as: 'following', foreignKey: 'userId', through: {
  model: Follow
}});

Follow.addHook('afterCreate', 'follow', follow => {
  Nofitcation.create({
    actorId: follow.userId,
    userId: follow.subjectId,
    type: NOTIFICATION_TYPES.follow
  })
})

Like.addHook('afterCreate', 'like', async like => {
  const post = await Post.find({ where: { id: like.postId } })
  Nofitcation.create({
    actorId: like.userId,
    userId: post.userId,
    type: NOTIFICATION_TYPES.like
  })
})

module.exports = sequelize
