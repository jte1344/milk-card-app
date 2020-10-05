var createError = require('http-errors');
var express = require('express');
var app = express();
var env = process.env.NODE_ENV || 'developement';
var fs = require('fs')
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var cron = require('node-cron');

//local data store
const students = require('./store/students.json');
const classes = require('./store/classrooms.json');
const daily = require('./store/daily.json');

const jwt = require("jsonwebtoken");
const jwtKey = "chyro_is_in_the_5th"
const jwtExpirySeconds = 300


const cors = require('cors');
app.use(cors());

app.use(function(req, res, next) {
  //console.log(req.headers)
  //console.log(req.secure)
  if (req.secure || req.headers.host == 'localhost:3000') {
    next()
  } else {
    console.log('redirecting to https');
    res.redirect('https://' + req.headers.host + req.url);
  }
})
app.enable('trust proxy');

//connect to mongoDB
var url = process.env.MONGOLAB_URI;

mongoose.connect(url || 'mongodb://localhost/cyperdesigns', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(connection => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log(error.message);
  })

var db = mongoose.connection;

app.set('view engine', 'ejs');


app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))


// setup cron job

//cron.schedule("*/5 * * * * *", () => {

cron.schedule("00 00 00 * * *", () => {

  var data = {
    "data": []
  };
  try {
    fs.writeFileSync('./store/daily.json', JSON.stringify(data))
    console.log("Clearing daily drinks");
  } catch (err) {
    console.error(err)
  }
  for (var i = 0; i < students.length; i++) {
    students[i].choice = "";
  }
  try {
    fs.writeFileSync('./store/students.json', JSON.stringify(students));
    return true;
  } catch (err) {
    console.error(err)
    return false;
  }

})

//  currently set to 11:59 PM to save analytics for the day
//  (0 0 0 * * *) = 00:00 midnight
//  (0 */1 * * * *) = every minute
//  (S M H D/month M D/week)

const decStudentBal = (id, drink) => {
  var currStudent = students.find(x => x.id == id);
  currStudent.choice = drink;
  currStudent.balance--;
  var path = './store/students.json';
  try {
    fs.writeFileSync(path, JSON.stringify(students));
    return true;
  } catch (err) {
    console.error(err)
    return false;
  }
}

const verifyUser = (userToken) => {
  // We can obtain the session token from the requests cookies, which come with every request
  const token = userToken;
  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res.status(401).end();
  }
  var payload;
  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    payload = jwt.verify(token, jwtKey)
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return 401
    }
    // otherwise, return a bad request error
    return 400
  }
  // Finally, return the welcome message to the user, along with their
  // username given in the token
  return payload;
}


app.use(
  express.static(path.join(__dirname, 'dist/milkCardApp'), {
    etag: false
  })
);


const users = require('./store/users.json');
app.post('/api/authenticate', (req, res) => {

  const {
    username,
    password
  } = req.body

  const user = users.find(x => x.username === username && x.password === password);

  if (!username || !password || !user) {
    // return 401 error is username or password doesn't exist, or if password does
    // not match the password in our records
    return res.status(401).end()
  }

  // Create a new token with the username in the payload
  // and which expires 300 seconds after issue
  const token = jwt.sign({
    user
  }, jwtKey, {
    algorithm: "HS256",
    expiresIn: jwtExpirySeconds,
  })


  res.send({
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    access: user.access,
    token: token
  })
});




app.get('/api/students', (req, res) => {

  //verifyUser(req.query.token);

  var currClass = classes.find(x => x.id == req.query.classID)

  if (req.query.classID) {
    res.json(students.filter(x => x.classID == currClass.teacherName))
  } else {
    res.json(students);
  }

});

app.get('/api/classes', (req, res) => {

  //verifyUser(req.query.token);

  if (req.query.classID) {
    res.json(classes.find(x => x.id == req.query.classID))
  } else {
    res.json(classes);
  }
});

app.post('/api/postOrder', (req, res) => {
  //verifyUser(req.query.token);
  var students = req.body.students;

  for (var i = 0; i < students.length; i++) {
    students[i]
  }

  var output = {
    classroom: students[0].classID,
    students: [],
    drinks: {
      milk: 0,
      water: 0,
      chocoMilk: 0
    }
  }


  if (daily.data.find(x => x.classroom == output.classroom)) {
    daily.data.splice(daily.data.findIndex(x => x.classroom == output.classroom), 1)
  }
  for (var i = 0; i < students.length; i++) {
    if (students[i].choice === '') {
      console.log("Nothing to change");
    } else if (students[i].choice === 'milk') {
      var x = decStudentBal(students[i].id, 'milk')
      if (x === true) {
        output.students.push({
          name: students[i].name,
          drink: students[i].choice
        })
        output.drinks.milk++;
      } else {
        console.log("Unable to add drink to order");
      }
    } else if (students[i].choice === 'water') {
      var x = decStudentBal(students[i].id, 'water')
      if (x === true) {
        output.students.push({
          name: students[i].name,
          drink: students[i].choice
        })
        output.drinks.water++;
      } else {
        console.log("Unable to add drink to order");
      }
    } else if (students[i].choice === 'chocoMilk') {
      var x = decStudentBal(students[i].id, 'chocoMilk')
      if (x === true) {
        output.students.push({
          name: students[i].name,
          drink: students[i].choice
        })
        output.drinks.chocoMilk++;
      } else {
        console.log("Unable to add drink to order");
      }
    } else {
      console.log("Something went wrong");
    }
  }
  console.log(daily);
  daily.data.push(output)
  console.log("Data: ");
  console.log(daily);
  var path = './store/daily.json';
  try {
    fs.writeFileSync(path, JSON.stringify(daily))
    console.log("Adding to daily drinks");
  } catch (err) {
    console.error(err)
  }
  res.json({
    res: "success",
    msg: "Order Recieved"
  });

});

app.get('/api/drinkOrder', (req, res) => {
  //verifyUser(req.query.token);
  res.json(daily);
});

app.get('/test', (req, res) => {
  /////////////////////////////////////////////////

  /////////////////////////////////////////////////
  res.send("Tests run.")
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/milkCardApp/index.html'));
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send('Server Error')
})

module.exports = app