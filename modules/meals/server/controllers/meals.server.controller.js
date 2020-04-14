'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  multer = require('multer'),
  Meal = db.meal;

const {Op} = require('sequelize');

// Define return
 // id | name | description | category | imageURL | price | minQuantity | maxQuantity | visible | finalized | createdAt | updatedAt | userId | menuId 
const retAttributes = ['id', 'name', 'allergens', 'dietaryRestrictions', 'description', 'imageURL', 'visible', 'finalized', 'menuId', 'mealinfoId'];
const menuRetAttributes = ['id', 'date', 'restaurantId'];
const restRetAttributes = ['id', 'name', 'email', 'description', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state'];
const mealinfoRetAttributes = ['id', 'type', 'price'];

/**
 * Create a meal
 */
exports.create = function(req, res) {
  delete req.body.id;
  delete req.body.imageURL;

  req.body.id = uuid();
  req.body.userId = req.user.id;

  // Visibility checks
  req.body.finalized = req.body.finalized || false;
  req.body.visible = (req.body.visible && req.body.finalized) || false;
  
  if(!req.body.menuId || !req.body.mealinfoId) {
      return res.status(400).send({
        message: "Please include menu/meal info id"
      });
  } else {
    req.body.menuId = req.menu.id;
    Meal.create(req.body).then(function(meal) {
      if (!meal) {
        return res.send('/', {
          errors: 'Could not create the meal'
        });
      } else {
        var ret = _.pick(meal, retAttributes);
        res.jsonp({meal: ret, message: "Meal successfully created"});
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
  var ret = _.pick(req.meal, retAttributes);
  res.jsonp({meal: ret, message: "Meal successfully found"});
};

/**
 * Update a meal
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.userId;

  var meal = req.meal;
  var updateBuilder = {};

  // Unfinalized to update these values
  if(!meal.finalized) {
    updateBuilder.mealinfoId = req.body.mealinfoId;
    updateBuilder.menuId = req.body.menuId;
    updateBuilder.minQuantity = req.body.minQuantity;
    updateBuilder.maxQuantity = req.body.maxQuantity;
    updateBuilder.finalized = req.body.finalized || false;
  }

  // Finalized to update this value
  if(meal.finalized) {
    updateBuilder.visible = req.body.visible;
  }

  // Values okay to update
  updateBuilder.name = req.body.name;
  updateBuilder.description = req.body.description;
  updateBuilder.category = req.body.category;

  meal.update(updateBuilder).then(function(meal) {
    var ret = _.pick(meal, retAttributes);
    res.jsonp({meal: ret, message: "Meal successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/** 
 * Update meal image
 */
exports.changeMealPicture = function(req, res) {
  return _changeMealPicture(req, res);
}

var _changeMealPicture = function(req, res) {
  var meal = req.meal;
  var upload = multer(config.uploads.profileUpload).single('newMealPicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).mealUploadFileFilter;
  var existingImageUrl;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;
  if (meal) {
    existingImageUrl = meal.imageURL;
    uploadImage()
      .then(updateMeal)
      .then(deleteOldImage)
      .then(function () {
        var ret = _.pick(meal, retAttributes);
        res.json({meal: ret, message: "Meal image successfully updated"});
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
  };

  function updateMeal () {
    return new Promise(function (resolve, reject) {
      meal.imageURL = config.uploads.profileUpload.dest + req.file.filename;
      meal.save().then(function() {
        resolve();
      }).catch(function(err) {
        reject(err);
      });
    });
  };

  function deleteOldImage () {
    return new Promise(function (resolve, reject) {
      if (existingImageUrl) {
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
  };
};

/**
 * Delete a meal
 */
exports.delete = function(req, res) {
  var meal = req.meal;

  if(!meal.finalized) {
    // Try to delete the image
    if (meal.imageURL) {
      fs.unlink(meal.imageURL, function (unlinkError) {
        if (unlinkError) {
          console.log(unlinkError);
        }
      });       
    };

    // Delete the meal
    meal.destroy().then(function() {
      var ret = _.pick(meal, retAttributes);
      return res.jsonp({meal: ret, message: "Meal successfully deleted"});
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  } else {
    return res.status(400).send({
      message: "Cannot delete finalized meal"
    });
  };
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
  var query = {finalized: true};
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
    include: [{
      model: db.menu, 
      where: menuQuery, 
      attributes: menuRetAttributes,
      include: {
        model: db.restaurant, 
        where: restQuery,
        attributes: restRetAttributes
      }
    },{
      model: db.mealinfo,
      attributes: mealinfoRetAttributes
    }],
    attributes: retAttributes
  }).then(function(meals) {
    if (!meals) {
      return res.status(404).send({
        message: 'No meals found'
      });
    } else {
      res.jsonp({meals: meals, message: "Meals successfully found"});
    }
  }).catch(function(err) {
    console.log(err);
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
  if(req.query.name) query.name = req.query.name;
  if(req.query.visible) query.visible = req.query.visible;

  var menuQuery = {};
  if(req.query.startDate || req.query.endDate) menuQuery.date = formatDate(req.query);

  var restQuery = {};
  if(req.query.restaurantId) restQuery.id = req.query.restaurantId;

  Meal.findAll({
    where: query,
    include: [{
      model: db.menu, 
      where: menuQuery, 
      attributes: menuRetAttributes,
      include: {
        model: db.restaurant, 
        where: restQuery,
        attributes: restRetAttributes
      }
    },{
      model: db.mealinfo,
      attributes: mealinfoRetAttributes
    }],
    attributes: retAttributes
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
    include: [{model: db.menu, include: db.restaurant}, {model: db.mealinfo}]
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