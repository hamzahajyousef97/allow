const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const cleanRouter = express.Router();
cleanRouter.use(bodyParser.json());
const multer = require('multer');

const Cleans = require('../models/clean');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/clean');
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


cleanRouter.route('/upload')
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

cleanRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Cleans.find(req.query)
    .then((cleans) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(cleans);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'), (req,res,next) => {
    Cleans.create(req.body)
    .then((clean) => {
        console.log('clean Created', clean);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(clean);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /cleans');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Cleans.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



cleanRouter.route('/:cleanName')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if(clean != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(clean);
        }
        else {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /cleans/' + req.params.cleanName);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Cleans.findOneAndUpdate({"name": req.params.cleanName}, {
        $set: req.body
    }, { new: true})
    .then((clean) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(clean);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Cleans.findOneAndRemove({"name": req.params.cleanName})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


cleanRouter.route('/:cleanName/products')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if (clean != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(clean.products);
        }
        else {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if (clean != null) {
            clean.products.push(req.body);
            clean.save()
            .then((clean) => {
                Cleans.findById(clean._id)
                .then((clean) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(clean);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /cleans/' + req.params.cleanName + '/comments');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if (clean != null) {
            for (var i = (clean.products.length -1); i >= 0; i--) {
                clean.products.id(clean.products[i]._id).remove();
            }
            clean.save()
            .then((clean) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(clean);
            }, (err) => next(err));
        }
        else {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


cleanRouter.route('/:cleanName/products/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if (clean != null && clean.products.id(req.params.productId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(clean.products.id(req.params.productId));
        }
        else if (clean == null) {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
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
    res.end('POST operation not supported on /cleans/' + req.params.cleanName
        + '/products/' + req.params.productId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if (clean != null && clean.products.id(req.params.productId) != null) {
            if (req.body.nameEN) {
                clean.products.id(req.params.productId).nameEN = req.body.nameEN;
            }
            if (req.body.nameAR) {
                clean.products.id(req.params.productId).nameAR = req.body.nameAR;
            }
            if (req.body.nameTR) {
                clean.products.id(req.params.productId).nameTR = req.body.nameTR;
            }
            if (req.body.descriptionEN) {
                clean.products.id(req.params.productId).descriptionEN = req.body.descriptionEN;
            }
            if (req.body.descriptionAR) {
                clean.products.id(req.params.productId).descriptionAR = req.body.descriptionAR;
            }
            if (req.body.descriptionTR) {
                clean.products.id(req.params.productId).descriptionTR = req.body.descriptionTR;
            }
            if (req.body.ilean) {
                clean.products.id(req.params.productId).ilean = req.body.ilean;
            }
            if (req.body.allow) {
                clean.products.id(req.params.productId).allow = req.body.allow;
            }
            if (req.body.imgOne) {
                clean.products.id(req.params.productId).imgOne = req.body.imgOne;
            }
            if (req.body.imgTwo) {
                clean.products.id(req.params.productId).imgTwo = req.body.imgTwo;
            }
            clean.save()
            .then((clean) => {
                Cleans.findOne(clean)
                .then((clean) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    console.log(clean);
                    res.json(clean);
                })
            }, (err) => next(err));
        }
        else if (clean == null) {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
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
    Cleans.findOne({"name": req.params.cleanName})
    .then((clean) => {
        if (clean != null && clean.products.id(req.params.productId) != null) {
            clean.products.id(req.params.productId).remove();
            clean.save()
            .then((clean) => {
                Cleans.findById(clean._id)
                .then((clean) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(clean);
                })
            }, (err) => next(err));
        }
        else if (clean == null) {
            err = new Error('clean ' + req.params.cleanName + ' not found ');
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

module.exports = cleanRouter;

