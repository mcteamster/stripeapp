# Stripe Test App
### by Tony Zhang for Stripe
#### 24.4.2020

"Create a simple e-commerce app" - sure thing, this should be straightforward for a full-stack engineer...

Hosted (for now) at my test domain: https://mcteamster.com 

Or clone this repository and run `npm install`, paste your Stripe account's Private API Test Key into `/model/test_key.txt`, enter your Public API Test Key into `/view/index.js`, run `node /model/app.js`, and visit `http://localhost:80`

### Approach
As always, I begin by boiling down the requirements:
- Use Stripe to process a transaction
- Spend at most a few hours
- Write this document

Essentially the task here is to create a **rapid prototype** that a customer might use to get off the ground and start accepting payments. There's really no need to go over-the-top with features - efficiency is key. So, to accomplish this I've picked my methods and tools accordingly across the whole app's architecture:

**Front-End** - Single Page Web App, written in HTML/CSS/JS. Stripe Elements for Credit Card UI, and jQuery for easy AJAX.

**Back-End** - Node.js Express, with Stripe API. Roughly laid out as MVC for modularity & extensibility.

**Infrastructure** - Docker on AWS. Hosted on my test domain which already uses HTTPS (behind an nginx reverse proxy).

The core of the app revolves around the Stripe PaymentIntents API, which I didn't know how to use until now. Fortunately, Stripe has an amazing API reference guide and it was easy to learn how to **accept payments** (https://stripe.com/docs/payments/accept-a-payment). The rest of the development was basically setting up a storefront that queries what's in stock dynamically and lets the user add and subtract items from their cart. Pricing is calculated server-side and a **paymentIntent clientSecret** is pushed to the customer to finalise their transaction. All of this sits in a Docker container on AWS Lightsail for ease and flexibility. Most importantly HTTPS is enforced, which is a must for any e-commerce site to be PCI compliant (although Stripe API Test Keys do still work over HTTP).

### TODO
At a glance there's obviously plenty of room for improvement - infinite wants and needs, finite resources. Identifying and prioritising new features is an important part of engineering, so I've categorised the TODO list by component:

**Front-End** - UI and UX improvements, multi-page website. For a robust user experience converting to React.js would be the way to go. There's a rudimentary mobile view already too that could use some beautification.

**Back-End** - API optimisation, geolocalisation. I've hardly scratched the surface of the Stripe API, and there's plenty more features to use. **One current major inefficiency** is that changing the cart creates new paymentIntents instead of updating existing ones. Passing more metadata and billing information is also important too. Lastly, localising to the users' native currency would be a nice feature.

**Infrastructure** - Database connectivity, load balancing and scaling. Currently the store inventory is a single JSON file, ideally it should be in a database (my preference is NoSQL). Offloading this to a DB would also help to make the back-end stateless, making it easier to scale and load balance traffic across multiple instances.

### Idempotency
In a nutshell, idempotency means that something has the same effect regardless of if it's repeated. Doing it once has the same outcome as doing it a million times.

This is especially relevant in the context of e-commerce and web requests in general. You do NOT want to be double charging customers if they just happen to hit the 'pay' button twice. Fortunately, idempotency is built into the Payment Intents API so multiple attempts to confirm a payment will only result in a single charge.

### Summary
Thanks for checking out my Stripe Test App. All up I've spent about 1 day working on this. I hope this provides some insight into my engineering techniques and would love to hear any feedback.

(P.S. I do not encourage panic buying)