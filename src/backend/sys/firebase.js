'use strict';

var firebase = require('firebase');

 require('firebase/auth');
 require('firebase/database');
 // Initialize Firebase for the application

function setup (app, router) {
  app.use(function * (next) {
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
    yield next;
  });
}

module.exports = setup;
