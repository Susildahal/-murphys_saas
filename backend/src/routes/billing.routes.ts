import { getBillingInfo, processRenewalPayment, getBillingHistory, getBillingStats, deleteBillingRecord, getAdminBillingHistory, getAdminBillingStats, deleteAdminBillingRecord } from "../conttrolers/billing.contollers";
import { verifyFirebaseToken } from "../middleware/auth";
import { isAdmin } from "../middleware/rbac";

import express from "express";
const billingrouter = express.Router();

// User endpoints
billingrouter.get("/info", verifyFirebaseToken, getBillingInfo);
billingrouter.post("/process-payment", verifyFirebaseToken, processRenewalPayment);
billingrouter.get("/history", verifyFirebaseToken, getBillingHistory);
billingrouter.get("/stats", verifyFirebaseToken, getBillingStats);
billingrouter.delete("/history/:id", verifyFirebaseToken, deleteBillingRecord);

// Admin endpoints - require admin role (path is /api/billing/admin/...)
billingrouter.get("/admin/history", verifyFirebaseToken, isAdmin, getAdminBillingHistory);
billingrouter.get("/admin/stats", verifyFirebaseToken, isAdmin, getAdminBillingStats);
billingrouter.delete("/admin/history/:id", verifyFirebaseToken, isAdmin, deleteAdminBillingRecord);

export default billingrouter;