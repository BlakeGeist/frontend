const firebase = require('firebase');
const cors = require('cors')({
  origin: true
});
const admin = require('firebase-admin');

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
const indexFunctions = require('./index');

exports.handler = (req, res) => {
  cors(req, res, () => {
    const email = req.query.email;
    const password = req.query.password || 'blakegeist@gmail.com';
    const csrfToken = req.query.csrfToken || 'anths30170';
    // When the user signs in with email and password.
    firebase.auth().signInWithEmailAndPassword(email, password).then(user => {

    }).then(() => {
      // A page redirect would suffice as the persistence is set to NONE.
      return firebase.auth().signOut();
    }).then(() => {

    });
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user.email)
        return user.getIdToken().then(idToken => {
          console.log(idToken)
          // Session login endpoint is queried and the session cookie is set.
          // CSRF protection should be taken into account.
          // ...
          console.log(idToken);
          console.log('this is blake')


          // Set session expiration to 5 days.
          const expiresIn = 60 * 60 * 24 * 5 * 1000;
          // Create the session cookie. This will also verify the ID token in the process.
          // The session cookie will have the same claims as the ID token.
          // To only allow session cookie setting on recent sign-in, auth_time in ID token
          // can be checked to ensure user was recently signed in before creating a session cookie.
          admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
            // Set cookie policy for session cookie.
            const options = {maxAge: expiresIn, httpOnly: true, secure: true};
            console.log('fish')
            res.cookie('session', sessionCookie, options);
            res.end(JSON.stringify({status: sessionCookie, options: options}));

          }, error => {
            res.status(401).send('UNAUTHORIZED REQUEST!');
          })
        });
      }
    });
  });
};

function sessionToken(sessionCookie) {
  console.log('inside authSignInWithToken')

  admin.auth().verifyIdToken(sessionCookie)
    .then(function(decodedToken) {
      return admin.auth().createSessionCookie(idToken, {expiresIn})
      // ...
    }).catch(function(error) {
      console.log(error)
      // Handle error
    });
}

function getCookie(cname) {
var name = cname + "=";
var decodedCookie = decodeURIComponent(document.cookie);
var ca = decodedCookie.split(';');
for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
        c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
    }
}
return "";
}

var postIdTokenToSessionLogin = function(url, idToken, csrfToken) {
// POST to session login endpoint.
return $.ajax({
  type:'POST',
  url: url,
  dataType:"json",
  data: {idToken: idToken, csrfToken: csrfToken},
  contentType: 'application/x-www-form-urlencoded',
  xhrFields: {
    withCredentials: true
  },
  crossDomain: true
 });
};
