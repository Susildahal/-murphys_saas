
import {getDashboardStats, getUserDashboardStats } from "../conttrolers/dashboard.controllers";

import { Router } from "express";
const dashboardrouter = Router();

dashboardrouter.get('/stats', getDashboardStats)
dashboardrouter.get('/user-stats', getUserDashboardStats)

export default dashboardrouter;

