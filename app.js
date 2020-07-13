const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const db = require('./models')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const app = express()
const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helpers') }))
app.set('view engine', 'handlebars')
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.successMsg = req.flash('successMsg')
  res.locals.errorMsg = req.flash('errorMsg')
  res.locals.user = req.user
  next()
})

app.listen(PORT, () => {
  // db.sequelize.sync()
  console.log(`app is listening on http://localhost:${PORT}`)
})

require('./routes/index')(app)


