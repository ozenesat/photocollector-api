const mongoose = require('mongoose')

const photoSchema = new mongoose.Schema({
  photoUrl: {
    type: String,
    required: true
  },
  photographer: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Photo', photoSchema)
