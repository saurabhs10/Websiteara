const addResForm = document.getElementById("add-form");
const editForm = document.getElementById("edit-form");
const resImage = document.getElementById("res-image");
const resName = document.getElementById("res-name");
const resTables = document.getElementById("res-tables");
const resLocation = document.getElementById("res-location");
const resPrice = document.getElementById("res-price");
const resDesc = document.getElementById("res-desc");

const editModal = document.getElementById("edit-modal");
const editResForm = document.getElementById("edit-form");
const editResName = document.getElementById("edit-res-name");
const editResTables = document.getElementById("edit-res-tables");
const editResLocation = document.getElementById("edit-res-location");
const editResPrice = document.getElementById("edit-res-price");
const editResDesc = document.getElementById("edit-res-desc");
let prevTables = 0;

modalClose[1].addEventListener("click", () => {
  editModal.style.display = "none";
});

addResForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const obj = {
    resName: resName.value,
    resTables: resTables.value,
    resLocation: resLocation.value,
    resPrice: resPrice.value,
    resDesc: resDesc.value,
    resImage: resImage.files[0],
  };
  const data = new FormData();
  for (let key in obj) {
    data.append(key, obj[key]);
  }
  fetch("http://localhost:3000/insert-res", {
    method: "POST",
    // headers: {
    //   "Content-type": "application/json",
    // },
    body: data,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.inserted) window.location = "/";
      else {
        const h4 = document.createElement("h4");
        h4.innerText = "Restaurant already exists, try updating.";
        h4.classList.add("tc");
        h4.classList.add("mh");
        h4.style.color = "white";
        addModal.appendChild(h4);
      }
    });
});

editResForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch("http://localhost:3000/update-res", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      resName: editResName.value,
      resTables: editResTables.value,
      resLocation: editResLocation.value,
      resPrice: editResPrice.value,
      resDesc: editResDesc.value,
      resPrevTables: prevTables,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.updated) window.location = "/";
      else {
        const h4 = document.createElement("h4");
        h4.innerText = "Restaurant couldn't be updated.";
        h4.classList.add("tc");
        h4.classList.add("mh");
        h4.style.color = "white";
        addModal.appendChild(h4);
      }
    });
});

function editRes(resCard) {
  const restaurantName = resCard.children[2].children[0].innerText;
  fetch("http://localhost:3000/get-one-restaurant", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ name: restaurantName }),
  })
    .then((res) => res.json())
    .then((res) => {
      editResName.value = res.name;
      editResLocation.value = res.location;
      editResTables.value = res.tables;
      editResDesc.value = res.description;
      editResPrice.value = res.price;
      //used to update the number of tables in restaurants
      prevTables = res.tables;
      editModal.style.display = "block";
    });
}
