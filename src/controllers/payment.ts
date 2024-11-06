import { Request, Response } from "express"; // Importing Request and Response types from Express
import dbservices from "../services/dbservices"; // Importing database services
import crypto from "crypto"; // Importing crypto for webhook signature verification
import axios from "axios"; // Importing Axios for making HTTP requests
import uniqid from 'uniqid'; // Importing uniqid to generate unique IDs
import { envConfigs } from "../config/envconfig"; // Importing environment configurations

// Payment class containing static methods for handling payment functionalities
export class Payment {

  // Method to handle Razorpay payment
  static razorpayment = async (req: Request, res: Response) => {
    try {
      const userId = req["user"]["userId"];  // Extract user ID from the token
      const amount = req.body.amount;  // Get the amount from the request body

      // Define credits or tokens the user receives based on the payment amount
      const amountToCredits = {
        49: 40,
        100: 100,
        149: 200
      };
      const credits = amountToCredits[amount];  
      if (credits === undefined) throw new Error("Invalid amount");

      // Fetch user details from the database
      const getUserDetails = await dbservices.Payment.getUserDetails(userId);
      if (getUserDetails.length <= 0) throw new Error("User not found");

      // Create an order in Razorpay
      const createPayment = await dbservices.Payment.createPayment(amount, "INR");
      if (!createPayment) throw new Error("Error in creating order");

      // Define payment details to be stored in the database
      const details = {
        orderId: createPayment?.id,
        userId: getUserDetails.id,
        refId: getUserDetails.refId || null,
        credits: credits,
        amount: amount,
        method: "razorpay",
        status: "pending"
      };

      // Insert payment details into the database
      await dbservices.Payment.insertPaymentDetails(details);

      // Send the order details to the frontend
      res.status(200).send({ status: true, message: "Payment Details Inserted", data: { orderId: createPayment?.id } });
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };

  // Method to check the status of Razorpay payments using webhooks
  static checkRazorPayPaymentStatus = async (req: Request, res: Response): Promise<any> => {
    try {
      const webhookSignature = req.headers["x-razorpay-signature"] as string; // Retrieve webhook signature from headers
      const secret = envConfigs.razorpaywebhookSecret; // Retrieve secret from environment variables
      const validate = this.verifyWebhookSignature(JSON.stringify(req.body), webhookSignature, secret); // Verify webhook signature

      if (!validate) throw new Error("Invalid Signature");

      const { event, payload } = req.body; // Extract event and payload from the request body

      if (event === 'payment.authorized') {
        const orderId = payload.payment.entity.order_id;
        if (!orderId) throw new Error("Order Id not found");
        await dbservices.Payment.confirmOrderStatus(orderId, "success");
      } else if (event === 'payment.failed') {
        const orderId = payload.payment.entity.order_id;
        if (!orderId) throw new Error("Order Id not found");
        await dbservices.Payment.updateOrderStatus(orderId, "failed");
      }

      res.sendStatus(200); // Respond with success
    } catch (error) {
      return res.sendStatus(500); // Respond with error
    }
  };

  // Method to verify webhook signature for Razorpay
  static verifyWebhookSignature = (webhookBody: string, webhookSignature: string, secret: string) => {
    const hmac = crypto.createHmac('sha256', secret); // Create an HMAC hash using the secret
    const expectedSignature = hmac.update(webhookBody).digest('hex'); // Generate the expected signature
    return expectedSignature === webhookSignature; // Return true if the signature matches
  };

  // Method to create a payment order using Cashfree
  static createOrderCashfree = async (req: Request, res: Response) => {
    try {
      const userId = req["user"]["userId"].toString(); // Extract user ID from the token
      if (!userId) throw new Error("Error in getting user from userId");

      const { amount, customerPhone } = req.body; // Extract amount and phone from the request body
      const orderId = uniqid(); // Generate a unique order ID

      const amountToCredits = {
        1: 1,
        49: 40,
        100: 100,
        149: 200
      };
      const credits = amountToCredits[amount];
      if (credits === undefined) throw new Error("Invalid amount");

      const getUserDetails = await dbservices.Payment.getUserDetails(userId);
      if (getUserDetails.length <= 0) throw new Error("User not found");

      const createPayment = await dbservices.Payment.createCashfreeOrder(parseInt(amount), "INR", orderId, userId, customerPhone);
      if (!createPayment) throw new Error("Error in creating order");

      const details = {
        orderId: createPayment?.order_id,
        userId: getUserDetails.id,
        refId: getUserDetails.refId || null,
        credits: credits,
        amount: amount,
        method: "cashfree",
        status: "pending"
      };

      await dbservices.Payment.insertPaymentDetails(details);

      res.status(200).send({ status: true, message: "Payment Details Inserted", data: { orderId: createPayment?.order_id, sessionId: createPayment?.payment_session_id } });
    } catch (error) {
      console.error('Error setting up order request:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Payment initiation failed' });
    }
  };

  // Method to check the status of Cashfree payments
  static checkStatus = async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderId; // Extract order ID from the request parameters
      const options = {
        method: 'GET',
        url: `https://api.cashfree.com/pg/orders/${orderId}`, // Cashfree API endpoint to check payment status
        headers: {
          accept: 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': envConfigs.xclientId, // Cashfree client ID from environment variables
          'x-client-secret': envConfigs.xclientSecret, // Cashfree client secret from environment variables
        }
      };

      // Make a request to Cashfree API to check payment status
      axios.request(options).then(function (response) {
        if (response.data.order_status === 'PAID') {
          dbservices.Payment.confirmOrderStatus(orderId, "success"); // Confirm the order status in the database
          const url = `http://localhost:3000/success`;
          res.redirect(url); // Redirect to the success page
        } else {
          dbservices.Payment.updateOrderStatus(orderId, "failed"); // Update the order status as failed
          const url = `https://localhost:3000/failure`;
          res.redirect(url); // Redirect to the failure page
        }
      });
    } catch (error) {
      throw new error;
    }
  };
}
