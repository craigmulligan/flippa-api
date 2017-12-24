const Chance = require('chance')
const constants = require('../src/constants')
const sequelize = require('../src/db')
const chance = new Chance()
const tags = require('../src/db/tags').map(t => ({
  title: t
}))
const files = require('./files')

let posts = []
let db = []
for (let i = 0; i <= 100; i++){
  posts[i] = { 
    title: chance.word(),
    description: chance.paragraph(),
    price: chance.floating({min: 0, max: 100, fixed: 2}),
    userId: chance.integer({min: 1, max: 20}),
  }
}
sequelize.sync({ force: false })
  .then((database) => {
    db = database 
    return Promise.all([
      db.models.tag.bulkCreate(tags),
      db.models.file.bulkCreate(files),
    ]
    )
  })
  .then(() => {
    return db.models.post.bulkCreate(posts) 
  })
  .then(() => {
   return db.models.post.findAll()
  })
  .then((posts) => {
    const tagProms = posts.map(p => {
      return p.setTags([
        chance.integer({ min: 1, max: 4 })
      ])
    })
    const fileProms = posts.map(p => {
      return p.setFiles([
        chance.integer({ min: 1, max: 2 })
      ])
    })
    
    console.log(fileProms)
    return Promise.all([
      ...tagProms,
      ...fileProms
    ])
  })
  .then(() => {
    console.log('success')
    process.exit(0)
  })
