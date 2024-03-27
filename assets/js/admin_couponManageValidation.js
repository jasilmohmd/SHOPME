const couponCode = document.getElementById("couponCode");
const couponCodeError = document.getElementById("couponCodeError");
const discount = document.getElementById("discount");
const discountError = document.getElementById("discountError");
const endDate = document.getElementById("endDate");
const endDateError = document.getElementById("endDateError");
const startDate = document.getElementById("startDate");
const priceAbove = document.getElementById("priceAbove");
const priceAboveError = document.getElementById("priceAboveError");

const form = document.getElementById("form");


const nameRegex = /^[a-zA-Z0-9]+$/;
const numberRegex = /^[0-9]+$/;


form.addEventListener("submit", (e) => {
  let flag = 0;
  couponCode.value = couponCode.value.trim();
  discount.value = discount.value.trim();
  priceAbove.value = priceAbove.value.trim();


  if ( couponCode.value === '' || couponCode.value === null ) {
    flag = 1;
    couponCodeError.innerHTML = "You left the field empty!"
  }else if(!nameRegex.test(couponCode.value) || couponCode.value.length < 3){
    flag = 1;
    couponCodeError.innerHTML = "Enter a valid CouponCode!"
  }

  if (discount.value === '' || discount.value === null) {
    flag = 1;
    discountError.innerHTML = "You left the field empty!"
  }
  else if (!numberRegex.test(discount.value) || discount.value < 0 || discount.value > 90) {
    flag = 1;
    discountError.innerHTML = "Enter a valid discount percentage!"
  }

  if (endDate.value === '' || endDate.value === null) {
    flag = 1;
    endDateError.innerHTML = "You left the field empty!"
  }else {
    const selectedDate = new Date(endDate.value);
    const start = new Date(startDate.value);
    if (selectedDate < new Date()) {
      flag = 1;
      endDateError.innerHTML = "Choose a date in the future!";
    }else if(selectedDate < start){
      flag = 1;
      endDateError.innerHTML = "Choose a date greater than from";
    }
    else{
      endDateError.innerHTML = "";
    }
  }

  if (priceAbove.value === '' || priceAbove.value === null) {
    flag = 1;
    priceAboveError.innerHTML = "You left the field empty!"
  }
  else if (!numberRegex.test(priceAbove.value) || priceAbove.value < 0) {
    flag = 1;
    priceAboveError.innerHTML = "Enter a valid price!"
  }


  if (flag === 1) {
    e.preventDefault();
  }

})


couponCode.addEventListener("keyup", () => {
  couponCodeError.innerHTML = "";
});

discount.addEventListener("keyup", () => {
  discountError.innerHTML = "";
});

priceAbove.addEventListener("keyup", () => {
  priceAboveError.innerHTML = "";
});


