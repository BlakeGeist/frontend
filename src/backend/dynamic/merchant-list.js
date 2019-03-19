'use strict';

const _ = require('lodash');
// const path = require('path');

function * merchantListPage (next) {
  this.body = yield this.renderTemplate('dynamic:merchants');
  this.type = 'text/html';
}

const DEFAULT_PAGE_SIZE = 49;

merchantListPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  const url = this.state.url.pathname;
  if (!path || path.indexOf('merchants/') !== 0) return yield next;
  if (this.cached(null, 60)) return;
  const matches = url.match(/merchants\/(\d+)/);
  const page = (matches && Number(matches[1])) || 1;
  const variant = this.state.variant;
  const linkBase = [variant.region, variant.language, 'merchants'];
  const _data = {};
  _data.pageNumber = page;
  _data.merchants = yield this.fetch('merchants', this.state.variant, page);
  _data.nextPage = _data.merchants.length >= DEFAULT_PAGE_SIZE;
  _data.prevPage = page !== 1;
  _data.nextPageLink = linkBase.concat([page + 1]).join('/');
  _data.prevPageLink = page <= 2 ? linkBase.join('/') : linkBase.concat([page - 1]).join('/');

  _data.assetPathOverride = '/assets/js/system/merchants';

  this.state.pageData = _data;
  yield next;
};

module.exports = merchantListPage;
