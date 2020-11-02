var createError = require('http-errors');
var express = require('express');
var app = express();
var env = process.env.NODE_ENV || 'developement';
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cron = require('node-cron');

//local data store
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('store/db.json');
const db = low(adapter);


const jwt = require("jsonwebtoken");
const jwtKey = "chyro_is_in_the_5th"
const jwtExpirySeconds = 300


const cors = require('cors');
app.use(cors());



app.set('view engine', 'ejs');


app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(
  express.static(path.join(__dirname, 'dist/milkCardApp'), {
    etag: false
  })
);

// setup cron job

//cron.schedule("*/5 * * * * *", () => {

cron.schedule("00 00 00 * * *", () => {

  //get current daily order
  var dailyData = db.getState().daily;

  //get current daily order
  var studentData = db.getState().students;
  console.log(studentData);

  //clear data
  dailyData = [];

  //writeback
  db.set('daily', dailyData).write();

  for (var i = 0; i < studentData.length; i++) {
    if (studentData[i].choice == "milk" || studentData[i].choice == "water" || studentData[i].choice == "chocoMilk") {
      studentData[i].balance--;
      studentData[i].choice = "none";
    } else {
      studentData[i].choice = "none";
    }
  }
  db.set('students', studentData).write();

})

//  currently set to 11:59 PM to save analytics for the day
//  (0 0 0 * * *) = 00:00 midnight
//  (0 */1 * * * *) = every minute
//  (S M H D/month M D/week)

const setStudentDrink = (id, drink) => {
  var studentData = db.getState().students;
  var currStudent = studentData.find(x => x.id == id);
  currStudent.choice = drink;
  db.set('students', studentData).write();
  return true;
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

app.post('/api/authenticate', (req, res) => {
  const users = db.getState().users;
  const {username, password} = req.body;
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

app.post('/api/addStudent', (req, res) => {
  var studentData = db.getState().students;
  var currStudent = req.body.data;
  var largestID = 0;
  for (var i = 0; i < studentData.length; i++) {
    if (studentData[i].id > largestID) {
      largestID = studentData[i].id
    }
  }
  var genNewID = largestID + 1;
  currStudent.id = genNewID;

  studentData.push(currStudent);
  db.set('students', studentData).write();

  var classroomImport = [];
  for (var i = 0; i < studentData.length; i++) {
    if (!classroomImport.includes(studentData[i].classID)) {
      if (!(studentData[i].classID == 'classID' || studentData[i].classID == 'none')) {
        classroomImport.push(studentData[i].classID);
      }
    }
  }
  classroomImport.sort();
  var classroomFinal = [];
  for (var i = 0; i < classroomImport.length; i++) {
    classroomFinal[i] = {
      id: i,
      teacherName: classroomImport[i]
    }
  }
  db.set('classrooms', classroomFinal).write();

  res.json({
    status: 200
  });
})


app.post('/api/postStudents', (req, res) => {

  var studentImport = req.body.data;
  var finalStudentList = [];
  //removes basic student object from list generated on front end
  for (var i = 0; i < studentImport.length; i++) {
    if (studentImport[i].id === "id") {
      console.log("Removing generic id entry");
    } else {
      finalStudentList.push(studentImport[i]);
    }
  }
  db.set('students', finalStudentList).write();

  var classroomImport = [];
  for (var i = 0; i < studentImport.length; i++) {
    if (!classroomImport.includes(studentImport[i].classID)) {
      if (!(studentImport[i].classID == 'classID' || studentImport[i].classID == 'none')) {
        classroomImport.push(studentImport[i].classID);
      }
    }
  }
  classroomImport.sort();
  var classroomFinal = [];
  for (var i = 0; i < classroomImport.length; i++) {
    classroomFinal[i] = {
      id: i,
      teacherName: classroomImport[i]
    }
  }
  db.set('classrooms', classroomFinal).write();

  res.json({
    status: 200
  });
});

app.get('/api/students', (req, res) => {

  var classroomData = db.getState().classrooms;
  var studentData = db.getState().students;

  var currClass = classroomData.find(x => x.id == req.query.classID)
  if (req.query.classID) {
    res.json(studentData.filter(x => x.classID == currClass.teacherName))
  } else {
    res.json(studentData);
  }
});

app.get('/api/classes', (req, res) => {
  var classroomData = db.getState().classrooms;
  if (req.query.classID) {
    res.json(classroomData.find(x => x.id == req.query.classID))
  } else {
    res.json(classroomData);
  }
});

app.get('/api/getStudents', (req, res) => {
  res.json(db.getState().students);
});

app.post('/api/postOrder', (req, res) => {
  //get daily db data
  var dailyData = db.getState().daily;

  var classStudent = req.body.students;

  var output = {
    classroom: classStudent[0].classID,
    students: [],
    drinks: {
      milk: 0,
      water: 0,
      chocoMilk: 0
    }
  }

  //find if class already submitted and remove it
  if (dailyData.find(x => x.classroom == output.classroom)) {
    dailyData.splice(dailyData.findIndex(x => x.classroom == output.classroom), 1)
  }

  //loop through each student
  for (var i = 0; i < classStudent.length; i++) {
    if (classStudent[i].choice === 'milk') {
      var x = setStudentDrink(classStudent[i].id, 'milk')
      if (x === true) {
        output.students.push({
          name: classStudent[i].name,
          drink: classStudent[i].choice
        })
        output.drinks.milk++;
      } else {
        console.log("Unable to add milk drink to order");
      }
    } else if (classStudent[i].choice === 'water') {
      var x = setStudentDrink(classStudent[i].id, 'water')
      if (x === true) {
        output.students.push({
          name: classStudent[i].name,
          drink: classStudent[i].choice
        })
        output.drinks.water++;
      } else {
        console.log("Unable to add water drink to order");
      }
    } else if (classStudent[i].choice === 'chocoMilk') {
      var x = setStudentDrink(classStudent[i].id, 'chocoMilk')
      if (x === true) {
        output.students.push({
          name: classStudent[i].name,
          drink: classStudent[i].choice
        })
        output.drinks.chocoMilk++;
      } else {
        console.log("Unable to add chocoMilk drink to order");
      }
    } else {
      console.log("Nothing to change");
    }
  }
  dailyData.push(output);

  //save to daily db
  db.set('daily', dailyData).write();

  res.json({
    res: "success",
    msg: "Order Recieved"
  });

});

app.get('/api/drinkOrder', (req, res) => {
  res.json(db.getState().daily);
});


app.get('/test', (req, res) => {
  /////////////////////////////////////////////////
  //get current daily order
  var dailyData = db.getState().daily;

  //get current daily order
  var studentData = db.getState().students;
  console.log(studentData);

  //clear data
  dailyData = [];

  //writeback
  db.set('daily', dailyData).write();

  for (var i = 0; i < studentData.length; i++) {
    if (studentData[i].choice == "milk" || studentData[i].choice == "water" || studentData[i].choice == "chocoMilk") {
      studentData[i].balance--;
      studentData[i].choice = "none";
    } else {
      studentData[i].choice = "none";
    }
  }
  db.set('students', studentData).write();
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
