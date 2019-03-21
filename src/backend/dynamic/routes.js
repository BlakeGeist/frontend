'use strict';

const Router = require('koa-router');
const dynamic = new Router();

const categoryDetails = require('./category-details');
const categoryList = require('./category-list');
const proposalDetails = require('./proposal-details');
const productDetails = require('./product-details');
// const vip = require('./vip');

function setup (app, router) {
  app.use(proposalDetails.middleware);
  app.use(productDetails.middleware);
  app.use(categoryDetails.middleware);
  app.use(categoryList.middleware);
  // app.use(vip.middleware);

  dynamic.get('/:R/:L/c/:slug/:page/', categoryDetails);
  dynamic.get('/:R/:L/c/:slug/', categoryDetails);
  dynamic.get('/:R/:L/categories/', categoryList);
  dynamic.get('/:R/:L/proposal/:slug/', proposalDetails);
  dynamic.get('/:R/:L/product/:slug/', productDetails);

  app.use(dynamic.routes());
}

module.exports = setup;
