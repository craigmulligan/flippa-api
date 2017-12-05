const path = require('path')

module.exports = {
  SECRET: process.env.SECRET || 'shhhhh',
  TWILIO_SSID: process.env.TWILIO_SSID || 'foo',
  TWILIO_TOKEN: process.env.TWILIO_TOKEN || 'foo',
  TWILIO_FROM: process.env.TWILIO_FROM || '+441743562267',
  DB_CONNECTION:
    process.env.DB_CONNECTION || 'postgresql://localhost:5432/flippa',
  GCS_BUCKET: process.env.GCS_BUCKET || 'flippa-dev',
  GCS_PROJECT_ID: process.env.GCS_PROJECT_ID || 'flippa-35259',
  GOOGLE_APPLICATION_CREDENTIALS:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.resolve(`${__dirname}/gcs-keyfile.json`)
}
