const mongoose = require('mongoose')
const Schema = mongoose.Schema

const videoSchema = new Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  video: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

const videoUpload = mongoose.model('videoUpload', videoSchema)

module.exports = videoUpload
