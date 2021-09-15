//This file is used by both booking and search page
const resCard = document.querySelector(".res-horizontal-card");
const restaurantsDiv = document.getElementById("restaurants");
const tableTime = document.getElementById("table-time");
const resCardFirstClone = resCard.cloneNode(true);
const bookForm = document.getElementById("book-form");
const bookingModal = document.getElementById("booking-modal");
const modalHead = document.getElementById("modal-head");
const closeModal = document.querySelector(".close");
const bookingTables = document.getElementById("booking-tables");
const bookingName = document.getElementById("booking-name");
const startTime = 12;
let bookingObj;
let searching = false;
let search;

for (let i = 0; i < 11; i++) {
  const time = `${startTime + i}:00`;
  const option = document.createElement("option");
  option.innerText = time;
  tableTime.appendChild(option);
}

const searchRestaurant = async (time) => {
  const result = await fetch("http://localhost:3000/search-res", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ search, time }),
  });
  return result;
};

const fetchRestaurants = async () => {
  const restaurants = await fetch(
    "http://localhost:3000/get-restaurants-by-time",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ time: tableTime.value }),
    }
  );
  return restaurants;
};

const bookTables = () => {
  bookingObj.tableName = tableName;
  bookingObj.bookTables = bookingTables.value;
  bookingObj.bookingName = bookingName.value;
  bookingObj.price = bookingObj.bookTables * bookingObj.price;
  //changing becuase event listener is set at the start so time will always be sent as 12:00
  bookingObj.time = tableTime.value;

  console.log(bookingObj);
  fetch("http://localhost:3000/book-res", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(bookingObj),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.booked) {
        window.location = "/";
      }
    });
  console.log(`Trying to book ${bookingTables.value} tables`);
};

const displayRestaurants = (restaurants) => {
  let imgNo = 1;
  restaurantsDiv.innerHTML = "";
  for (let res of restaurants) {
    const resCardClone = resCardFirstClone.cloneNode(true);
    //multiplied by 6 because there are 6 images of the restaurant number from 1 to 6
    console.log(res);
    //converting path sent by server to the path that can be understood as div background image
    resCardClone.children[0].style.backgroundImage = `url(${encodeURI(
      res.image
    )})`.replace(/%5C/, "/");
    resCardClone.id = imgNo;

    const ele = resCardClone.children[1].children;
    ele[0].innerText = res.name;
    ele[1].innerText = `Tables: ${res.tables}`;
    ele[2].innerText = `Price per Table: $${res.price}`;
    ele[3].innerText = `Location: ${res.location}`;
    ele[4].innerText = `Description: ${res.description}`;

    const bookBtn = resCardClone.children[2].children[0];

    bookBtn.addEventListener("click", () => {
      modalHead.innerText = `Book tables for ${res.name} at ${res.time}`;
      bookingTables.setAttribute("max", res.tables);
      bookingModal.style.display = "flex";
      bookingObj = res;
    });

    //since a restaurants where 0 tables are remaining doesn'nt need to be shown
    if (res.tables > 0) restaurantsDiv.appendChild(resCardClone);
    imgNo++;
  }
  resCard.style.display = "none";
  restaurantsDiv.style.display = "block";
};

//closes the modal
closeModal.addEventListener("click", () => {
  bookingModal.style.display = "none";
});

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  bookTables();
});

tableTime.addEventListener("change", () => {
  if (searching) {
    searchRestaurant(tableTime.value)
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
        loadingContainer.style.display = "none";
      });
  } else {
    fetchRestaurants()
      .then((res) => res.json())
      .then((res) => displayRestaurants(res));
  }
});
