const Chance = require('chance')
const constants = require('../src/constants')
const sequelize = require('../src/db')
const chance = new Chance()
const tags = require('../src/db/tags').map(t => ({
  title: t
}))

let posts = []
let db = []
for (let i = 0; i <= 100; i++){
  posts[i] = { 
    title: chance.word(),
    description: chance.paragraph(),
    price: chance.floating({min: 0, max: 100, fixed: 8}),
    userId: chance.integer({min: 1, max: 20})
  }
}
sequelize.sync({ force: false })
  .then((database) => {
    db = database 
    return db.models.tag.bulkCreate(tags)
  })
  .then(() => {
    return db.models.post.bulkCreate(posts, {
      include: [ db.models.tag ]
    }) 
  })
  .then(() => {
   return db.models.post.findAll()
  })
  .then((posts) => {
    const tagProms = posts.map(p => {
      p.setTags([
        chance.integer({ min: 1, max: 4 })
      ])
    })
    const fileProms = posts.map(p => {
      p.setTags([
        chance.integer({ min: 1, max: 4 })
      ])
    })

    return Promise.all([
      ...tagProms,
      ...fileProms
    ])
  })
  .then(() => {
    console.log('success')
    process.exit(0)
  })
