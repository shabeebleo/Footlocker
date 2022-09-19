
var userHelpers = require('../helpers/user-helpers')
var twilioHelpers = require('../helpers/twilio-helper')
const { response } = require('express')



module.exports = {
  getSignUp: function (req, res) {
    res.render('user/signUp')
  },

  postSignUp: function (req, res) {
    twilioHelpers.doSms(req.body).then((data) => {
      req.session.body = req.body
      if (data) {
        res.render('/otp')
      } else {
        res.redirect('/signUp')
      }
    })
  },

  postOtp: (req, res, next) => {
    twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
      userHelpers.doSignup(req.session.body).then((response) => {
        res.redirect('/login')
      })
    })
  },

  getLogin: function (req, res) {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('user/login');
    }
  },

  postLogin: async function (req, res) {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user;
        res.redirect('/')
      } else {
        res.redirect('/login')
      }
    })
  },

  getHomepage: async function (req, res) {
    userDetails = req.session.user
    if (req.session.user) {
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      var cartCount = await userHelpers.getCartCount(req.session.user._id)


    }

    console.log(cartCount);
    userHelpers.getAllProducts().then((allProducts) => {
      res.render('user/user-home', { user: true, userDetails,wishlistCount, cartCount, allProducts })
    })
  },


  getProfile: function (req, res) {
    var userDetails = req.session.user
    res.render('user/profile', { user: true, userDetails })
  },

  getProductDetails: async (req, res) => {

    const userDetails = req.session.user
    var  wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    userHelpers.proDetails(req.params.id).then((productDetails) => {
      res.render('user/productDetails', { productDetails, user: true,wishlistCount, cartCount: req.session.cartVolume, userDetails })
    })
  },

  getShopCategory: async (req, res) => {

    try {
      if (req.session.user) {
        var cartCount = await userHelpers.getCartCount(req.session.user._id)
        req.session.cartVolume = cartCount;
         var  wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      }
      const allCategories = await userHelpers.getAllCat()
      const allProducts = await userHelpers.getAllProducts()
      res.render('user/shopCategory', { user: true, allProducts, cartCount,wishlistCount, userDetails: req.session.user, allCategories })

    } catch (error) {
      console.log(error);
      res.redirect('/')
    }

  },

  getMenCategory: (req, res) => {
    userHelpers.getAllProductsCat("Men").then((allCatProducts) => {
      let category = "Men"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getWomenCategory: (req, res) => {
    userHelpers.getAllProductsCat("Women").then((allCatProducts) => {
      let category = "Women"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getKidsCategory: (req, res) => {
    userHelpers.getAllProductsCat("kids").then((allCatProducts) => {
      let category = "kids"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getUnisexCategory: (req, res) => {
    userHelpers.getAllProductsCat("Unisex").then((allCatProducts) => {
      let category = "Unisex"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getLogout: function (req, res) {
    req.session.loggedIn = false
    req.session.user = null
    res.redirect('/')
  },



  getAddToCart: function (req, res) {
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })

    })

    // res.redirect('/shopCategory')
  },


  getCart: async function (req, res, next) {
    var userDetails = req.session.user
    let cartCount = null
    if (userDetails) {
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let cartCount = await userHelpers.getCartCount(req.session.user._id)
      var totalValue = await userHelpers.getTotalAmount(req.session.user._id)
      let products = await userHelpers.getCartProducts(req.session.user._id)
      console.log(products, "leoo");
      res.render('user/cart', { userDetails, totalValue,wishlistCount, cartCount, user: true, products })
    } else {
      res.redirect('/login')
    }
  },

  getAddToWishlist: function (req, res) {
    userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })

    })
  },


  getWishlist: async function (req, res, next) {
    var userDetails = req.session.user
    let wishlistCount = null
    if (userDetails) {
      var cartCount = await userHelpers.getCartCount(req.session.user._id)
      req.session.cartVolume = cartCount;
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let products = await userHelpers.getWislistProducts(req.session.user._id)
      console.log(products, "leoo");
      res.render('user/wishlist', { userDetails,cartCount,wishlistCount, user: true, products})
    } else {
      res.redirect('/login')
    }
  },

  postChangeProductQuantity: async (req, res) => {
    try {
      let response = await userHelpers.changeProductQuantity(req.body)
      response.proTotal = await userHelpers.postProTotal(req.body.user, req.body.product)
      response.total = await userHelpers.getTotalAmount(req.session.user._id)
      console.log(response);
      res.json(response)
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
  },

  postdelCartPro: async (req, res) => {
    try {
      const response = await userHelpers.delCartPro(req.body)
      res.json(response)
    } catch (error) {
      res.redirect('/')
    }


  },


  postdelWishlistPro:async(req,res)=>{
    try {
      const response = await userHelpers.delWishlistPro(req.body)
      res.json(response)
    } catch (error) {
      res.redirect('/')
    }
  },

  getCheckOut: async (req, res) => {
    try {
      if (req.session.user) {
        let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        console.log(total);
        var cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.render('user/checkout', { total, user: true,wishlistCount, cartCount, userDetails: req.session.user })
      }

    } catch (error) {
      console.log(error);
      res.redirect('/')

    }
  }


}
