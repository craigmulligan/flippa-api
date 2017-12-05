jest.mock('twilio')
const db = require('../__mocks__/db')
const data = require('../__mocks__/data')

const {
  Query,
  User,
  Mutation
} = require('../src/resolvers')

let context = {
  db,
}

const DUMMY_POST = {
  id: 3,
  title: 'Tennis racket',
  description: 'Mint condition',
  price: 99.99,
  archived: false
}

const contextWithUser = userId => ({
  ...context,
  user: data.users.find(u => u.id === userId) // user with userid == 0
})

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
  const res = await User.notifications({ id: 0 }, null, contextWithUser(0))
})

test('User.notifications should throw when Unauthorized', async() => {
  const prom = User.notifications({ id: 1 }, null, contextWithUser(0))

  await expect(prom).rejects.toHaveProperty('message', 'Unauthorized');
})

test('Mutation.createPost', async() => {
  const res = await Mutation.createPost(null, { input: DUMMY_POST }, contextWithUser(0))
  expect(res).toEqual({
    ...DUMMY_POST,
    userId: 0
  })
})

test('Mutation.createPost should throw when Unauthorized', async() => {
  const prom = Mutation.createPost(null, { input: DUMMY_POST }, context)
  await expect(prom).rejects.toHaveProperty('message', 'Unauthorized: Please login');
})

test('Mutation.followUser', async () => {
  const res = await Mutation.followUser(null, { id: 1 }, contextWithUser(0))
  expect(res).toEqual(data.follow.find(f => f = { subjectId: 1, userId: 0 }))
})

test('likePost', async () => {
  const res = await Mutation.likePost(null, { id: 3 }, contextWithUser(0))
  expect(res).toEqual(data.like.find(f => f = { postId: 3, userId: 0 }))
})
