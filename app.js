const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose  = require('mongoose')
const morgan = require('morgan')
const expressSession = require('express-session')
const main = require('./routes/main')
const cors = require('cors')

app.use(cors())

app.use(expressSession({secret: 'max', saveUninitialized: false, resave:false}))

app.use(morgan('dev'))

const CONNECTION_URL  = 'mongodb+srv://user_0:user_0@cluster0.llrik.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5000

mongoose.connect(CONNECTION_URL)


app.engine('hbs', exphbs({
    defaultLayout: false,
    extname: '.hbs'
}));

app.set('view engine', 'hbs');


app.use(bodyParser.json())
app.use(bodyParser.text())
app.use(bodyParser.urlencoded({ extended: false }))



app.use(express.static(path.join(__dirname, 'style')))
app.use(express.static(path.join(__dirname, 'images')))

app.use('/', main)

module.exports = app