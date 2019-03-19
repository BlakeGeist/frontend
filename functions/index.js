const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const firebase = require('firebase');
var config = {
    apiKey: "AIzaSyDriZIhBxf7qF73SUOR-wDBHMceP5w7Rss",
    authDomain: "web-proposals.firebaseapp.com",
    databaseURL: "https://web-proposals.firebaseio.com",
    projectId: "web-proposals",
    storageBucket: "web-proposals.appspot.com",
    messagingSenderId: "907512529926"
  };

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}


exports.translateString = functions.https.onRequest((req, res) => {
  const original = req.query.string;

  string = {
    name: testString,
    value: "this is my test string",
    targetLang: 'en'
  }
  var payload = {}
  payload[string.targetLang] = string.value;

  var db = firebase.firestore();
  var name = string.name;
  db.collection('strings').doc(name).set(payload)
  .then(function() {
    console.log('import string was successful')
    return true
  })
  .catch(function(error) {
  });

});
