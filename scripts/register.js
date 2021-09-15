const form = document.getElementById("login-form");
const email = document.getElementById("email");
const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if(email.value === "" || password.value === "" || username.value ==="" || confirmPassword.value===""){
    window.alert("Necessary field is missing");
    return;
  }
  if (password.value != confirmPassword.value) {
    alert("Password are not the same");
    return;
  }
  
  fetch("http://localhost:3000/register-user", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      email: email.value,
      username: username.value,
      password: password.value,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      alert(res.registerMsg);
      if (res.registered) {
        sessionStorage.setItem("res-username", username.value);
        sessionStorage.setItem("res-email", email.value);
        sessionStorage.setItem("res-password", password.value);
        window.location = "/";
      }
    });
});
