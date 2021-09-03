const email = document.getElementById("email");
const logoutBtn = document.getElementById("logout");

email.innerText = sessionStorage.getItem("res-email");
document.title = email.innerText + "'s Profile";

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("res-email");
  sessionStorage.removeItem("res-password");
  window.location = "/";
});
