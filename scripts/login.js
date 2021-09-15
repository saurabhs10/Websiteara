const form = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if(email.value === "" || password.value === ""){
    window.alert("Necessary field is missing");
    return;
  }

  fetch("http://localhost:3000/login-user", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.loginMsg) {
        sessionStorage.setItem("res-email", email.value);
        sessionStorage.setItem("res-password", password.value);
        window.location = "/";
      } else {
        alert("Invalid email or password");
      }
    });
});
