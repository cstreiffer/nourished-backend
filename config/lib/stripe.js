'use strict';

/**
 * Stripe module to provide the checkout flow.
 * Configure the stripe public key, secret key, and webhook secret in config/env/NODE_ENV.js
 *
 *
 * Example of creating a payment intent
 *   app.post("/create-payment-intent", async (req, res) => {
 *     const { items, currency } = req.body;
 *     // Create a PaymentIntent with the order amount and currency
 *     const paymentIntent = await stripe.paymentIntents.create({
 *       amount: calculateOrderAmount(items),
 *       currency: currency
 *     });
 *
 *    // Send publishable key and PaymentIntent details to client
 *    res.send({
 *      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
 *      clientSecret: paymentIntent.client_secret
 *    });
 *  });
 *
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
