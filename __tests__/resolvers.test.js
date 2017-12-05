jest.mock('twilio')
const db = require('../__mocks__/db')
const data = require('../__mocks__/data')

const {
  Query,
  User
} = require('../src/resolvers')

let context = {
  db,
}

test('Query.Posts', async() => {
  const res = await Query.Posts(null, null, context)
  expect(res).toBe(data.posts)
})

test('Query.Post', async() => {
  const res = await Query.Post(null, { id: 1 }, context)
  expect(res).toBe(data.posts.find(p => p.id === 1))
})

test('Query.Users', async() => {
  const res = await Query.Users(null, null, context)
  expect(res).toBe(data.users)
})

test('Query.User', async() => {
  const res = await Query.User(null, { id: 1 }, context)
  expect(res).toBe(data.users.find(p => p.id === 1))
})


test('User.notifications', async() => {
  const res = await User.notifications({ id: 0 }, null, {
    ...context,
    user: data.users.find(u => u.id === 0) // user with userid == 0
  })
})

test('User.notifications should throw when Unauthorized', async() => {
  const prom = User.notifications({ id: 1 }, null, {
    ...context,
    user: data.users.find(u => u.id === 0) // user with userid == 0
  })

  await expect(prom).rejects.toHaveProperty('message', 'Unauthorized');
})
