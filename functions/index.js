const functions = require('firebase-functions');
const _ = require('lodash');
const firebase = require('firebase');
var languages = [
  'ar','da','de','es','ja','fr','it','ko','pt','ru'
]

const AWS = require('aws-sdk');
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
var db = firebase.firestore();
const stringsCollection = db.collection('strings');

const cors = require('cors')({
  origin: true
});

exports.helloWorld = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      console.log("req.body :", JSON.stringify(req.body)); // Your data should be available here
      console.log("req.query :", JSON.stringify(req.query)); // Maybe check request.query too
      console.log(req.query)
      res.status(200).send({text: 'TEXT'});
    });
});

//takes a string(text) and a (slug)
//check the database for if the slug already exists
//if it does, this should prolly be an update function
//if the string does not exist, run the createString funciton
exports.createString = functions.https.onRequest(async (request, response) => {
   cors(request, response, () => {
    var slug = request.query.slug;
    var text = request.query.text;
    try {
      var existingDoc = stringsCollection.doc(slug).get();
      var docExists = existingDoc.exists
      if(docExists){
        //// TODO: create update strings function
      } else {
        console.log(slug, text)
        createStrings(text, slug)
        response.status(200).send({text: 'TEXT'});
      }
    }
    catch (error){
      console.log(error)
      response.status(500).send(error)
    }
  })
})

function createStrings(stringText, slug){
  let string = {
    'en': stringText
  }
  stringsCollection.doc(slug).set(string)
    .then(()=>{
      console.log('create string was successful ' + slug + ' en ' + stringText);
      return true
    })
    .then(async ()=>{
      var lang = 'ar';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'da';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'de';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'es';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'fr';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'it';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'ja';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'ko';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'pt';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .then(async ()=>{
      var lang = 'ru';
      var translated = await getTranslatedString(stringText, lang);
      return updateString(translated.TranslatedText, lang, slug)
    })
    .catch((e)=>{
      console.log('error ' + e)
    })
}

//take a slug, targetLanguage and string and add that to the string with that slug
function updateString(stringText, targetLang, slug) {
  if(targetLang === 'ja'){
    targetLang = 'jp';
  }
  if(targetLang === 'ko'){
    targetLang = 'kr'
  }
  let string = {}
  string[targetLang] = stringText
  stringsCollection.doc(slug).update(string)
    .then(()=>{
      console.log('update string was successful ' + slug + ' ' + targetLang + ' ' + stringText);
      return true
    })
    .catch((e)=>{
      console.log('error ' + e)
    })
}

//takes a string and a target language, sends it to AWS translate, and returns the result
async function getTranslatedString(string, targetLang){
  AWS.config.region = 'us-east-1';
  var ep = new AWS.Endpoint('https://translate.us-east-1.amazonaws.com');
  AWS.config.credentials = new AWS.Credentials("AKIAJQLVBELRL5AAMZOA", "Kl0ArGHFySw+iBEdGXZDrTch2V5VAaDbSs+EKKEZ");
  var translate = new AWS.Translate()
  translate.endpoint = ep;
  var params = {
    Text: string,
    SourceLanguageCode: 'en',
    TargetLanguageCode: targetLang
  };
  var promise = new Promise((resolve, reject)=>{
    translate.translateText(params, (err, data)=>{
      if (err) return reject(err);
      else {
        return resolve(data);
      }
    })
  })
  var result = await promise;
  return result;
}
