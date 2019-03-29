const functions = require('firebase-functions');
const firebase = require('firebase');
const admin = require('firebase-admin');
const serviceAccount = require('./web-proposals-firebase-adminsdk-w49db-6d89175cd2.json');

const koa = require('koa');
const Router = require('koa-router');

const app = new koa();
const router = new Router();       // will be passed to components
app.component = n => component(n); // shortcut
const buildSettings = require('./src/backend/lib/build-settings');
const configs = require('./configs.json');

function component (name) {
  const _module = require('./src/backend/' + name);
  _module(app, router, configs);
  return app;
}

(app                             // App Configuration:
  .use(buildSettings)            // production build settings
  .component('sys/init')         // set up whitelabel & paths & initial this.state stuff
  .component('sys/render')       // adds this.renderTemplate()
  .component('sys/errors')       // error handling routes
  .component('sys/page-info')    // adds asset and page config data to this.state
  //.component('sys/data')         // sets up this.fetch() as an interface to api
  .component('sys/page-data')    // fetches data from api for content/dynamic pages
  .component('sys/etag')         // handles etags for everything other than page.js and page template renders
  .component('sys/assets')       // everything in the root /assets folder. this comes first because speed.
  .component('sys/slash')        // redirect page to page/
  .component('sys/main-css')     // compiles main.less to main.css
  .component('sys/handlebars')   // sets up handlebars for node and browser
  //.component('sys/healthcheck')  // health-check script
  .component('sys/scripts')      // renders <script> tags into dom
  .component('dynamic/routes')   // routes for specific dynamic pages
  .component('pages/css')        // css for both content and dynamic pages
  .component('pages/scripts')    // javascript for both content and dynamic pages
  .component('pages/handlebars') // renders content/dynamic pages that don't get handled by dynamic/routes
  .component('pages/static')     // serves page-specific static assets
  .use(router.routes())          // enable the router after all other middlewares have run
  .use(router.allowedMethods())
);

//http://localhost:5001/web-proposals/us-central1/api/us/fr/
exports.api = functions.https.onRequest(app.callback());


const database = admin.database();
var adminFirestore = admin.app().firestore();

var languages = [
  'ar','da','de','es','ja','fr','it','ko','pt','ru'
]

const cors = require('cors')({
  origin: true
});

//strings functions
const stringsModule = require('./strings');
exports.createString = functions.https.onRequest((req, res) => {
  stringsModule.handler(req, res);
});

exports.createSiteCollection = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

      var collection = req.query.collectionName;
      var firstDoc = {
        name: 'first'
      }
      var newCollection = {
        collection: collection
      }

      newCollection[collection] = firstDoc

      db.collection('sites').doc('localhost').update(newCollection)
        .then(function() {
          res.status(200).send({collectionCreated: 'created ' + collection + ' in site localhost'});
          return
        })
        .catch(function(error) {
          res.status(500).send(error)
        });
    });
});
