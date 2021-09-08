const express = require("express");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;
const dbScript = require("./dbScripts");

//creating for multer to define where restaurant images will be uploaded
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

let db;

//creating database connections
dbScript
  .init()
  .then((res) => {
    db = res;
    console.log("Connected to Database");
    dbScript.createTable(db);
  })
  .catch((e) => console.error(e));

//for website to access static files
app.use("/css", express.static(__dirname + "/css"));
app.use("/images", express.static(__dirname + "/images"));
app.use("/scripts", express.static(__dirname + "/scripts"));

//so that server can parse json requests
app.use(express.json());

//handling route requests
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/views/admin.html");
});

app.get("/logout", (req, res) => {
  res.sendFile(__dirname + "/views/logout.html");
});

app.get("/booking", (req, res) => {
  res.sendFile(__dirname + "/views/booking.html");
});

app.get("/cancellation", (req, res) => {
  res.sendFile(__dirname + "/views/cancellation.html");
});



app.get("/search", (req, res) => {
  res.sendFile(__dirname + "/views/search.html");
});

app.post("/get-restaurants-by-time", (req, res) => {
  dbScript
    .getRestaurantsByTime(db, req.body)
    .then((r) => res.status(200).send(r));
});

app.post("/register-user", (req, res) => {
  dbScript.register(db, req.body).then((r) => {
    res.status(200).send({ registerMsg: r.msg, registered: r.registered });
  });
});

app.post("/insert-res", upload.single("resImage"), (req, res) => {
  console.log("Here");
  console.log(req.file.path);
  req.body.resImg = req.file.path;
  dbScript.insertOne(db, req.body).then((r) => {
    res.status(200).send({ insertMsg: r.msg, inserted: r.inserted });
  });
});

app.post("/login-user", (req, res) => {
  dbScript.login(db, req.body).then((r) => {
    res.status(200).send({ loginMsg: r });
  });
});



app.post("/remove-res", (req, res) => {
  dbScript.deleteRestaurant(db, req.body).then((r) => res.status(200).send(r));
});



app.post("/update-res", (req, res) => {
  dbScript.updateRestaurant(db, req.body).then((r) => res.status(200).send(r));
});

app.post("/book-res", (req, res) => {
  dbScript.bookTable(db, req.body).then((r) => res.status(200).send(r));
});

app.post("/cancel-res", (req, res) => {
  dbScript.cancelTable(db, req.body).then((r) => res.status(200).send(r));
});



//for all other route requests send error
app.get("*", (req, res) => {
  res.send("<h1>Oops! Looks like you are lost, try the URL again");
});

app.listen(port);
console.log(`Server Listening on http://localhost:${port}`);
