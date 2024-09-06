const express = require('express')
const router = express.Router()
const adminAuth = require('../../../middleware/adminauth')
const monthPdfs = require('../../../models/pdfUpload')
const upload = require('../../../middleware/s3image')
const userData = require('../../../models/usermodel')
const userAuth = require('../../../middleware/authuser')

router.get('/', adminAuth.authenticateAdmin, async function (req, res) {
  const monthsPDFs = await monthPdfs.find().lean()

  res.render('monthlymenu', { title: 'Monthly Menu Add', data: monthsPDFs })
})

//add PDF
router.post(
  '/addMonthPDF',
  adminAuth.authenticateAdmin,
  upload.upload.single('menuPdf'),
  async function (req, res) {
    try {
      const imageUrl = req.file.location
      // Add a new PDF
      const newPdf = new monthPdfs({
        pdfName: req.body.pdfName,
        fileUrl: imageUrl
      })
      await newPdf.save()

      // Set flash message
      req.flash('success_msg', 'PDF uploaded successfully')

      res.redirect('/monthlymenu')
    } catch (error) {
      console.error(error)
      req.flash('error_msg', 'Oops something went wrong')
      return res.redirect('/monthlymenu')
    }
  }
)

//delete file
router.post(
  '/deletePDF',
  adminAuth.authenticateAdmin,
  async function (req, res) {
    try {
      const { id } = req.body

      // Find the record in the database
      const pdf = await monthPdfs.findById(id)

      console.log('pdf.....', pdf)

      if (!pdf) {
        req.flash('error_msg', 'Record not found')
        return res.redirect('/monthlymenu') // Redirect to an appropriate URL
      }

      // Delete the file from the S3 bucket
      let deletePDF = await upload.s3
        .deleteObject({
          Bucket: 'jefferys-s3',
          Key: pdf.fileUrl
        })
        .promise()

      if (deletePDF) {
        // Delete the corresponding record from the database
        await monthPdfs.deleteOne({ _id: id })

        req.flash(
          'success_msg',
          'File and database record deleted successfully'
        )
        return res.redirect('/monthlymenu') // Redirect to an appropriate URL
      }
    } catch (error) {
      console.error(error)
      req.flash('error_msg', 'Failed to delete file and database record')
      res.redirect('/monthlymenu') // Redirect to an appropriate URL
    }
  }
)

//view app pdf web side
router.get('/getMonthPDF', userAuth, async function (req, res) {
  try {
    const userId = req.user.id
    const user = await userData.findById(userId)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    // Query the database to find data for the current month
    const monthData = await monthPdfs.find()

    if (!monthData) {
      return res.send({
        status: 0,
        message: 'Data not available for the current month'
      })
    }

    res.send({ status: 1, message: 'Monthly Menu PDF', data: monthData })
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 0, message: 'Internal server error' })
  }
})

module.exports = router
