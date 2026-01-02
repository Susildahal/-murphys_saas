import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({ 
 name: String,
  type: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'square'], required: true },
  apiKey: String,
  secretKey: String,
  webhookSecret: String,
  isActive: Boolean,
  isTestMode: Boolean

}, { timestamps: true });
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
