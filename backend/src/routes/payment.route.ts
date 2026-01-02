import { Router } from "express";
import { createPayment, getPayments, getPaymentById, updatePayment, deletePayment } from "../conttrolers/payment.conttrolers";

const paymentrouter = Router();
paymentrouter.post("/payments", createPayment);
paymentrouter.get("/payments", getPayments);
paymentrouter.get("/payments/:id", getPaymentById);
paymentrouter.put("/payments/:id", updatePayment);
paymentrouter.delete("/payments/:id", deletePayment);
export default paymentrouter;
