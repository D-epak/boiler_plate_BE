import express from "express";
import validators from "../validators"; // Import validation logic
import controllers from "../controllers"; // Import controllers for handling business logic
import { authenticateUser, validateRequest } from "../middleware"; // Import middleware for authentication and request validation

const router = express.Router(); // Initialize the Express Router

// Route for Razorpay payments, requires user authentication
router.post('/razorpay', authenticateUser, controllers.Payment.payment);
// This route handles the creation of a payment using Razorpay after user authentication

// Route to handle Razorpay webhook to check the payment status
router.post('/razorpay/webhook', controllers.Payment.checkRazorPayPaymentStatus);
// This route listens to Razorpay webhook events and checks payment status

// Route for creating an order using Cashfree, with validation and user authentication
router.post('/cashfree', authenticateUser, controllers.Payment.createOrderCashfree);
// This route validates the request, authenticates the user, and creates a payment order using Cashfree

// Route to check the payment status by order ID
router.get('/status/:orderId', controllers.Payment.checkStatus);
// This route checks the status of a payment order based on the provided orderId

export default router; // Export the router to be used in the main application
