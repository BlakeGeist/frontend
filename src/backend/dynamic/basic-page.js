'use strict';

const _ = require('lodash');
const customHBS = require('../lib/custom-handlebars');

function * basicPage (next) {
  if (this.state.pageData.page) {
    this.body = yield this.renderTemplate('dynamic:p');
    this.type = 'text/html';
    return;
  }

  yield next;
}

basicPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('p/') !== 0) return yield next;
  if (this.cached()) return;
  const slug = this.state.relativeUrl.replace('p/', '').replace(/\/$/, '');
  const pageInfo = yield this.fetch('pageBySlug', this.state.variant, slug);

  customHBS.replaceBadLinks(pageInfo, this.state.variant, this.state.whitelabelInfo);

  this.state.pageData.page = pageInfo;
  yield next;
};

module.exports = basicPage;
