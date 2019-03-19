'use strict';

const _ = require('lodash');
// const path = require('path');

function * clipboardPage (next) {
  this.body = yield this.renderTemplate('dynamic:me/coupon-book');
  this.type = 'text/html';
}

clipboardPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('me/clipboard/') !== 0) return yield next;
  const slug = this.state.relativeUrl.replace('me/coupon-book/', '').replace(/\/$/, '');
  let _data = new Object();
  _data.name = {'name': 'My travel in January'};
  _data.merchants = yield this.fetch('merchants', this.state.variant, 1);

  this.state.pageData.clipboard = _data;
  yield next;
};

module.exports = clipboardPage;
