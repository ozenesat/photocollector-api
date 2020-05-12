// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// pull in Mongoose model for photos
const Photo = require('../models/photo')

// for rest request to unsplash
const axios = require('axios').default
// for access key of unsplash
require('dotenv').config()

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { photo: { title: '', text: 'foo' } } -> { photo: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /photos
router.get('/photos', requireToken, (req, res, next) => {
  Photo.find()
    .then(photos => {
      // `photos` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return photos.map(photo => photo.toObject())
    })
    // respond with status 200 and JSON of the photos
    .then(photos => res.status(200).json({ photos: photos }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /photos/5a7db6c74d55bc51bdf39793
router.get('/photos/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Photo.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "photo" JSON
    .then(photo => res.status(200).json({ photo: photo.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /photos
router.post('/photos', requireToken, (req, res, next) => {
  // set owner of new photo to be current user
  req.body.photo.owner = req.user.id

  Photo.create(req.body.photo)
    // respond to succesful `create` with status 201 and JSON of new "photo"
    .then(photo => {
      res.status(201).json({ photo: photo.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /photos/5a7db6c74d55bc51bdf39793
router.patch('/photos/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.photo.owner

  Photo.findById(req.params.id)
    .then(handle404)
    .then(photo => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, photo)

      // pass the result of Mongoose's `.update` to the next `.then`
      return photo.updateOne(req.body.photo)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /photos/5a7db6c74d55bc51bdf39793
router.delete('/photos/:id', requireToken, (req, res, next) => {
  Photo.findById(req.params.id)
    .then(handle404)
    .then(photo => {
      // throw an error if current user doesn't own `photo`
      requireOwnership(req, photo)
      // delete the photo ONLY IF the above didn't throw
      photo.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// GET ~ random photos
router.get('/random', (req, res) => {
  console.log('ESAT ESAT ESAT!!!!!!!!', process.env)
  axios({
    url: `https://api.unsplash.com/photos/random?count=7&client_id=${process.env.CLIENT_ID}`,
    method: 'GET'
  })
    .then(photo => {
      // console.log(photo)
      res.status(201).send({ photos: photo.data })
    })
    .catch(err => {
      res.send({ err })
    })
})

// GET ~ search photos by keyword
router.get('/search', (req, res) => {
  console.log(req)
  axios({
    url: `https://api.unsplash.com/search/photos?page=1&query=${req.query.search}&client_id=${process.env.CLIENT_ID}`,
    method: 'GET'
  })
    .then(photo => {
      // console.log(photo)
      res.status(201).send({ photos: photo.data })
    })
    .catch(err => {
      res.send({ err })
    })
})

module.exports = router
