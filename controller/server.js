// Controller for Stripe Test Web App
// tonz.io

// Modules
const exp = require('express'); // Express Web Server
const path = require('path'); // Path Resolver
const f = require('../model/app.js'); // App Functions 

// Start Server
const app = exp();
app.listen(80);
console.log("Server Listening at localhost:80");

// Configure BodyParser
app.use(exp.json({
    limit: '1mb',
    extended: true
}));
app.use(exp.urlencoded({
    limit: '1mb',
    extended: true
}));

// Set Public Resources
app.use(exp.static('view'));

// Send Homepage
app.get('/', (req,res) => {
    res.status(200);
    res.sendFile(path.resolve('view/html/index.html'));
});

// Send Inventory
app.get('/inventory', async (req,res) => {
    var inventory = await f.getInventory();
    res.json(inventory);
});

// Calculate Total and Return Secret
app.post('/total', async (req,res) => {
    var [server_total, intent] = await f.getTotal(req.body.inventory, req.body.intentID);
    res.json({total: server_total, intentID: intent.id, client_secret: intent.client_secret});
});