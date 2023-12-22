const lPrice = document.querySelector('.lastPrice');
const fPrice = document.querySelector('.firstPrice');
const discount = document.querySelector('.discount');
// const errMesg = document.querySelector('.errMesg');
// const addBtn = document.querySelector('.addBtn');

lPrice.addEventListener('keyup', () => {
	if(Number(fPrice.value) >= Number(lPrice.value)){
		console.log(fPrice.value, typeof fPrice.value, lPrice.value, typeof lPrice.value);
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
		discount.value = `${((fPrice.value - lPrice.value) / fPrice.value) * 100}`
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		errMesg.innerHTML = `First Price needs to be greater than Last Price`;
	}
});

discount.addEventListener('keyup', () => {
	if((Number(discount.value) < 100 && Number(discount.value) >= 0) || !discount.value){
		lPrice.value = `${((fPrice.value * discount.value) / 100)}`
	}else{
		if(Number(discount.value) > 100){
			discount.value = `100`;
			lPrice.value = `0`
		}else{
			discount.value = `0`;
			lPrice.value = `0`;
		}
	}
});

fPrice.addEventListener('keyup', () => {
	if(Number(fPrice.value) >= Number(lPrice.value)){
		discount.value = `${((fPrice.value - lPrice.value) / fPrice.value) * 100}`
		errMesg.innerHTML = ``;
		fPrice.style.border = `none`
		addBtn.setAttribute('type', 'submit');
	}else{
		discount.value = `0`;
		fPrice.style.border = `1px solid red`
		addBtn.setAttribute('type', 'button');
		errMesg.innerHTML = `First Price needs to be greater than Last Price`;
	}
});


