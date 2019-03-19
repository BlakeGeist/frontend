"use strict";

module.exports = setup;

const _ = require('lodash');
const qs = require('querystring');
const configs = require('../../../configs.json');

const BA_prefix = /^\/(\d+)$/;
const Partner_prefix = /^\/M0([A-Za-z0-9]+)$/;
const refer_friend_prefix=/^\/RAF([A-Za-z0-9]+)$/;
const qmark = /\?.+$/;
const request = require('request-promise');

function getApiClient () {
  const apiClient = request.defaults({
    baseUrl: configs.api.internalUrl,
    forever: true,
    // pool: {maxSockets: 20},
    json: true,
    simple: false,
    resolveWithFullResponse: true
  });

  return apiClient;
}
function utm_redir (ctx, url, params) {
  _.defaults(params, {
    utm_name: 'referral',
    utm_source: ctx.state.whitelabel,
    utm_medium: 'web'
  });
  const dest = [url, qs.stringify(params)].join('?');
  ctx.status = 301; // make it a permanent redir
  ctx.redirect(dest);
}

function * legacyRedirectsMiddleware (next) {

  var domain = this.request.header.host;
  const query = this.query;
  const url = this.url.replace(qmark, '');

  // Format 1: .com/{BAID}
  const ba_prefix_matches = BA_prefix.exec(url);
  if (ba_prefix_matches) {

    return utm_redir(this, configs.domains.dubli, {
      utm_baid: ba_prefix_matches[1],
      utm_content: _.get(configs, 'dublinetwork.defaultProgramReferrer')
    });
  }

  // Format 2: .com?BArefno={{BA ID}}
  if (this.query.BArefno) {
    return utm_redir(this, configs.domains.dubli, {
      utm_baid: this.query.BArefno,
      utm_content: _.get(configs, 'dublinetwork.defaultProgramReferrer')
    });

  }

  // Format 3: .com/M0{PARTNER ID as base36}
  const partner_prefix_matches = Partner_prefix.exec(url);
  if (partner_prefix_matches) {
    const b36 = partner_prefix_matches[1];
    const int = parseInt(b36, 36);
    const Url = this.url;
    const self = this;
    const key = this.query.key;
    //call to API method
    const getKey = key => resp => _.get(resp, 'body.' + key);
    const apiClient = getApiClient();
    const userID = yield apiClient.get('/me/getUserIdByOnlyPartnerId/' + int).then(getKey('id'));
    return utm_redir(this, configs.domains.bsprewards, {
      utm_content: userID,
      key: key
    });

  }
  // Format 4: .com?voucher/baid={{}}
  var domainWithProtocol = configs.domains.dubli.split(':')[0] + '://' + domain;
 if (domainWithProtocol.indexOf(configs.domains.dubli) == -1 && this.url.indexOf('voucher') > -1 && this.url.indexOf('baid')  > -1 ) {
   return this.response.redirect(configs.domains.dubli + this.url);
  }

  // Format 5: .com/RAF{friend user ID as base36}
  const friend = refer_friend_prefix.exec(url);
  if(friend && friend[1]){
    //Get the details of the referrer(friend)
    const apiClient = getApiClient();
    var referrer= yield apiClient.get('/me/getUserById/' + parseInt(friend[1], 36));
  }
  //CRP link BA inheritence(should work only for whitelabel dubli)
  if (friend && referrer && referrer.body && referrer.body['referral.baid'] && referrer.body.whitelabel=='dubli') {
    return utm_redir(this, '/', {
      utm_friend: friend[1],
      utm_baid: referrer.body['referral.baid'],
      utm_content: _.get(configs, 'dublinetwork.defaultProgramReferrer')
    });
  }
  //CRP link Partner inheritence(should work only for whitelabel bsprewards)
  else if(friend && referrer && referrer.body.program_referrer >1000 &&  referrer.body.whitelabel=='bsprewards'){
    return utm_redir(this, '/', {
      utm_content: referrer.body.program_referrer,
      utm_friend: friend[1]
    });
  }
  else if(friend) {
    return utm_redir(this, '/', {
      utm_friend: friend[1],
    });
  }

  yield next;
}

function setup (app, router) {
  app.use(legacyRedirectsMiddleware);
}
