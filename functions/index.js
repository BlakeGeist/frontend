const functions = require('firebase-functions');
const firebase = require('firebase');
const admin = require('firebase-admin');
const serviceAccount = require('../web-proposals-firebase-adminsdk-w49db-6d89175cd2.json');
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

//auth functions
const authModule = require('./auth');
exports.authSignIn = functions.https.onRequest((req, res) => {
  authModule.handler(req, res, database);
});

exports.authSignInWithToken = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const uid = req.query.uid;

    if(!uid) {return}

    admin.auth().getUser(uid)
      .then(function(user) {
        // See the UserRecord reference doc for the contents of userRecord.
        res.status(200).send({user: user});
      })
      .catch(function(error) {
        console.log("Error fetching user data:", error);
      });
  });

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
