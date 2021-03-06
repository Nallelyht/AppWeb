require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose.Promise = Promise;
mongoose
	.connect(process.env.DB, { useMongoClient: true })
	.then(() => {
		console.log('Connected to Mongo!');
	})
	.catch((err) => {
		console.error('Error connecting to mongo', err);
	});

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Express View engine setup

app.use(
	require('node-sass-middleware')({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public'),
		sourceMap: true
	})
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

app.use(session({
  store: new MongoStore({
    mongooseConnection:mongoose.connection,
    ttl:24*60*60
  }),
  secret: 'bliss',
  saveUninitialized: true,
  resave: false,
}));

//passport
const passport = require('./helpers/passport');
app.use(passport.initialize());
app.use(passport.session());

//le dice que guarde en la variable, lo que se encuentra en la dirección
const index = require('./routes/index'); 
const auth = require('./routes/auth');
const places = require('./routes/places');
const filter = require('./routes/filter');
// Make everything available inside the routes: (/ + variable)
app.use('/places', places);
app.use('/', auth);
app.use('/', index);
app.use('/', filter);

module.exports = app;
