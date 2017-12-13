const Chance = require('chance')
const constants = require('../src/constants')
const sequelize = require('../src/db')
const chance = new Chance()

let posts = []
let db = []
for (let i = 0; i <= 100; i++){
  posts[i] = { 
    title: chance.word(),
    description: chance.paragraph(),
    price: chance.floating({min: 0, max: 100, fixed: 8}),
    fileId: 1,
    userId: chance.integer({min: 1, max: 20})
  }
}

sequelize.sync({ force: false })
  .then((database) => {
    db = database 
    return db.models.post.bulkCreate(posts)
  })
  .then(() => {
   return db.models.post.findAll()
  })
  .then((posts) => {
    console.log(posts)
    process.exit(0)
  })
