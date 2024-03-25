
const oldPassword = document.getElementById("oldPassword");
const oldPasswordError = document.getElementById("oldPasswordError");
const password = document.getElementById("password");
const passwordError = document.getElementById("passwordError");
const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const form = document.getElementById("form");

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/;




let passValid = true;

form.addEventListener("submit", (e) => {
  let flag = 0;
  oldPassword.value = oldPassword.value.trim();
  password.value = password.value.trim();
  confirmPassword.value = confirmPassword.value.trim();

  if (oldPassword.value === '' || oldPassword.value === null) {
    flag = 1;
    oldPasswordError.innerHTML = "Password required!"
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