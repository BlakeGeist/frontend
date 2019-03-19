'use strict';

const _ = require('lodash');
// const path = require('path');

function * eventListPage (next) {
  this.body = yield this.renderTemplate('dynamic:events');
  this.type = 'text/html';
}

eventListPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('events/') !== 0) return yield next;
  if (this.cached(null, 60)) return;
  this.state.pageData.events = yield this.fetch('events', this.state.variant);
  yield next;
};

module.exports = eventListPage;
