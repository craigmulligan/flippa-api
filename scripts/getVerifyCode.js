const DB = require('../src/db')

DB.sync()
  .then((db) => {
    return db.models.user.findById(22)
  })
  .then(console.log)
  .then(() => process.exit(0))
