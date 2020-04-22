// Model for Stripe Test App
// tonz.io

// Load Web Server
require("../controller/server.js");

// Modules
const fs = require('fs'); // Filesystem
var test_key = fs.readFileSync("./model/test_key.txt", 'utf8').toString().split("\n"); // Stripe Test API Key
console.log(test_key);
const stripe = require('stripe')(test_key[0]); // Stripe Library

/* FUNCTIONS */

// Get Inventory
async function getInventory(){
    var inventory = JSON.parse(fs.readFileSync('./model/inventory.json','utf8')); // Store Inventory
    //console.log(inventory);
    return inventory;
}

// Calculate Total
async function getTotal(cart, intentID){
    var inventory = JSON.parse(fs.readFileSync('./model/inventory.json','utf8')); // Store Inventory
    var server_total = 0;
    for (i =0; i < cart.length; i++) {
        server_total += inventory.products[i].price*cart[i].quantity;
    }

    // TODO UPDATE INSTEAD OF CREATE A NEW INTENT FOR CHANGES IN PRICE
    console.log(intentID);

    // Create Intent if total is more than 0
    // (should strictly be 50c USD or higher, but just working with AUD for now - no exchange rates yet)
    if(server_total > 0) {
        intent = await createIntent(server_total);
    }
    return [server_total, intent];
}

// Create Payment Intent
async function createIntent(amount) {
    const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'aud',
    });
    return paymentIntent;
}

// Export Functions
exports.getInventory = getInventory;
exports.getTotal = getTotal;
exports.createIntent = createIntent;