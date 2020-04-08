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
  Menu = db.menu;

const {Op} = require('sequelize');
/**
 * Create a menu
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();
  req.body.restaurantId = req.restaurant.id;

  // Separate endpoint to upload the menu image
  delete req.body.menuImageURL;
  
  if( !req.body.restaurantId) {
      return res.status(400).send({
        message: "Please include restaurant id"
      });
  } else {
    Menu.create(req.body).then(function(menu) {
      if (!menu) {
        return res.send('/', {
          errors: 'Could not create the menu'
        });
      } else {
        res.jsonp({menu: menu, message: "Menu successfully created"});
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
};

/**
 * Show the current menu
 */
exports.read = function(req, res) {
  res.jsonp({menu: req.menu, message: "Menu successfully found"});
};

/**
 * Update a menu
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.restaurantId;
  var menu = req.menu;

  menu.update({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    date: req.body.date,
    price: req.body.price,
    visible: req.body.visible,
    minQuantity: req.body.minQuantity,
    maxQuantity: req.body.maxQuantity
  }).then(function(menu) {
    res.jsonp({menu: menu, message: "Menu successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/** 
 * Update menu image
 */
exports.changeMenuPicture = function (req, res) {
  var menu = req.menu;
  var upload = multer(config.uploads.profileUpload).single('newMenuPicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).menuUploadFileFilter;
  var existingImageUrl;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (menu) {
    existingImageUrl = menu.menuImageURL;
    uploadImage()
      .then(updateMenu)
      .then(deleteOldImage)
      .then(function () {
        res.json(menu);
      })
      .catch(function (err) {
        return res.status(422).send(err);
      });
  } else {
    return res.status(401).send({
      message: 'Menu not found'
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

  function updateMenu () {
    return new Promise(function (resolve, reject) {
      menu.menuImageURL = config.uploads.profileUpload.dest + req.file.filename;
      menu.save(function (err, themenu) {
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
      if (existingImageUrl !== Menu.schema.path('menuImageURL').defaultValue) {
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
 * Delete a menu
 */
exports.delete = function(req, res) {
  var menu = req.menu;

  // Try to delete the image
  if (menu.menuImageURL) {
    fs.unlink(menu.menuImageURL, function (unlinkError) {
      if (unlinkError) {
        console.log(unlinkError);
      }
    });       
  }

  // Delete the menu
  menu.destroy().then(function() {
    return res.jsonp({menu: menu, message: "Menu successfully deleted"});
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
 * List of Menus
 */
exports.list = function(req, res) {
  var query = {};
  if(req.query.category) query.category = req.query.category;
  if(req.query.price) query.price = req.query.price;
  if(req.query.name) query.name = req.query.name;
  if(req.query.visible) query.visible = req.query.visible;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Menu.findAll({
    where: query,
    include: [db.restaurant]
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus found'
      });
    } else {
      res.jsonp({menus: menus, message: "Menus successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * List of restaurant menus
 */
exports.restaurantMenuList = function(req, res) {
  var query = {restaurantId: req.restaurant.id};
  if(req.query.category) query.category = req.query.category;
  if(req.query.price) query.price = req.query.price;
  if(req.query.name) query.name = req.query.name;
  if(req.query.visible) query.visible = req.query.visible;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Menu.findAll({
    where: query,
    include: [db.restaurant]
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus found for restaurant'
      });
    } else {
      res.jsonp({menus: menus, message: "Menus successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Menu middleware
 */
exports.menuByID = function(req, res, next, id) {

  // if ((id % 1 === 0) === false) { //check if it's integer
  //   return res.status(404).send({
  //     message: 'Menu is invalid'
  //   });
  // }
  Menu.findOne({
    where: {
      id: id
    },
    include: [{
      model: db.restaurant
    }]
  }).then(function(menu) {
    if (!menu) {
      return res.status(404).send({
        message: 'No menu with that identifier has been found'
      });
    } else {
      req.menu = menu;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });

};