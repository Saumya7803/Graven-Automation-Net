// STICKY HEADER
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (window.scrollY > 0) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
});

// BUYERS  GUIDE PAGE
// const propertyValue = document.querySelector("#propertyValue");
// propertyValue.addEventListener("change", () => {
//   console.log("changing");
// });
