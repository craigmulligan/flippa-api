const jwt = require('jsonwebtoken')
const jwtMiddleware = require('express-jwt')
const constants = require('./constants')
const twilio = require('twilio')(constants.TWILIO_SSID, constants.TWILIO_TOKEN)

const fromNumber = constants.TWILIO_FROM
const SECRET = constants.SECRET

const isAdminOrSelf = (user, id) => {
  if (!user.isAdmin && user.id !== id) {
    throw Error('Unauthorized')
  }
}

const isLoggedIn = user => {
  if (!user) {
    throw Error('Unauthorized: Please login')
  }
}

const sendCode = async phoneNumber => {
  const code = Math.floor(Math.random() * 999999 + 111111)
  await twilio.messages.create({
    to: phoneNumber,
    from: fromNumber,
    body: `Your verification code is: ${code}`
  })

  return code
}

const getToken = data => jwt.sign(data, SECRET)

const middleware = jwtMiddleware({ secret: SECRET, credentialsRequired: false })

module.exports = {
  sendCode,
  isAdminOrSelf,
  middleware,
  getToken,
  isLoggedIn
}
