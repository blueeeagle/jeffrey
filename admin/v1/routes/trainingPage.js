const express = require('express')
const router = express.Router()
const adminAuth = require('../../../middleware/adminauth')
const triningData = require('../../../models/trainigVideo')
const upload = require('../../../middleware/s3image')
const userData = require('../../../models/usermodel')
const userAuth = require('../../../middleware/authuser')

router.get('/', adminAuth.authenticateAdmin, async function (req, res) {
  const triningVideo = await triningData.find().lean()
  res.render('trainingPage', { title: 'Training Page', data:triningVideo })
})

//add PDF
router.post(
  '/addTrainingVideo',
  adminAuth.authenticateAdmin,
  upload.upload.single('video'),
  async function (req, res) {
    try {
      const videoURL = req.file.location

      let {title,description} = req.body

      // Add a new PDF
      const newPdf = new triningData({
        title: title,
        description: description,
        video: videoURL
      })
      await newPdf.save()

      // Set flash message
      req.flash('success_msg', 'Video uploaded successfully')
      res.redirect('/trainingPage')
    } catch (error) {
      console.error(error)
      req.flash('error_msg', 'Oops something went wrong')
      return res.redirect('/trainingPage')
    }
  }
)

//delete video
router.post(
    '/deleteVideo',
    adminAuth.authenticateAdmin,
    async function (req, res) {
      try {
        const { id } = req.body
  
        // Find the record in the database
        const video = await triningData.findById(id)
  
        console.log('video.....', video)
  
        if (!video) {
          req.flash('error_msg', 'Record not found')
          return res.redirect('/trainingPage') // Redirect to an appropriate URL
        }
  
        // Delete the file from the S3 bucket
        let deletePDF = await upload.s3
          .deleteObject({
            Bucket: 'jefferys-s3',
            Key: video.video
          })
          .promise()
  
        if (deletePDF) {
          // Delete the corresponding record from the database
          await triningData.deleteOne({ _id: id })
  
          req.flash(
            'success_msg',
            'File and database record deleted successfully'
          )
          return res.redirect('/trainingPage') // Redirect to an appropriate URL
        }
      } catch (error) {
        console.error(error)
        req.flash('error_msg', 'Failed to delete file and database record')
        res.redirect('/trainingPage') // Redirect to an appropriate URL
      }
    }
  )

//get video web side
router.get('/getVideo', userAuth, async function (req, res) {
    try {
      const userId = req.user.id
      const user = await userData.findById(userId)
      if (!user) {
        return res.send({ status: 0, message: 'User not found' })
      }
  
      // Query the database to find data for the current month
      const videosTraining = await triningData.find().lean()
  
      if (!videosTraining) {
        return res.send({
          status: 0,
          message: 'Data not available for the current month'
        })
      }
  
      res.send({ status: 1, message: 'Monthly Menu PDF', data: videosTraining })
    } catch (error) {
      console.error(error)
      res.status(500).send({ status: 0, message: 'Internal server error' })
    }
  })
module.exports = router
