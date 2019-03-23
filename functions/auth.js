const firebase = require('firebase');
const cors = require('cors')({
  origin: true
});

exports.handler = (req, res) => {
  cors(req, res, () => {
    const email = req.query.email;
    const password = req.query.password;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(result) {
        var user = result.user;
        res.status(200).send({user: user});
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
  });
};
