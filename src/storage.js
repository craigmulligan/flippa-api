// https://medium.com/google-cloud/upload-images-to-google-cloud-storage-with-react-native-and-expressjs-61b8874abc49
const storage = require('@google-cloud/storage')
const constants = require('./constants')
const debug = require('debug')('storage')

const gcs = storage({
  projectId: constants.GCS_PROJECT_ID,
  keyFilename: constants.GOOGLE_APPLICATION_CREDENTIALS
})

const bucketName = constants.GCS_BUCKET
const bucket = gcs.bucket(bucketName)

function getPublicUrl(filename) {
  return 'https://storage.googleapis.com/' + bucketName + '/' + filename
}

const processUpload = async upload => {
  const data = await upload
  return await storeUpload(data)
}

const storeUpload = ({ stream, filename, mimetype }) => {
  return new Promise(function(resolve, reject) {
    const file = bucket.file(filename)
    const rStream = file.createWriteStream({
      metadata: {
        contentType: mimetype
      }
    })

    stream
      .pipe(rStream)
      .on('finish', () => resolve({ filename, url: getPublicUrl(filename) }))
      .on('error', reject)
  })
}

module.exports = processUpload
