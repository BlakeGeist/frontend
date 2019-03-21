'use strict';

const _ = require('lodash');
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
  app.use(function * (next) {
    const data = getData();
    this.fetch = getCacher(cacherKey(this), data);
    yield next;
  });
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
    proposals: async function () {
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
    proposalBySlug: async function (varients, slug) {
      const fireData = {};
      await db.collection('proposals').doc(slug)
        .get()
        .then(doc=>{
          let data = doc.data();
          _.extend(fireData, data);
        })
      return fireData;
    },
    strings: async function () {
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
    products: async function () {
      const fireData = {};
      await db.collection('products')
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
    productBySlug: async function (varients, slug) {
      const fireData = {};
      await db.collection('products').doc(slug)
        .get()
        .then(doc=>{
          let data = doc.data();
          _.extend(fireData, data);
        })
      return fireData;
    },
    siteSettings: async function (varients, slug) {
      const fireData = {};
      await db.collection('sites').doc('localhost')
        .get()
        .then(doc=>{
          let data = doc.data();
          _.extend(fireData, data);
        })
      return fireData;
    }
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
