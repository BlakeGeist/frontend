'use strict';

const _ = require('lodash');
// const path = require('path');

function * merchantDetailsPage (next) {
  if (!this.state.pageData.merchant) {
    this.status = 404;
    return;
  }
  this.body = yield this.renderTemplate('dynamic:m');
  this.type = 'text/html';
}

merchantDetailsPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('m/') !== 0) return yield next;
  if (this.cached(null, 10)) return;
  const slug = this.state.relativeUrl.replace('m/', '').replace(/\/.*$/, '');
  this.state.pageData.merchant = yield this.fetch('merchantBySlug', this.state.variant, slug);
  console.log(yield this.fetch('merchantBySlug', this.state.variant, slug));
  yield next;
};

module.exports = merchantDetailsPage;
