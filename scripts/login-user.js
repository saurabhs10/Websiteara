const loginText = document.getElementById("login-text");
const resEmail = sessionStorage.getItem("res-email");
const resUserName = sessionStorage.getItem("res-username");
let tableName;
if (resEmail) tableName = resEmail.split("@")[0];
//console.log(resUserName);
if (resEmail == "admin" && window.location != "http://localhost:3000/admin") {
  window.location = "/admin";
} else if (resEmail) {
  loginText.innerText = resEmail
  loginText.href = "/logout";
}
