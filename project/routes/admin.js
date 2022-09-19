const { Router } = require('express');
var express = require('express');
var router = express.Router();
const multer = require('multer');
const { FindOperators } = require('mongodb');

const adminController=require('../controller/adminController')

// const { route } = require('./user');
/* GET users listing. */

// ..............multer.........//

const storage = multer.diskStorage({
  destination: "public/product-images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  },
});

const uploads = multer({
  storage
});

// ..............loginpage.........//
router.get('/',adminController.getLoginpage)

// .......admin Login...........//
router.post('/',adminController.postLoginpage)

// ..............homepage.........//
router.get('/adminHome',adminController.getAdminHome);

// ..............order........//
router.get('/orders',adminController.getOrders)

// ..............user list .........//
router.get('/users',adminController.getUsers)

// ........blockUser.........//
router.get('/blockUser/:id',adminController.getBlockUser)

// ........unblockUser.........//
router.get('/unblockUser/:id', adminController.getUnblockUser)

// .......addProducts ...........//
router.get('/addProduct',adminController.getAddProduct )
router.post('/addProduct', uploads.array("image", 3), adminController.postAddProduct)

// ..............view products.........//
router.get('/viewProducts', adminController.getViewProducts)

// ..............Delete products.........//
router.get('/DeleteProduct/:id', adminController.getDeleteProduct)

// ..............edit products.........//
router.get('/editProduct/:id', adminController.getEditProduct)
router.post('/editProduct/:id',uploads.array('image',3),adminController.postEditProduct)


// ..............category.........//
router.get('/categories', adminController.getCategories)
router.post('/categories', adminController.postCategories)
router.get('/deleteCategory/:id',adminController.getDeleteCategory)









module.exports = router;
