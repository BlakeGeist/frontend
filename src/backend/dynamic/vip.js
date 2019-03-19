'use strict';

const _ = require('lodash');

function * vip (next) {
  if (this.state.pageData.page) {
    this.body = yield this.renderTemplate('dynamic:p');
    this.type = 'text/html';
    return;
  }

  yield next;
}

vip.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('me/vip/') !== 0) return yield next;
  this.state.pageData.vip = yield this.fetch('vip', this.state.variant);

  yield next;
};

module.exports = vip;
