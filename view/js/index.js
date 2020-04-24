// View for Stripe Test App
// tonz.io

// Load Stripe Elements
var stripe = Stripe('pk_test_NXg5gmsRIajNh28510ot7unI00Yn02UZAZ');
var elements = stripe.elements();

// Variables
var intentID;
var clientSecret;
var inventory;

// Hide Checkout on Load
$("#payment-form").hide();

// Populate Shop
async function populate() {
  // Retrieve Inventory
  await $.get("./inventory", (res) => {
    inventory = res.products;
  });
  // Iterate
  for (i =0; i < inventory.length; i++) {
    inventory[i].quantity = 0; // Initialise 0 of each item
    var product = inventory[i];
    var name = product.name;
    var picture = product.picture;
    var price = `$${(product.price/100).toFixed(2)}`;
    var limit = product.limit;
    $("#products").append(`
    <li id="p${i}" class="product">
      <img src="${picture}" height="100" width="100">
      <p>${name}</p>
      <p>${price}</p>
      <p>Max:&nbsp;${limit}</p>
      <span class="counter flex">
        <p class="quantity "onclick="minus(${i})">-</p>
        <p id="count_${i}">0</p>
        <p class="quantity" onclick="plus(${i})">+</p>
      </span>
    </li>
    `);
  }
}
populate();

// Adjust Amounts and Calculate Total
function plus(i) {
  var count = inventory[i].quantity;
  if(count < inventory[i].limit) {
    inventory[i].quantity++;
  } else {
    inventory[i].quantity = inventory[i].limit;
  }
  $(`#count_${i}`).text(inventory[i].quantity);
  getTotal();
}

function minus(i) {
  var count = inventory[i].quantity;
  if(count > 0) {
    inventory[i].quantity--;
  } else {
    inventory[i].quantity = 0;
  }
  $(`#count_${i}`).text(inventory[i].quantity);
  getTotal();
}

async function getTotal() {
  // Calculate Total Locally
  var client_total = 0;
  var server_total = 0;
  for (i =0; i < inventory.length; i++) {
    client_total += inventory[i].price*inventory[i].quantity;
  }
  $("#checkout").html(`Checkout<br>$${(client_total/100).toFixed(2)}`);

  // Get Total from Server
  await $.post("./total", {inventory, intentID}, (res) => {
    server_total = res.total;
    clientSecret = res.client_secret;
    intentID = res.intentID;
  });
  //console.log(clientSecret);
  //console.log(intentID);
  if(server_total == client_total) {
    $("#server_total").text(`Total Price: $${(server_total/100).toFixed(2)}`)
    return server_total;
  } else {
    return false;
  }
}

// Toggle Checkout
$("#checkout").on("click", (e) => {
  // Show Card Form
  $("#payment-form").toggle();
})

// Set up Stripe.js and Elements to use in checkout form
var style = {
    base: {
      color: "#32325d",
    }
  };
  
  var card = elements.create("card", { style: style });
  card.mount("#card-element");

  card.addEventListener('change', function(event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

// Send Payment
var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
  name = "Tonz Test";
  ev.preventDefault();
  stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: card,
      billing_details: {
        name: name
      }
    }
  }).then(function(result) {
    // Clear Form
    $("#payment-form").html('Processing...');
    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message);
      $("#payment-form").html(`<p id="failure" onclick="location.reload();">Payment Failed<br><br>Click Here to Reload the Page</p>`);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        // Show a success message to your customer
        // TODO: There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
        var amount = result.paymentIntent.amount;
        var intentID = result.paymentIntent.id;
        $("#payment-form").html(`Payment of $${(amount/100).toFixed(2)} was Successful<br><br>ID: ${intentID}`);
      }
    }
  });
});