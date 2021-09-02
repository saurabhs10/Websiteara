const loginText = document.getElementById("login-text");
const resEmail = sessionStorage.getItem("res-email");
let tableName;
if (resEmail) tableName = resEmail.split("@")[0];

if (resEmail == "admin" && window.location != "http://localhost:3000/admin") {
  window.location = "/admin";
} else if (resEmail) {
  loginText.innerText = resEmail;
  loginText.href = "/logout";
}
