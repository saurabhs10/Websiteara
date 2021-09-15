const resCard = document.querySelector(".res-horizontal-card");
const restaurantsDiv = document.getElementById("restaurants");
const loadingContainer = document.getElementById("loading-container");
const max = 6;
const min = 1;

if (!resEmail) {
  alert("You need to login to cancel a restaurant");
  window.location = "/login";
}

const getData = async () => {
  const response = await fetch(`http://localhost:3000/get-user-bookings`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ tableName }),
  });
  return response;
};

const cancelTable = (res, tableInput) => {
  loadingContainer.style.display = "flex";
  res.tableName = tableName;
  res.cancelTables = Number.parseInt(tableInput);
  fetch("http://localhost:3000/cancel-res", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(res),
  })
    .then((r) => r.json())
    .then((r) => {
      loadingContainer.style.display = "none";
      window.location.reload();
    })
    .catch((e) => (loadingContainer.style.display = "none"));
};

const displayRestaurants = (restaurants) => {
  let imgNo = 1;
  for (let res of restaurants) {
    const resCardClone = resCard.cloneNode(true);
    //multiplied by 6 because there are 6 images of the restaurant number from 1 to 6
    const img = (imgNo % 6) + 1;
    //converting path sent by server to the path that can be understood as div background image
    resCardClone.children[0].style.backgroundImage = `url(${encodeURI(
      res.image
    )})`.replace(/%5C/, "/");
    resCardClone.id = img;
    console.log(img);
    const ele = resCardClone.children[1].children;
    ele[0].innerText = res.name;
    ele[1].innerText = `Booking Name: ${res.booking_name}`;
    ele[2].innerText = `Tables Booked: ${res.tables}`;
    ele[3].innerText = `Total Price: $${res.price}`;
    ele[4].innerText = `Booked for: ${res.time}`;

    const form = ele[5];
    const tableInput = form.children[0].children[1];
    tableInput.setAttribute("max", res.tables);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (
        confirm(`Trying to cancel ${tableInput.value} tables of ${res.name}`)
      ) {
        cancelTable(res, tableInput.value);
      }
    });
    restaurantsDiv.appendChild(resCardClone);
    imgNo++;
  }
  resCard.style.display = "none";
};

//getting data from server asynchronously then converting the response
//from server to json format and then sending the coverted json object
//to a function to display the restaurants on the screen.
getData()
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
    if (res.restaurants.length > 0) displayRestaurants(res.restaurants);
    else {
      const h4 = document.createElement("h4");
      h4.innerText = "No prior bookings done!";
      h4.classList.add("tc");
      h4.classList.add("mh");
      h4.classList.add("no-bookings");

      restaurantsDiv.replaceWith(h4);
    }
  });
