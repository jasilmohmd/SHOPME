let files = [],
  button = document.querySelector(".submit-btn"),
  // form = document.querySelector("form"),
  drop = document.querySelector(".image-upload"),
  container = document.querySelector(".container1"),
  text = document.querySelector(".inner"),
  browse = document.querySelector(".select"),
  input = document.querySelector(".image-upload input");


browse.addEventListener("click", () => input.click());

//input change event
input.addEventListener("change", () => {
  let file = input.files;
  document.getElementById("imageError").innerHTML = "";

  for (let i = 0; i < file.length; i++) {
    if(file[i].type.split("/")[0]!=="image"){
      document.getElementById("imageError").innerHTML = "Only images are allowed!"
      return
    }
    files.push(file[i])
  }
  // form.reset();
  showImages();
})

const showImages = () => {
  let images = "";
  files.forEach((e, i) => {
    images += `<div class="image">
    <img src="${URL.createObjectURL(e)}" >
    <span onclick="delImages(${i})">&times;</span>
  </div>`
  })

  container.innerHTML = images;

}

const delImages = (index) => {
  files.splice(index, 1);
  showImages();
}

// drag and drop
drop.addEventListener("dragover", e => {
  e.preventDefault()
  // drop.classList.add("dragover");
  // text.innerHTML = "Drop images here"
})

drop.addEventListener("dragleave", e => {
  e.preventDefault()
  // drop.classList.remove("dragover");
  // text.innerHTML = `Drag & drop images here or 
  // <span class="select">Browse</span>`
})

drop.addEventListener("drop", e => {
  e.preventDefault()

  let file = e.dataTransfer.files;
  for (let i = 0; i < file.length; i++) {
    files.push(file[i])
  }
  // form.reset();
  showImages();
})


const pName = document.getElementById("pName");
const pNameError = document.getElementById("pNameError");
const bName = document.getElementById("bName");
const bNameError = document.getElementById("bNameError");
const subTitle = document.getElementById("subTitle");
const subTitleError = document.getElementById("subTitleError");
const descriptionHead = document.getElementById("descriptionHead");
const descriptionHeadError = document.getElementById("descriptionHeadError");
const description = document.getElementById("description");
const descriptionError = document.getElementById("descriptionError");
const firstPrice = document.getElementById("firstPrice");
const firstPriceError = document.getElementById("firstPriceError");
const lastPrice = document.getElementById("lastPrice");
const lastPriceError = document.getElementById("lastPriceError");
const discount = document.getElementById("discount");
const discountError = document.getElementById("discountError");
const colour = document.getElementById("colour");
const colourError = document.getElementById("colourError");
const inStock = document.getElementById("inStock");
const inStockError = document.getElementById("inStockError");
// const button = document.querySelector(".submit-btn")


const form = document.getElementById("form");


const nameRegex = /^[a-zA-Z0-9]+(?:[-,.]?[a-zA-Z0-9]+)*$/
const numberRegex = /^[0-9]+$/;


button.addEventListener("click", (e) => {

  let flag = 0;

  pName.value = pName.value.trim();
  bName.value = bName.value.trim();

  console.log(pName.value);

  if ( pName.value === '' || pName.value === null ) {
    flag = 1;
    pNameError.innerHTML = "You left the field empty!"
  }
  else if(!nameRegex.test(pName.value) || pName.value.length < 3){
    flag = 1;
    pNameError.innerHTML = "Enter a valid Product name!"
  }

  if (bName.value === '' || bName.value === null ) {
    flag = 1;
    bNameError.innerHTML = "You left the field empty!"
  }
  else if(!nameRegex.test(bName.value) || bName.value.length < 3){
    flag = 1;
    bNameError.innerHTML = "Enter a valid Brand name!"
  }

  if ( subTitle.value === '' || subTitle.value === null ) {
    flag = 1;
    subTitleError.innerHTML = "You left the field empty!"
  }
  else if(!nameRegex.test(subTitle.value) ||  subTitle.value.length < 3){
    flag = 1;
    subTitleError.innerHTML = "Enter a valid Subtitle!"
  }

  if ( descriptionHead.value === '' || descriptionHead.value === null ) {
    flag = 1;
    descriptionHeadError.innerHTML = "You left the field empty!"
  }

  if ( description.value === '' || description.value === null ) {
    flag = 1;
    descriptionError.innerHTML = "You left the field empty!"
  }

  if ( colour.value === '' || colour.value === null ) {
    flag = 1;
    colourError.innerHTML = "You left the field empty!"
  }
  else if(!nameRegex.test(colour.value) || colour.value.length < 3){
    flag = 1;
    colourError.innerHTML = "Enter a valid Color!"
  }

  if ( firstPrice.value === '' || firstPrice.value === null ) {
    flag = 1;
    firstPriceError.innerHTML = "You left the field empty!"
  }
  else if(!numberRegex.test(firstPrice.value) || firstPrice.value < 0 ){
    flag = 1;
    firstPriceError.innerHTML = "Enter a valid price!"
  }

  if ( lastPrice.value === '' || lastPrice.value === null ) {
    flag = 1;
    lastPriceError.innerHTML = "You left the field empty!"
  }
  else if(!numberRegex.test(lastPrice.value) || lastPrice.value < 0 ){
    flag = 1;
    lastPriceError.innerHTML = "Enter a valid price!"
  }

  if ( discount.value === '' || discount.value === null ) {
    flag = 1;
    discountError.innerHTML = "You left the field empty!"
  }
  else if(!numberRegex.test(discount.value) || discount.value < 0 ){
    flag = 1;
    discountError.innerHTML = "Enter a valid discount!"
  }

  if ( inStock.value === '' || inStock.value === null ) {
    flag = 1;
    inStockError.innerHTML = "You left the field empty!"
  }
  else if(!numberRegex.test(inStock.value) || inStock.value < 0 ){
    flag = 1;
    inStockError.innerHTML = "Enter a valid Stock!"
  }

  if(files.length<1){
    flag = 1;
    document.getElementById("imageError").innerHTML = "select an image"
  }

  if (flag === 1) {
    e.preventDefault();
    return
  }

  let formData = new FormData();
  files.forEach((e, i) => formData.append(`file[${i}]`, e))
  form.submit();
})

pName.addEventListener("keyup", () => {
  pNameError.innerHTML = "";
});

bName.addEventListener("keyup", () => {
  bNameError.innerHTML = "";
});

subTitle.addEventListener("keyup", () => {
  subTitleError.innerHTML = "";
});

firstPrice.addEventListener("keyup", () => {
  firstPriceError.innerHTML = "";
});

lastPrice.addEventListener("keyup", () => {
  lastPriceError.innerHTML = "";
});

discount.addEventListener("keyup", () => {
  discountError.innerHTML = "";
});

colour.addEventListener("keyup", () => {
  colourError.innerHTML = "";
});

inStock.addEventListener("keyup", () => {
  inStockError.innerHTML = "";
});