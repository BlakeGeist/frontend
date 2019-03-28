const functions = require('firebase-functions');
const firebase = require('firebase');
const admin = require('firebase-admin');
const serviceAccount = require('../web-proposals-firebase-adminsdk-w49db-6d89175cd2.json');

const koa = require('koa');
const Router = require('koa-router');

const app = new koa();
const router = new Router();       // will be passed to components
app.component = n => component(n); // shortcut
const buildSettings = require('../src/backend/lib/build-settings');
const configs = require('../configs.json');

function component (name) {
  const _module = require('../src/backend/' + name);
  _module(app, router, configs);
  return app;
}

(app                             // App Configuration:
  .use(buildSettings)            // production build settings
  .component('sys/init')         // set up whitelabel & paths & initial this.state stuff
  .component('sys/render')       // adds this.renderTemplate()
  .component('sys/errors')       // error handling routes
  .component('sys/page-info')    // adds asset and page config data to this.state
  .component('sys/data')         // sets up this.fetch() as an interface to api
  .component('sys/page-data')    // fetches data from api for content/dynamic pages
  .component('sys/etag')         // handles etags for everything other than page.js and page template renders
  .component('sys/assets')       // everything in the root /assets folder. this comes first because speed.
  .component('sys/slash')        // redirect page to page/
  .component('sys/main-css')     // compiles main.less to main.css
  .component('sys/handlebars')   // sets up handlebars for node and browser
  .component('sys/healthcheck')  // health-check script
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://web-proposals.firebaseio.com"
});
const database = admin.database();
var adminFirestore = admin.app().firestore();

var config = {
    apiKey: "AIzaSyDriZIhBxf7qF73SUOR-wDBHMceP5w7Rss",
    authDomain: "web-proposals.firebaseapp.com",
    databaseURL: "https://web-proposals.firebaseio.com",
    projectId: "web-proposals",
    storageBucket: "web-proposals.appspot.com",
    messagingSenderId: "907512529926"
  };

firebase.initializeApp(config);

var languages = [
  'ar','da','de','es','ja','fr','it','ko','pt','ru'
]

const cors = require('cors')({
  origin: true
});

exports.authSignInWithToken = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    console.log('inside authSignInWithToken')

    admin.auth().verifyIdToken("eyJhbGciOiJSUzI1NiIsImtpZCI6InNrSUJOZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS93ZWItcHJvcG9zYWxzIiwiYXVkIjoid2ViLXByb3Bvc2FscyIsImF1dGhfdGltZSI6MTU1MzU4OTA1NiwidXNlcl9pZCI6Imx6OVlpckhBWTlUYVBtVUpKUkx5Mmh1ZUE4RDIiLCJzdWIiOiJsejlZaXJIQVk5VGFQbVVKSlJMeTJodWVBOEQyIiwiaWF0IjoxNTUzNTg5MDU3LCJleHAiOjE1NTQwMjEwNTcsImVtYWlsIjoiYmxha2VnZWlzdEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiYmxha2VnZWlzdEBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.g0vSP3LDTcFO4pJoRE5WI-gFbNqdQHUdUkkCO8ZS1oPIxF4bffL4_tCGd1iC5bZZYGDmrpWIfaAjvWMGKyCiQKiZCEQSVujyepUul9yn6YoeCpFlwowCqZvM1Z0FSxM5RX3rqKBzE-5nfS3qEFR1fneQS9jtI7HC9Wi5QIMlHPfTQJJnzw3K8K566DWr8UkgWtTLouoCNQUaTst-fuOVYdBmCUh7oyI6oSzQrfI-x7H7Jv4RBc_n-IInFyLN4hYeMRpZ0n8K_pp-JwgY1nBrNYDFiZEHn-XaUO2nCdXtJ-7Qq_Cqo4oPBJczm0G4lquTvSM5fa1p4o8WmhvZKwBffg")
      .then(function(decodedToken) {
        return admin.auth().createSessionCookie(idToken, {expiresIn})
        // ...
      }).catch(function(error) {
        console.log(error)
        // Handle error
      });

  });

});




//auth functions
const authModule = require('./auth');
exports.authSignIn = functions.https.onRequest((req, res) => {
  authModule.handler(req, res, database);
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
        })
        .catch(function(error) {
          res.status(500).send(error)
        });
    });
});
