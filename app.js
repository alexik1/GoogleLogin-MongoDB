const express = require ("express")
const path = require ("path")
const mongoose = require ("mongoose")
const dotenv = require ("dotenv")
const morgan = require ("morgan")
const methodOverride = require ("method-override")
const passport = require ("passport")
const session = require ("express-session")
const MongoStore = require ("connect-mongo")
const bodyParser = require('body-parser')
const exphbs = require ("express-handlebars")
const connectDB = require ("./config/db")


//Load CFG
dotenv.config({path: './config/config.env'})

//Passport CFG
require('./config/passport')(passport)

connectDB( )

const app = express()

// Body Parser (no idea why i cant use express.urlencoded sometimes without crashing, so back to body parser)
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Method Override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

//Handlebar Helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exphbs({ helpers: {formatDate, stripTags, truncate, editIcon, select}, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// Sessions
app.use(session({
    secret:"lala",
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({ mongooseConnection: mongoose.connection })
    store: MongoStore.create({ mongoUrl: `${process.env.MONGO_URI}`})
}))

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Set Global var

app.use(function (req, res, next){
    res.locals.user = req.user || null,
    next()
})

//static folder
app.use(express.static(path.join(__dirname, 'public')))

//routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"))
}

const port = process.env.PORT

app.listen(port, console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${port}`))