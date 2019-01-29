const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const foodRouter = express.Router();
foodRouter.use(bodyParser.json());
const multer = require('multer');

const Foods = require('../models/food');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/food');
    },

    filename: (req, file, cb) => {
        cb(null, Math.random() + file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter});


foodRouter.route('/upload')
.options(cors.cors, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file.filename);
})

foodRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Foods.find(req.query)
    .then((foods) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(foods);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'), (req,res,next) => {
    Foods.create(req.body)
    .then((food) => {
        console.log('food Created', food);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(food);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /foods');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Foods.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

foodRouter.route('/:foodName')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if(food != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(food);
        }
        else {
            err = new Error('food ' + req.params.foodName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /foods/ ' + req.params.foodName);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Foods.findOneAndUpdate({"name": req.params.foodName}, {
        $set: req.body
    }, { new: true})
    .then((food) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(food);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Foods.findOneAndRemove({"name": req.params.foodName})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


foodRouter.route('/:foodName/products')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if (food != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(food.products);
        }
        else {
            err = new Error('food ' + req.params.foodName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if (food != null) {
            food.products.push(req.body);
            food.save()
            .then((food) => {
                Foods.findById(food._id)
                .then((food) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(food);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('food ' + req.params.foodName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /foods/ ' + req.params.foodName + '/comments');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if (food != null) {
            for (var i = (food.products.length -1); i >= 0; i--) {
                food.products.id(food.products[i]._id).remove();
            }
            food.save()
            .then((food) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(food);
            }, (err) => next(err));
        }
        else {
            err = new Error('food ' + req.params.foodName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


foodRouter.route('/:foodName/products/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if (food != null && food.products.id(req.params.productId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(food.products.id(req.params.productId));
        }
        else if (food == null) {
            err = new Error('food ' + req.params.foodName + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Product ' + req.params.productId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /foods/ ' + req.params.foodName
        + '/products/' + req.params.productId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if (food != null && food.products.id(req.params.productId) != null) {
            if (req.body.nameEN) {
                food.products.id(req.params.productId).nameEN = req.body.nameEN;
            }
            if (req.body.nameAR) {
                food.products.id(req.params.productId).nameAR = req.body.nameAR;
            }
            if (req.body.nameTR) {
                food.products.id(req.params.productId).nameTR = req.body.nameTR;
            }
            if (req.body.descriptionEN) {
                food.products.id(req.params.productId).descriptionEN = req.body.descriptionEN;
            }
            if (req.body.descriptionAR) {
                food.products.id(req.params.productId).descriptionAR = req.body.descriptionAR;
            }
            if (req.body.descriptionTR) {
                food.products.id(req.params.productId).descriptionTR = req.body.descriptionTR;
            }
            if (req.body.ilean) {
                food.products.id(req.params.productId).ilean = req.body.ilean;
            }
            if (req.body.allow) {
                food.products.id(req.params.productId).allow = req.body.allow;
            }
            if (req.body.imgOne) {
                food.products.id(req.params.productId).imgOne = req.body.imgOne;
            }
            if (req.body.imgTwo) {
                food.products.id(req.params.productId).imgTwo = req.body.imgTwo;
            }
            food.save()
            .then((food) => {
                Foods.findById(food._id)
                .then((food) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(food);
                })
            }, (err) => next(err));
        }
        else if (food == null) {
            err = new Error('food ' + req.params.foodId + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Product ' + req.params.productId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Foods.findOne({"name": req.params.foodName})
    .then((food) => {
        if (food != null && food.products.id(req.params.productId) != null) {
            food.products.id(req.params.productId).remove();
            food.save()
            .then((food) => {
                Foods.findById(food._id)
                .then((food) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(food);
                })
            }, (err) => next(err));
        }
        else if (food == null) {
            err = new Error('food ' + req.params.foodName + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Product ' + req.params.productId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = foodRouter;

