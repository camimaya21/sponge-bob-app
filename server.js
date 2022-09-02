const express = require('express')
const app = express()
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const { google } = require('googleapis')
require('dotenv').config();

const port = process.env.PORT
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const CALLBACK_URL = process.env.CALLBACK_URL


/*  EXPRESS */

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}))

app.get('/', function (req, res) {
  res.render('pages/auth')
})

app.listen(port, () => console.log('App listening on port ' + port))


/*  PASSPORT SETUP  */

app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'ejs')

app.get('/success', (req, res) => res.send(userProfile))
app.get('/error', (req, res) => res.send("error logging in"))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})


/*  Google AUTH  */

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
},
  function (accessToken, refreshToken, profile, done) {
    const myAuth = new google.auth.OAuth2()
    myAuth.setCredentials({ access_token: accessToken })

    createEvent(myAuth)

    userProfile = profile
    return done(null, userProfile)
  }
))

async function createEvent(auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  let event = {
    'summary': 'You have been hacked 👩🏻‍💻',
    'description': 'Kind regards from Security Team',
    'start': {
      'dateTime': '2022-09-16T16:30:00+02:00',
      'timeZone': 'Europe/Madrid',
    },
    'colorId': '4',
    'end': {
      'dateTime': '2022-09-16T17:30:00+02:00',
      'timeZone': 'Europe/Madrid',
    },
    'attendees': [
      { 'email': `${process.env.EMAIL}` }
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        { 'method': 'email', 'minutes': 24 * 60 },
        { 'method': 'popup', 'minutes': 10 },
      ],
    },
  }

  calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,
  }, function (err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err)
      return
    }
    console.log('Event created')
  })
}

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function (req, res) {
    // Successful authentication, redirect success.
    res.redirect('https://slack.com/')
  })
