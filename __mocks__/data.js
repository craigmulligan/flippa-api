const posts = [
  {
    id: 0,
    title: 'Nike air force 1s',
    description: 'Lit sneeks',
    price: 100,
    archived: false
  },
  {
    id: 1,
    title: 'Vintage wolksvagen',
    description: 'created in the 70s',
    price: 1000.76,
    archived: true
  }
]

const users = [
  {
    id: 0,
    displayName: 'craig',
    verificationCode: '1234',
    phoneNumber: '+440000000000',
    location: 'london'
  },
  {
    id: 2,
    displayName: 'taahir',
    verificationCode: '6758',
    phoneNumber: '+441111111111',
    location: 'Cape Town'
  }
]

const notifications = [
  {
    id: 0,
    userId: 0,
    type: 'follow',
    actorId: 1,
    meta: '',
    read: false
  },
  {
    id: 0,
    userId: 0,
    type: 'like',
    actorId: 1,
    meta: '',
    read: false
  }
]

module.exports = {
  posts,
  users
}
