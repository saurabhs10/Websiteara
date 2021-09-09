const add = document.getElementById("add");
const edit = document.getElementById("edit");
const remove = document.getElementById("remove");
const addModal = document.getElementById("add-modal");
const modalClose = document.querySelectorAll(".close");
const resCards = document.getElementsByClassName("res-card");
const resCard = document.querySelector(".res-card");
const restaurantsDiv = document.getElementById("restaurants");
const max = 6;
const min = 1;
let editActive = false;
let removeActive = false;

add.addEventListener("click", () => {
  addModal.style.display = "block";
});

modalClose[0].addEventListener("click", () => {
  addModal.style.display = "none";
});

edit.addEventListener("click", () => {
  //de-activate button if it is active.
  if (editActive) {
    for (let resCard of resCards) {
      resCard.children[0].classList.remove("fa-edit");
      editActive = false;
    }
  }
  //activate edit button if it is not activated and listen for clicks
  else {
    for (let resCard of resCards) {
      resCard.children[0].classList.remove("fa-times");
      resCard.children[0].classList.add("fa-edit");
      resCard.children[0].addEventListener("click", () => {
        editRes(resCard);
      });
    }
    editActive = true;
  }
});

remove.addEventListener("click", () => {
  if (removeActive) {
    for (let resCard of resCards) {
      resCard.children[0].classList.remove("fa-times");
      removeActive = false;
    }
  } else {
    for (let resCard of resCards) {
      resCard.children[0].classList.remove("fa-edit");
      resCard.children[0].classList.add("fa-times");
      resCard.children[0].addEventListener("click", () => {
        removeRes(resCard);
      });
    }
    removeActive = true;
  }
});

function removeRes(resCard) {
  const restaurantName = resCard.children[2].children[0].innerText;
  let removeRes = confirm(`Remove ${restaurantName} restaurant`);
  if (removeRes) {
    fetch("http://localhost:3000/remove-res", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ restaurantName }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.deleted) resCard.style.display = "none";
      });
  }
}

const displayRestaurants = (restaurants) => {
  let imgNo = 1;
  for (res of restaurants) {
    const resCardClone = resCard.cloneNode(true);
    //converting path sent by server to the path that can be understood as div background image
    resCardClone.children[1].style.backgroundImage = `url(${encodeURI(
      res.image
    )})`.replace(/%5C/, "/");
    resCardClone.id = imgNo;
    const ele = resCardClone.children[2].children;
    ele[0].innerText = res.name;
    ele[1].innerText = `Tables: ${res.tables}`;
    ele[2].innerText = `Location: ${res.location}`;
    ele[3].innerText = `Price: $${res.price}`;

    restaurantsDiv.appendChild(resCardClone);
    imgNo++;
  }
  resCard.style.display = "none";
};

const fetchRestaurants = async () => {
  const restaurants = await fetch("http://localhost:3000/get-restaurants");
  return restaurants;
};

fetchRestaurants()
  .then((res) => res.json())
  .then((res) => displayRestaurants(res));
