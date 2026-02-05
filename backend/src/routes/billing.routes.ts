import { getBillingInfo, processRenewalPayment, getBillingHistory, getBillingStats, deleteBillingRecord, getAdminBillingHistory, getAdminBillingStats, deleteAdminBillingRecord } from "../conttrolers/billing.contollers";
import { verifyToken } from "../middleware/auth";
import { isAdmin } from "../middleware/rbac";

import express from "express";
const billingrouter = express.Router();

// User endpoints
billingrouter.get("/info", verifyToken, getBillingInfo);
billingrouter.post("/process-payment", verifyToken, processRenewalPayment);
billingrouter.get("/history", verifyToken, getBillingHistory);
billingrouter.get("/stats", verifyToken, getBillingStats);
billingrouter.delete("/history/:id", verifyToken, deleteBillingRecord);

// Admin endpoints - require admin role (path is /api/billing/admin/...)
billingrouter.get("/admin/history", verifyToken, isAdmin, getAdminBillingHistory);
billingrouter.get("/admin/stats", verifyToken, isAdmin, getAdminBillingStats);
billingrouter.delete("/admin/history/:id", verifyToken, isAdmin, deleteAdminBillingRecord);

export default billingrouter;