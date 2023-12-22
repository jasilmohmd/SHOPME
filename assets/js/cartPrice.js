callme()
document.querySelectorAll('#qty').forEach(element => {
    element.addEventListener('change',callme())
});


function callme(){
    let price=0;  
    let mrp=0; 
    let discount=0; 
    let count=0; 
    document.querySelectorAll('#qty').forEach((element,index)=>{
        for(let i=0;i<Number(element.value);i++){
            const priceElement = document.querySelectorAll('#price');
            price += Number(priceElement[index].innerHTML);
            const mrpElement = document.querySelectorAll('#mrp');
            // console.log(mrpElement[index].innerHTML);
            mrp += Number(mrpElement[index].innerHTML);

            // console.log(mrp);
          
            count++;
        }

        
        // const discountElement = document.querySelectorAll('#discountp');
        // discount+= Number(discountElement[index].value)
    })
    document.getElementById('totalmrp').innerHTML = mrp.toLocaleString('en-IN');
    document.getElementById('discount').innerHTML = (mrp-price).toLocaleString('en-IN');
    // document.getElementById('discountpercentage').innerHTML = discount;
    document.getElementById('total').innerHTML = price.toLocaleString('en-IN');
    document.getElementById('count').innerHTML = count;

}