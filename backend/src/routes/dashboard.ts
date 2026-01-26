
import {getDashboardStats, getUserDashboardStats } from "../conttrolers/dashboard.controllers";
import { verifyFirebaseToken } from "../middleware/auth";
import { Router } from "express";
const dashboardrouter = Router();

dashboardrouter.get('/stats', getDashboardStats)
dashboardrouter.get('/user-stats', verifyFirebaseToken, getUserDashboardStats)

export default dashboardrouter;

