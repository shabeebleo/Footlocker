var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const { doSignup } = require('./user-helpers');
const objectId = require('mongodb').ObjectId
const fs = require('fs');
const { resolve } = require('path');
module.exports = {

    doLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.name })

            if (admin) {
                if (admin.password === adminData.password) {
                    resolve({ status: true })

                }
                else {
                    resolve({ status: false })

                }
            } else {
                resolve({ status: false })
            }
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collections.USER_COLLECTION).find({}).toArray()
            resolve(allUsers)

        })
    },

    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: false } })
            resolve()
        })
    },

    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: true } })
            resolve()
        })
    },

    insertProducts: (productDetails) => {
        return new Promise((resolve, reject) => {
            productDetails.Price = parseInt(productDetails.Price)
            productDetails.Quantity = parseInt(productDetails.Quantity)
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productDetails)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
            resolve(allProducts)

        })
    },
    deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let images = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }, { images: 1 })
         
            images = images.images
            console.log(images.length);
            if (images.length > 0) {
                let imageNames = images.map((x) => {
                    x = `public/product-images/${x}`
                    return x
                })
                imageNames.forEach((element) => {
                    fs.existsSync(element) && fs.unlinkSync(element)
                });
            }
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) })

        })
    },
    editedProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {            
            let oldImage = null
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                if (proDetails.images.length == 0) {
                    proDetails.images=product.images
                } else {
                    oldImage = product.Images
                }
               
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Product: proDetails.Product,
                        Brand: proDetails.Brand,
                        Categories: proDetails.Categories,
                        Quantity: proDetails.Quantity,
                        Price: proDetails.Price,
                        Discription: proDetails.Discription,
                        images: proDetails.images

                    }
                }).then(()=>{
                    resolve(oldImage)
                })
            })
        })



    },


    getproductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((data) => {

                resolve(data)
            })
        })
    },




    insertCategories: (CategoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(CategoryDetails)
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let allCategories = await db.get().collection(collections.CATEGORY_COLLECTION).find({}).toArray()

            resolve(allCategories)
        })
    },
    delCategory:(catId)=>{
        db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)})

    }
}

