const email = document.getElementById("email") || 0 ;
const emailError = document.getElementById("emailError") || 0 ;
const password = document.getElementById("password") || 0 ;
const passwordError = document.getElementById("passwordError")|| 0 ;
const form = document.querySelector("#form");
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

let emailValid = true;

form.addEventListener("submit", (e) => {
  let flag = 0;

  if ( !emailValid ) {
    flag=1;
    emailError.innerHTML="Please enter a valid email !"
  }

  if ( email.value == '' || email.value == null) {
    flag=1;
    emailError.innerHTML="Please enter an email !"
  }

  if (password.value === '' || password.value === null) {
    flag = 1;
    passwordError.innerHTML = "Password required!"
  }

  if(flag===1||!emailValid){
    e.preventDefault()
  }

})

email.addEventListener("keyup", ()=>{
  emailError.innerHTML="";
  emailValidate();
} )

if(password){
  password.addEventListener("keyup", ()=>{
    passwordError.innerHTML="";
  } )
}

function emailValidate() {
  let emailCheck = document.getElementById("emailCheck")|| 0;

  if (!email.value.match(emailRegex)) {
    if(emailCheck){
      emailCheck.innerHTML = '<i class="bi bi-exclamation-diamond-fill" style="color: #ff0000;"></i>';
    }
    emailValid = false;
    return false
  }
  emailValid = true;
  emailCheck.innerHTML = '<i class="bi bi-patch-check" style="color: #00a814;"></i>';
  return true;

}