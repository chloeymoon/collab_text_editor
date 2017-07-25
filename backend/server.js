const express = require('express')
const app = express()

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var models = require('../models/models')
var User = models.User;
var Document = models.Document


var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI
mongoose.connect(connect);

var validateReq = function(userData) {
  return (userData.password === userData.passwordRepeat);
};

// Passport
app.use(session({
  secret: 'Secret',
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.set('view engine', 'html');


// passport strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
  models.User.findOne({ username: username }, function (err, user) {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.error('!!!! Error fetching user in LocalStrategy', err);
      return done(err);
    }
    // if no user present, auth failed
    if (!user) {
      return done(null, false, { message: '!!! Incorrect username.' });
    }
    // if passwords do not match, auth failed
    if (user.password !== password) {
      return done(null, false, { message: '!!! Incorrect password.' });
    }
    // auth has has succeeded
    return done(null, user);
  });
}
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.post('/register', function(req, res) {
      var user = new User({
        username: req.body.username,
        password: req.body.password,
      })
      user.save(function(err,user){
        if(err){
          console.log(err)
        }
      })
      res.send('true')
  })

  app.post('/login', passport.authenticate('local'),
  function(req, res) {
    res.json({"success": "true"})
  });

  app.get('/logout', function(req,res) {
    req.logout()
    res.json({"success": "true"})
  })

//Documents Portal Page
  app.post('/documents', function(req, res) {
        var document = new Document({
          title: req.body.title,
          author: req.user.id,
          collaborators: [req.user.id]
        })
        document.save(function(err,document){
          if(err){
            console.log(err)
          }
          res.json(document)
        })
    })

    app.get('/documents', function(req,res) {
      Document.find({author: req.user.id}).populate('author').exec(function(err, docs){
        res.json(docs)
      })
    })

    app.post('/sharedDocuments', function(req, res) {
        Document.findById(req.body.sharedDocumentId, function (err, foundDoc){
          if (err) {console.log(err)}
          foundDoc.collaborators.push(req.user.id);
          foundDoc.save(function (err, updatedDocs){
            if (err) {console.log(err)}
            res.json(updatedDocs)
          })
        })
      })

      app.get('/sharedDocuments', function(req,res) {
        Document.find({collaborators: req.user.id}).exec(function(err, docs){
          var newDocs = []
          docs.map((document) => {
            console.log(JSON.stringify(document.author), JSON.stringify(req.user.id))
            if ( (JSON.stringify(document.author) !== JSON.stringify(req.user.id)) ){
              newDocs.push(document)
            }
          })
          res.json(newDocs)
        })
      })

// Example route
app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Backend server for Electron App running on port 3000!')
})

module.exports = app
