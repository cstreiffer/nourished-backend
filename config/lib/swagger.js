'use strict';

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
var path = require('path');

// Swagger set up
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Swagger API Documentation",
      version: "0.1.0",
      description:
        "Highlights the different swagger routes",
    },
    servers: [
      {
        url: "http://localhost:3000/api"
      }
    ]
  },
  apis: [
    path.resolve('modules/*/swagger.js')
  ]
};

module.exports = function(app) {
  const specs = swaggerJsdoc(options);
  app.use("/api/v1/docs", swaggerUi.serve);
  app.get(
    "/api/v1/docs",
    swaggerUi.setup(specs, {
      explorer: true
    })
  );
};