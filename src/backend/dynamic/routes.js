'use strict';

const Router = require('koa-router');
const dynamic = new Router();

const categoryDetails = require('./category-details');
const categoryList = require('./category-list');
const eventDetails = require('./event-details');
const eventList = require('./event-list');
const faqs = require('./faqs');
const merchantDetails = require('./merchant-details');
const proposalDetails = require('./proposal-details');
const merchantList = require('./merchant-list');
const page = require('./basic-page');
const clipboardPage = require('./clipboard');
const generatePDF = require('./reports');
// const vip = require('./vip');

function setup (app, router) {
  app.use(merchantDetails.middleware);
  app.use(proposalDetails.middleware);
  app.use(merchantList.middleware);
  app.use(eventDetails.middleware);
  app.use(eventList.middleware);
  app.use(categoryDetails.middleware);
  app.use(categoryList.middleware);
  app.use(page.middleware);
  app.use(faqs.middleware);
  app.use(clipboardPage.middleware);
  // app.use(vip.middleware);

  dynamic.get('/:R/:L/c/:slug/:page/', categoryDetails);
  dynamic.get('/:R/:L/c/:slug/', categoryDetails);
  dynamic.get('/:R/:L/categories/', categoryList);
  dynamic.get('/:R/:L/e/:slug/:page/', eventDetails);
  dynamic.get('/:R/:L/e/:slug/', eventDetails);
  dynamic.get('/:R/:L/events/', eventList);
  dynamic.get('/:R/:L/frequently-asked-questions/:slug/', faqs);
  dynamic.get('/:R/:L/m/:slug/', merchantDetails);
  dynamic.get('/:R/:L/proposal/:slug/', proposalDetails);
  dynamic.get('/:R/:L/merchants/:page/', merchantList);
  dynamic.get('/:R/:L/merchants/', merchantList);
  dynamic.get('/:R/:L/p/:slug/', page);
  dynamic.get('/:R/:L/p/:slug/:slug2/', page);
  dynamic.get('/:R/:L/me/coupon-book/:slug', clipboardPage);
  dynamic.post('/:R/:L/generatePDF/:userId', generatePDF);
  // dynamic.get('/:R/:L/me/vip/', vip);

  app.use(dynamic.routes());
}

module.exports = setup;
