const express = require('express')
const router = express.Router()
const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

router.get('/admin/restaurants', adminController.getRestaurants)
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurant/:id', adminController.getRestaurant)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

router.get('/admin/categories', categoryController.getCategories)

module.exports = router