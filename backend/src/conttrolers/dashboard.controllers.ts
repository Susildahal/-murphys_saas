import { Request, Response } from "express";
import Profile from "../models/profile.model";
import Service from "../models/service.model";
import AssignedService from "../models/assignService.routes";
import Notice from "../models/notic.models";
import Category from "../models/category.model";
import Cart from "../models/cart.model";
import Ticket from "../models/ticket.model";
import BillingHistory from "../models/billingHistory.model";

// Helper function to get date range based on filter
const getDateRange = (filter: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        $gte: yesterday,
        $lt: today
      };

    case 'this_week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        $gte: startOfWeek,
        $lte: now
      };

    case 'last_week':
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
      return {
        $gte: lastWeekStart,
        $lt: lastWeekEnd
      };

    case 'this_month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        $gte: startOfMonth,
        $lte: now
      };

    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return {
        $gte: lastMonthStart,
        $lte: lastMonthEnd
      };

    case 'last_30_days':
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);
      return {
        $gte: last30Days,
        $lte: now
      };

    case 'last_90_days':
      const last90Days = new Date(today);
      last90Days.setDate(today.getDate() - 90);
      return {
        $gte: last90Days,
        $lte: now
      };

    default: // 'all'
      return null;
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string || 'all';
    const dateRange = getDateRange(filter);

    // Build query object for filtering
    const assignedQuery = dateRange ? { createdAt: dateRange } : {};
    const profileQuery = dateRange ? { createdAt: dateRange } : {};
    const noticeQuery = dateRange ? { createdAt: dateRange } : {};

    const [
      totalServices,
      totalAssigned,
      totalNotices,
      unreadNotices,
      totalCategories,
      totalProfiles,
      activeService,
      inactiveService,
      recentAssign,
    ] = await Promise.all([
      Service.countDocuments(),
      AssignedService.countDocuments(assignedQuery),
      Notice.countDocuments(noticeQuery),
      Notice.countDocuments({ ...noticeQuery, status: false }),
      Category.countDocuments(),
      Profile.countDocuments(profileQuery),
      Service.countDocuments({ status: "active" }),
      Service.countDocuments({ status: "inactive" }),
      AssignedService.find(assignedQuery).sort({ createdAt: -1 }).limit(5),
    ]);

    return res.status(200).json({
      totalServices,
      totalAssigned,
      totalNotices,
      unreadNotices,
      totalCategories,
      totalProfiles,
      activeService,
      inactiveService,
      recentAssign,
      filter, // Return the applied filter
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getUserDashboardStats = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }

    const filter = req.query.filter as string || 'all';
    const dateRange = getDateRange(filter);

    // Build query object for filtering
    const dateQuery = dateRange ? { createdAt: dateRange } : {};
    const baseQuery = { email: email };
    const ticketQuery = { userEmail: email, ...dateQuery };
    const billingQuery = { user_email: email, ...dateQuery };

    // Combine date query with base query for assigned services
    const assignedServiceQuery = { ...baseQuery, ...dateQuery };

    const [
      activeServices,
      totalTickets,
      openTickets,
      pendingInvoices,
      totalSpent,
      recentServices,
      unreadNoticesCount
    ] = await Promise.all([
      AssignedService.countDocuments({ ...baseQuery, status: 'active' }),
      Ticket.countDocuments({ userEmail: email }),
      Ticket.countDocuments({ userEmail: email, status: { $in: ['open', 'in-progress'] } }),
      BillingHistory.countDocuments({ user_email: email, payment_status: 'pending' }),
      BillingHistory.aggregate([
        { $match: { user_email: email, payment_status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      AssignedService.find(assignedServiceQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('service_name status price createdAt'),
      Notice.countDocuments({ status: false }) // Keeping global unread notices or maybe filtering by checking if read by user if implemented
    ]);

    return res.status(200).json({
      stats: {
        activeServices,
        openTickets,
        pendingInvoices,
        totalSpent: totalSpent[0]?.total || 0,
        unreadNotices: unreadNoticesCount,
        totalTickets
      },
      recentServices,
      filter
    });

  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    return res.status(500).json({ error: "Failed to fetch user dashboard stats" });
  }
};