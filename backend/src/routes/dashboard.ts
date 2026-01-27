
import {getDashboardStats, getUserDashboardStats } from "../conttrolers/dashboard.controllers";
import { verifyFirebaseToken} from "../middleware/auth";
import { Router } from "express";
const dashboardrouter = Router();
import { isAdmin } from "../middleware/rbac";

dashboardrouter.get('/stats', verifyFirebaseToken, isAdmin, getDashboardStats)
dashboardrouter.get('/user-stats', verifyFirebaseToken, getUserDashboardStats)

export default dashboardrouter;

    