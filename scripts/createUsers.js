require('dotenv').config()
const Chance = require('chance')
const constants = require('../src/constants')
const chance = new Chance()
const sequelize = require('../src/db')
let users = []
let db = []

for (i = 0; i <= 20; i++) {
  users[i] = {
    displayName: chance.name(),
    phoneNumber: chance.phone({ country: 'uk', mobile: true }),
  }
}  

sequelize.sync({ force: true })
  .then((database) => {
    db = database
    return db.models.user.bulkCreate(users)
  })
  .then(() => {
   return db.models.user.findAll()
  })
  .then((users) => {
    console.log(users)
    process.exit(0)
  })

