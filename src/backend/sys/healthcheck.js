'use strict';

function setup (app, router) {
  router.get('/healthcheck', function * () {
    this.body = {
      healthCheck: 'probably-okay-for-now'
    };
    this.status = 200;
  });
}

module.exports = setup;
