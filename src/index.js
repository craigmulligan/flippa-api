require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const Multer = require('multer')
const storage = require('./storage')
const debug = require('debug')('server')
const bodyParser = require('body-parser')

const DB = require('./db')

const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')
const { middleware } = require('./auth')

const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
})

// get graphql schema
const schemaFile = path.join(__dirname, 'schema.graphql')
const typeDefs = fs.readFileSync(schemaFile, 'utf8')
const schema = makeExecutableSchema({ typeDefs, resolvers })

const start = async () => {
  try {
    const db = await DB.sync()
    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use(middleware)

    app.get('/ping', (req, res) => res.send('OK'))

    // the multer accessing the key 'image', as defined in the `FormData` object on the front end
    // Passing the uploadToGcs function as middleware to handle the uploading of req.file
    app.post('/upload', multer.single('image'), storage, function(req, res) {
      const data = req.body
      if (req.file && req.file.cloudStoragePublicUrl) {
        data.imageUrl = req.file.cloudStoragePublicUrl
      }
      res.send(data)
    })

    app.use(
      '/api',
      graphqlHTTP(req => ({
        schema: schema,
        graphiql: true,
        context: { db, user: req.user }
      }))
    )

    app.use(function(err, req, res) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...')
      }

      debug(err)
      res.status(500).send(err)
    })

    app.listen(4000)
  } catch (err) {
    throw err
  }
}

start()
