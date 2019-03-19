'use strict';

const _ = require('lodash');
// const path = require('path');

function * categoryListPage (next) {
  this.body = yield this.renderTemplate('dynamic:categories');
  this.type = 'text/html';
}

categoryListPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('categories/') !== 0) return yield next;
  if (this.cached(null, 60)) return;
  this.state.pageData.categories = yield this.fetch('categories', this.state.variant);
  yield next;
};

module.exports = categoryListPage;
