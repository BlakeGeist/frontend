/* global _, $, jwt_decode */
(function (window, site) {
  'use strict';

  var tokenTypes = 'admin high low anonymous'.split(' '); // this is also the precedence order for .authLevel()

  function Me () {
    var config = {
      apiKey: "AIzaSyDriZIhBxf7qF73SUOR-wDBHMceP5w7Rss",
      authDomain: "web-proposals.firebaseapp.com",
      databaseURL: "https://web-proposals.firebaseio.com",
      projectId: "web-proposals",
      storageBucket: "web-proposals.appspot.com",
      messagingSenderId: "907512529926"
    };
    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var prettyUser = {
          email: user.email,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          uid: user.uid
        }
        site.context.userData2 = prettyUser;
        console.log(prettyUser)
        site.events.emit('me:loggedIn');
        var db = firebase.firestore();
        var file = db.collection("userAttrs").doc(prettyUser.uid)
        file.get().then(function(doc) {
          if (doc.exists) {
              _.extend(site.context.userData2, doc.data());
          } else {
              console.log("No user attrs!");
          }
          site.events.emit('me:loggedIn:attrs:complete');
          console.log(site.context.userData2);
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
      } else {
        // No user is signed in.
      }
    });
  }
  
  site.me = new Me();
})(window, window.site);
