const searchForm = document.getElementById("search-form");
const searchQuery = document.getElementById("search-query");
const loadingContainer = document.getElementById("loading-container");
const timeDiv = document.getElementById("time-div");

if (!resEmail) {
  alert("You need to login to search a restaurant");
  window.location = "/login";
}

restaurantsDiv.style.display = "none";
timeDiv.style.display = "none";

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loadingContainer.style.display = "flex";
  search = searchQuery.value;
  searching = true;

  searchRestaurant("12:00")
    .then((r) => r.json())
    .then((r) => {
      console.log(r);
      bookingObj = r;
      displayRestaurants(r);
      if (r.length == 0) {
        const h4 = document.createElement("h4");
        h4.innerText = "No such restaurant or location found!";
        h4.classList.add("tc");
        h4.classList.add("mh");
        h4.classList.add("no-bookings");

        restaurantsDiv.replaceWith(h4);
      } else {
        timeDiv.style.display = "flex";
      }
      loadingContainer.style.display =  "none";
    });
});
