'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  multer = require('multer'),
  Meal = db.meal;

const {Op} = require('sequelize');
/**
 * Create a meal
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();
  req.body.userId = req.user.id;

  // Separate endpoint to upload the meal image
  delete req.body.mealImageURL;
  
  if(!req.body.menuId) {
      return res.status(400).send({
        message: "Please include menu id"
      });
  } else {
    req.body.menuId = req.menu.id;
    Meal.create(req.body).then(function(meal) {
      if (!meal) {
        return res.send('/', {
          errors: 'Could not create the meal'
        });
      } else {
        res.jsonp({meal: meal, message: "Meal successfully created"});
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
};

/**
 * Show the current meal
 */
exports.read = function(req, res) {
  res.jsonp({meal: req.meal, message: "Meal successfully found"});
};

/**
 * Update a meal
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.menuId;
  delete req.body.userId;
  var meal = req.meal;

  meal.update({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    // date: req.body.date,
    // price: req.body.price,
    visible: req.body.visible,
    // minQuantity: req.body.minQuantity,
    // maxQuantity: req.body.maxQuantity
  }).then(function(meal) {
    res.jsonp({meal: meal, message: "Meal successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/** 
 * Update meal image
 */
exports.changeMealPicture = function (req, res) {
  var meal = req.meal;
  var upload = multer(config.uploads.profileUpload).single('newMealPicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).mealUploadFileFilter;
  var existingImageUrl;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (meal) {
    existingImageUrl = meal.mealImageURL;
    uploadImage()
      .then(updateMeal)
      .then(deleteOldImage)
      .then(function () {
        res.json(meal);
      })
      .catch(function (err) {
        return res.status(422).send(err);
      });
  } else {
    return res.status(401).send({
      message: 'Meal not found'
    });
  }

  function uploadImage () {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateMeal () {
    return new Promise(function (resolve, reject) {
      meal.mealImageURL = config.uploads.profileUpload.dest + req.file.filename;
      meal.save(function (err, themeal) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function deleteOldImage () {
    return new Promise(function (resolve, reject) {
      if (existingImageUrl !== Meal.schema.path('mealImageURL').defaultValue) {
        fs.unlink(existingImageUrl, function (unlinkError) {
          if (unlinkError) {
            console.log(unlinkError);
            reject({
              message: 'Error occurred while deleting old profile picture'
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
};

/**
 * Delete a meal
 */
exports.delete = function(req, res) {
  var meal = req.meal;

  // Try to delete the image
  if (meal.mealImageURL) {
    fs.unlink(meal.mealImageURL, function (unlinkError) {
      if (unlinkError) {
        console.log(unlinkError);
      }
    });       
  }

  // Delete the meal
  meal.destroy().then(function() {
    return res.jsonp({meal: meal, message: "Meal successfully deleted"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

var formatDate = function(query) {
  if (query.startDate && query.endDate) return{[Op.gte]: query.startDate, [Op.lte] : query.endDate};
  if (query.startDate) return {[Op.gte] : query.startDate};
  if (query.endDate) return {[Op.lte] : query.endDate};
};

/**
 * List of Meals
 */
exports.list = function(req, res) {
  var query = {};
  if(req.query.menuId) query.menuId = req.query.menuId;
  if(req.query.category) query.category = req.query.category;
  if(req.query.price) query.price = req.query.price;
  if(req.query.name) query.name = req.query.name;
  if(req.query.visible) query.visible = req.query.visible;

  var menuQuery = {};
  if(req.query.startDate || req.query.endDate) menuQuery.date = formatDate(req.query);

  var restQuery = {};
  if(req.query.restaurantId) restQuery.id = req.query.restaurantId;

  Meal.findAll({
    where: query,
    include: {
      model: db.menu, 
      where: menuQuery, 
      include: {
        model: db.restaurant, 
        where: restQuery
      }
    }
  }).then(function(meals) {
    if (!meals) {
      return res.status(404).send({
        message: 'No meals found'
      });
    } else {
      res.jsonp({meals: meals, message: "Meals successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * List of restaurant meals
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  if(req.query.menuId) query.menuId = req.query.menuId;
  if(req.query.category) query.category = req.query.category;
  if(req.query.price) query.price = req.query.price;
  if(req.query.name) query.name = req.query.name;
  if(req.query.visible) query.visible = req.query.visible;

  var menuQuery = {};
  if(req.query.startDate || req.query.endDate) menuQuery.date = formatDate(req.query);

  var restQuery = {};
  if(req.query.restaurantId) restQuery.id = req.query.restaurantId;

  Meal.findAll({
    where: query,
    include: {
      model: db.menu, 
      where: menuQuery, 
      include: {
        model: db.restaurant, 
        where: restQuery
      }
    }
  }).then(function(meals) {
    if (!meals) {
      return res.status(404).send({
        message: 'No meals found for restaurant'
      });
    } else {
      res.jsonp({meals: meals, message: "Meals successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Meal middleware
 */
exports.mealByID = function(req, res, next, id) {

  Meal.findOne({
    where: {
      id: id
    },
    include: {model: db.menu, include: db.restaurant}
  }).then(function(meal) {
    if (!meal) {
      return res.status(404).send({
        message: 'No meal with that identifier has been found'
      });
    } else {
      req.meal = meal;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });

};