let files = [],
button = document.querySelector(".submit-btn"),
form = document.querySelector("form"),
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

  for(let i=0; i< file.length; i++){
    if (file[i].type.split("/")[0] !== "image") {
      document.getElementById("imageError").innerHTML = "Only images are allowed!"
      return
    }
    files[0]= file[i];
  }
  // form.reset();
  showImages();
})

const showImages = () => {
  let images = "";
  files.forEach((e,i)=> {
    images = `<div class="image">
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
  for(let i=0; i< file.length; i++){
    files.push(file[i])
  }
  // form.reset();
  showImages();
})

const cName = document.getElementById("cName");
const cNameError = document.getElementById("cNameError");

const nameRegex = /^[a-zA-Z0-9\s()\-,.]+$/;

button.addEventListener("click", (e) => {

  let flag = 0;

  cName.value = cName.value.trim();

  if (cName.value === '' || cName.value === null) {
    flag = 1;
    cNameError.innerHTML = "You left the field empty!"
  }
  else if (!nameRegex.test(cName.value) || cName.value.length < 3) {
    flag = 1;
    cNameError.innerHTML = "Enter a valid Product name!"
  }

  if (flag === 1) {
    e.preventDefault();
    return
  }

  let formData = new FormData();
  files.forEach((e, i) => formData.append(`file[${i}]`, e))
  form.submit();
})

cName.addEventListener("keyup", () => {
  cNameError.innerHTML = "";
});