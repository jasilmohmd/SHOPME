

// $(document).ready(function () {

// Attach click event to sidebar links
var quantityselect = document.querySelectorAll('#qty');

quantityselect.forEach((qtyseleted) => {
  qtyseleted.addEventListener('change', function (e) {
    // e.preventDefault(); 
    // Prevent the default behavior of the link

    // Get the href attribute of the clicked link
    var href = $(this).attr('data-pid');
    var quantity = qtyseleted.value;
    // Use AJAX to load content from the specified URL
    $.ajax({
      url: `${href}?qty=${quantity}`,
      type: 'POST',
      success: function (data) {
        console.log('Success');
        // window.location.reload();
        let price = 0;
        let mrp = 0;
        let discount = 0;
        let count = 0;
        document.querySelectorAll('#qty').forEach((element, index) => {
          for (let i = 0; i < Number(element.value); i++) {
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
        document.getElementById('discount').innerHTML = (mrp - price).toLocaleString('en-IN');
        // document.getElementById('discountpercentage').innerHTML = discount;
        document.getElementById('total').innerHTML = price.toLocaleString('en-IN');
        document.getElementById('count').innerHTML = count;
      },
      error: function () {
        // Handle error if the content cannot be loaded
        console.error('Failed to load content.');
      }
    });
  });
})



// });


