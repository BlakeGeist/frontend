'use strict';

const _ = require('lodash');
const configs = require('../../../configs.json');
const co = require('co');
const debug = require('debug')('backend:sys:data');
const request = require('request-promise');
const threeWayCache = require('../lib/three-way-cache');
const buildSettings = require('../lib/build-settings').buildSettings;
const wait = require('co-waiter');
const DEFAULT_PAGE_SIZE = 49;

module.exports = setup;


const apiCacheConfig = (/^dev/.test(process.env.NODE_ENV)) ? {
  order: ['redis'],
  redis: 0
} : {
  order: ['redis'],
  redis: 0
};

const CACHER_CACHE = {};
function getCacher (key, data) {
  if (!CACHER_CACHE[key]) {
    CACHER_CACHE[key] = threeWayCache(data.get.bind(data), 'api/' + key, apiCacheConfig);
  }
  return CACHER_CACHE[key];
}

function cacherKey (ctx) {
  var k = [
    _.get(ctx, 'state.whitelabel') || '_whitelabel_',
    _.get(ctx, 'state.variant.desc') || '_desc_',
    _.get(ctx, 'hostname') || '_hostname_',
    _.get(buildSettings, 'buildId') || '_buildId_'
  ].join('.').replace(/[^a-zA-Z0-9._-]/g, '_');
  return k;
}

function setup (app) {
  const apiClient = getApiClient();

  app.use(function * (next) {
    const data = getData();
    this.fetch = getCacher(cacherKey(this), data);
    yield next;
  });
}

const _data_client_wl_cache = {};
function getDataWithWhitelabelHeaders (apiClient, ctx) {
  const wl = ctx.state.whitelabel;
  _data_client_wl_cache[wl] = getData(apiClient.defaults({
    headers: {
      'x-appwl': wl
    }
  }));
  return getData();
}

const firebase = require('firebase');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  var serviceAccount = require('../../../web-proposals-firebase-adminsdk-w49db-6d89175cd2.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://web-proposals.firebaseio.com"
  });

}

var adminAuth = admin.app().auth();

const db = admin.app().firestore();

function getData () {
  const getKey = key => resp => _.get(resp, 'body.' + key);
  const _DATA = {};
  _DATA._fetchers = {
    proposals: async function getFireData () {
      const fireData = {};
      await db.collection('proposals')
        .get()
        .then(query=>{
            let data = query.docs.map(doc=>{
                let x = doc.data()
                    x['_id']=doc.id;
                    return x;
            })
            _.extend(fireData, data);
        })
      return fireData;
    },
    proposalBySlug: async function getFireData (varients, slug) {
      const fireData = {};
      await db.collection('proposals').doc(slug)
        .get()
        .then(doc=>{
          let data = doc.data();
          _.extend(fireData, data);
        })
      return fireData;
    },
    strings: async function getFireData () {
      const fireData = {};
      await db.collection('strings')
        .get()
        .then(query=>{
            let data = query.docs.map(doc=>{
                let x = doc.data()
                    x['_id']=doc.id;
                    return x;
            })
            _.extend(fireData, data);
        })
      return fireData;
    },
  };

  _DATA.get = co.wrap(function * (type) {
    var fetcher = _DATA._fetchers[type];
    var rest = _.toArray(arguments).slice(1);
    debug('fetching ' + type + ' : ' + JSON.stringify(rest));
    if (!fetcher) throw new Error('No remote data fetcher defined for ' + type);
    return yield fetcher.apply(null, rest);
  });

  return _DATA;
}

function _slugify (text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

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

function check2xxOr404 (errorMessage) {
  if (!errorMessage) errorMessage = 'API Call failed to return either a 2XX or 404 response!';
  return function (response) {
    const code = response.statusCode;
    let ok = false;
    if (code === 404) ok = true;
    if (code >= 200 && code < 300) ok = true;
    if (!ok) throw new Error(errorMessage + ' (status code was: ' + code + ')');
    return code === 404 ? {} : response;
  };
}
