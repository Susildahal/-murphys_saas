import {getDashboardStats } from "../conttrolers/dashboard.controllers";

import { Router } from "express";
const dashboardrouter = Router();

dashboardrouter.get('/stats', getDashboardStats )

export default dashboardrouter;
