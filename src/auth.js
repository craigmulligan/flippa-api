const jwt = require('jsonwebtoken')
const jwtMiddleware = require('express-jwt')
const twilio = require('twilio')(
  process.env.TWILIO_SSID,
  process.env.TWILIO_TOKEN
)
const fromNumber = process.env.TWILIO_FROM
const SECRET = process.env.SECRET

const isAdminOrSelf = (user, id) => {
  if (!user.isAdmin && user.id !== id) {
    throw Error('Unauthorized')
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
  getToken
}
