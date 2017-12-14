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

const processUpload = async ({ file, user }) => {
  const data = await file
  return await storeUpload({
    ...data,
    user
  })
}

const storeUpload = ({ stream, filename, mimetype, user }) => {
  const uploadPath = `${user.id}/${filename}`
  debug(`uploading ${uploadPath}`)
  debug({
    stream,
    filename,
    mimetype
  })

  return new Promise((resolve, reject) => {
    const file = bucket.file(uploadPath)
    const rStream = file.createWriteStream({
      metadata: {
        contentType: mimetype
      }
    })

    stream
      .pipe(rStream)
      .on('finish', () => {
        resolve({ name: filename, url: getPublicUrl(uploadPath) })
      })
      .on('error', reject)
  })
}

module.exports = processUpload
