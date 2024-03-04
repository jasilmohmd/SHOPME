const name1 = document.getElementById("name1");
const nameError = document.getElementById("nameError");
const phone = document.getElementById("phone");
const phoneError = document.getElementById("phoneError");
const password = document.getElementById("password");
const passwordError = document.getElementById("passwordError");
const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const form = document.getElementById("form");

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const phoneNumberRegex = /[0-9]/;

const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;



let passValid = true;

form.addEventListener("submit", (e) => {
  let flag = 0;
  name1.value = name1.value.trim();
  phone.value = phone.value.trim();
  password.value = password.value.trim();
  confirmPassword.value = confirmPassword.value.trim();


  if (phone.value.length != 10 || !phoneNumberRegex.test(Number(phone.value))) {
    flag = 1;
    phoneError.innerHTML = "Invalid Phone number!"
  }

  if (!nameRegex.test(name1.value) || name1.value === '' || name1.value === null || name1.value.length < 3) {
    flag = 1;
    nameError.innerHTML = "Enter a valid name!"
  }

  if (phone.value === '' || phone.value === null) {
    flag = 1;
    phoneError.innerHTML = "Phone number required!"
  }

  if (password.value === '' || password.value === null) {
    flag = 1;
    passwordError.innerHTML = "Password required!"
  }

  if (confirmPassword.value === '' || confirmPassword.value === null) {
    flag = 1;
    confirmPasswordError.innerHTML = "Confirm password required"
  }

  if (confirmPassword.value != password.value) {
    flag = 1;
    confirmPasswordError.innerHTML = "Password doest match"
  }

  if (flag === 1 || !passValid) {
    e.preventDefault();
  }

})


name1.addEventListener("keyup", () => {
  nameError.innerHTML = "";
});

phone.addEventListener("keyup", () => {
  phoneError.innerHTML = "";
});

password.addEventListener("keyup", () => {
  passwordError.innerHTML = "";
  checkStrongPass();
});

confirmPassword.addEventListener("keyup", () => {
  confirmPasswordError.innerHTML = "";
  passwordMatch();
})



function checkStrongPass() {
  const passCheck = document.getElementById("passCheck");
  if (!password.value.match(passRegex)) {
    passwordError.innerHTML = "Strong password required!";
    passCheck.innerHTML = '<i class="bi bi-exclamation-diamond-fill" style="color: #ff0000;"></i>'
    passValid = false;
    return false;
  }
  passValid = true;
  passwordError.innerHTML = "";
  passCheck.innerHTML = '<i class="bi bi-patch-check" style="color: #00a814;"></i>';
  return true;

}

function passwordMatch() {
  const confirmPassCheck = document.getElementById("confirmPassCheck");
  if (confirmPassword.value !== password.value) {
    confirmPassCheck.innerHTML = '<i class="bi bi-exclamation-diamond-fill" style="color: #ff0000;"></i>'
    passValid = false;
    return false;
  }
  else {
    passValid = true;
    confirmPassCheck.innerHTML = '<i class="bi bi-patch-check" style="color: #00a814;"></i>';
    return true;
  }

} 