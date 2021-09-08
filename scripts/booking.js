//ask user to login to book a table and redirect to login page.
if (!resEmail) {
  alert("You need to login to book a table");
  window.location = "/login";
}

fetchRestaurants()
  .then((res) => res.json())
  .then((res) => displayRestaurants(res));
