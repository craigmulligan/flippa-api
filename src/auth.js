const jwt = require('jsonwebtoken')
const jwtMiddleware = require('express-jwt')
const constants = require('./constants')
const twilio = require('twilio')(constants.TWILIO_SSID, constants.TWILIO_TOKEN)
const PhoneNumber = require('awesome-phonenumber')
const request = require('request-promise')

const clickatell = (apiKey) => (to, content) => {
  return request({
    uri: 'https://platform.clickatell.com/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey ,
       'accept': 'application/json'
    },
    ecdhCurve: 'auto',
    body: JSON.stringify({
      content,
      to: [to.slice(1)]
    })
  })
}

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
  try {
    const pn = new PhoneNumber(phoneNumber)
    const countryCode = pn.getRegionCode()
    const code = Math.floor(1000 + Math.random() * 9000)
    const msg = `Your verification code is: ${code}`
    if (countryCode === 'ZA') {
      await clickatell(constants.CLICKATELL_API_KEY)(phoneNumber, msg) 
    } else {
      await twilio.messages.create({
        to: phoneNumber,
        from: fromNumber,
        body: msg 
      })
    }
    return code
  } catch (err) {
    console.log(err)
    throw err
  }
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
