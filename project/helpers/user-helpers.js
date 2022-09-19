var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const { response } = require('express');
const objectId = require('mongodb').ObjectId
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            userData.Active = true
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                resolve(data.insertedId)
            })
        })

    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}

            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status && user.Active) {

                        response.user = user;
                        response.status = true;
                        resolve(response)
                    }
                    else {

                        resolve({ status: false })
                    }

                })
            } else {

                resolve({ status: false })

            }
        })
    },

    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
                resolve(allProducts)
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllCat: () => {
        return new Promise(async (resolve, reject) => {
            const allCategory = await db.get().collection(collections.CATEGORY_COLLECTION).find({}, { _id: 0 }).toArray()
            resolve(allCategory)
        })
    },

    getAllProductsCat: (category) => {
        return new Promise(async (resolve, reject) => {
            let allCatProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({ Categories: category }).toArray()

            resolve(allCatProducts)
        })
    },
    proDetails: (proId) => {
        return new Promise(async (resolve, reject) => {
            productDetails = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
            resolve(productDetails)
        })
    },



    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        { $inc: { 'products.$.quantity': 1 } }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                    // products: [objectId(proId)]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },


    addToWishlist: (proId, userId) => {
        let proObj = {
            item: objectId(proId),

        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWishlist) {
                let proExist = userWishlist.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    resolve({ status: "already exist" })
                } else {
                    db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        })
                }
            } else {
                let wishlistObj = {
                    user: objectId(userId),
                    products: [proObj]
                    // products: [objectId(proId)]
                }
                db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                    resolve()
                })
            }
        })
    },





    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products' //products array  in the cart// 
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },


                    /////////////////////////to get product wise total/////////////////////
                    {
                        $project: {
                            item: '$item',
                            quantity: '$quantity',
                            product: '$product',
                            proTotal: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                        }

                    }

                    // {
                    //     $lookup: {
                    //         from: collections.PRODUCT_COLLECTION,
                    //         let: { proList: '$products' },
                    //         pipeline: [
                    //             {
                    //                 $match: {
                    //                     $expr: {
                    //                         $in: ['$_id', "$$proList"]
                    //                     }
                    //                 }
                    //             }
                    //         ],
                    //         as: 'cartItems'
                    //     }
                    // }
                ]).toArray()
                console.log(cartItems, "cartitems");
                resolve(cartItems)

            } catch (error) {
                reject(error)
            }
        })
    },



    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            console.log(count);
            resolve(count)
        })
    },


    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            count = 0
            let wishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlist) {
                count = wishlist.products.length
            }
            resolve(count)
        })
    },

    getWislistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wislistProducts = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'


                }
            ]).toArray()
            console.log(wislistProducts)
            resolve(wislistProducts)
        })
    },

    delWishlistPro: (details) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.WISHLIST_COLLECTION)
                    .updateOne({ _id: objectId(details.wishlist) },
                        { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                            resolve(response)
                        })
            } catch (error) {
                reject(error)
            }
        })
    },


    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)

        details.quantity = parseInt(details.quantity)

        return new Promise(async (resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    console.log('hiii');
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ _id: objectId(details.cart) },
                            { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                                resolve({ removeProduct: true })
                            })

                }
                else {
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }
                            }).then((response) => {

                                resolve({ status: true })
                            })
                }
            } catch (error) {
                reject(error)
            }
        })
    },






    delCartPro: (details) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                            resolve(response)
                        })
            } catch (error) {
                reject(error)
            }
        })
    },





    postProTotal: async (userId, proId) => {
        console.log(proId, 'proId');
        return new Promise(async (resolve, reject) => {
            try {
                let proTotal = await db.get().collection(collections.CART_COLLECTION).aggregate([

                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products' //products array  in the cart// 
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },

                    {

                        $unwind:
                            '$product'

                    },

                    // {
                    //     $match:{product:{_id:objectId(proId)}}
                    // }
                    {
                        $match: { "product._id": objectId(proId) }
                    },

                    {
                        $project: {
                            _id: 0,
                            proTotall: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                        }
                    }


                ]).toArray()
                console.log(proTotal[0], "proTotal user-help");
                resolve(proTotal[0])
            } catch (error) {
                reject(error)
            }
        })
    },



    getTotalAmount: (userId) => {
        console.log(userId, 'totalamount');
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }

                        }
                    },

                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        }
                    }



                ]).toArray()
                console.log(total[0], 'shabeeeeb');
                resolve(total[0])

            } catch (error) {
                reject(error)
            }
        })
    },



}

