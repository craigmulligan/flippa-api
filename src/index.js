const fs = require('fs')
const path = require('path')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const DB = require('./db')

// `4Yrg98Io4W3GOdv2`
const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const schemaFile = path.join(__dirname, 'schema.graphql')
const typeDefs = fs.readFileSync(schemaFile, 'utf8')

const schema = makeExecutableSchema({ typeDefs, resolvers })
const start = async () => {
  // make database connections
  try {
    const db = await DB.sync();

    const app = express();
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        graphiql: true,
        context: { db },
    }));
    app.listen(4000);
  } catch (err) {
    throw err
  }
};

start()
