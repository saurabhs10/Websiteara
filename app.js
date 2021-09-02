const express = require("express");


const app = express();
const port = process.env.PORT || 3000;
const dbScript = require("./dbScripts");

//creating for multer to define where restaurant images will be uploaded



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

app.post("/register-user", (req, res) => {
  dbScript.register(db, req.body).then((r) => {
    res.status(200).send({ registerMsg: r.msg, registered: r.registered });
  });
});


app.post("/login-user", (req, res) => {
  dbScript.login(db, req.body).then((r) => {
    res.status(200).send({ loginMsg: r });
  });
});

//for all other route requests send error
app.get("*", (req, res) => {
  res.send("<h1>Oops! Looks like you are lost, try the URL again");
});

app.listen(port);
console.log(`Server Listening on http://localhost:${port}`);
