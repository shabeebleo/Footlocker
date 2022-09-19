var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')



//  user signup  //
router.get('/signUp', userController.getSignUp)
router.post('/signUp', userController.postSignUp)
router.post('/otp', userController.postOtp)

//  user login  //.
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

//  user homepage    //
router.get('/', userController.getHomepage);

//  user Profile  //
router.get('/profile', userController.getProfile);

//  user shop   //
router.get('/shopCategory', userController.getShopCategory)

//  product details  //
router.get('/productDetails/:id', userController.getProductDetails)

//   category    //
router.get('/menCategory', userController.getMenCategory)
router.get('/womenCategory', userController.getWomenCategory)
router.get('/kidsCategory', userController.getKidsCategory)
router.get('/unisexCategory', userController.getUnisexCategory)

//   cart  //
router.get('/cart/:id',userController.getCart)
router.post('/delete-cart-product',userController.postdelCartPro)

//   add to cart  //
router.get('/addToCart/:id', userController.getAddToCart)

//   add to wishlist  //
router.get('/addToWishlist/:id', userController.getAddToWishlist)

// wishlist//
router.get('/wishList/:id',userController.getWishlist)
router.post('/delete-wishlist-product',userController.postdelWishlistPro)

//  user logout   //
router.get('/logout', userController.getLogout)

//change product quantity//
router.post('/change-product-quantity',userController.postChangeProductQuantity)

//checkOut Page//
router.get('/checkout',userController.getCheckOut)



module.exports = router;
