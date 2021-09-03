const resCard = document.querySelector(".res-card");
const restaurantsDiv = document.getElementById("restaurants");
const max = 6;
const min = 1;

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

const displayRestaurants = (restaurants) => {
  let imgNo = 1;
  for (let res of restaurants) {
    const resCardClone = resCard.cloneNode(true);
    //multiplied by 6 because there are 6 images of the restaurant number from 1 to 6
    console.log(res);
    //converting path sent by server to the path that can be understood as div background image
    resCardClone.children[0].style.backgroundImage = `url(${encodeURI(
      res.image
    )})`.replace(/%5C/, "/");
    resCardClone.id = imgNo;
    const ele = resCardClone.children[1].children;
    ele[0].innerText = res.name;
    ele[1].innerText = `Booking Name: ${res.booking_name}`;
    ele[2].innerText = `Tables Booked: ${res.tables}`;
    ele[3].innerText = `Booked for: ${res.time}`;
    ele[4].innerText = `Price: $${res.price}`;

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
