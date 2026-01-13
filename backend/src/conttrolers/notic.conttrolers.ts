import Notice from "../models/notic.models";
import { Request, Response } from "express";

// Create a new notice
export const createNotice = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, title, message, email, phone } = req.body;
        const newNotice = new Notice({
            firstName,
            lastName,
            title,
            message,
            email,
            phone
        });
        const savedNotice = await newNotice.save();
        res.status(201).json(savedNotice);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create notice', message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
// Get all notices with pagination
export const getNotices = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [total, notices] = await Promise.all([
            Notice.countDocuments(),
            Notice.find().skip(skip).limit(limit).sort({ createdAt: -1 })
        ]);
        
        
        res.status(200).json({
            data :notices,
            pagination: {
                Page: page,
                totalPages: Math.ceil(total / limit),
                limit: limit,
                total: total
            },
           
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notices', message: error instanceof Error ? error.message : 'Unknown error' });
    }       
};
// Delete a notice by ID
export const deleteNotice = async (req: Request, res: Response) => {
    try {
        const noticeId = req.params.id;
        const deletedNotice = await Notice.findByIdAndDelete(noticeId);
        if (!deletedNotice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        res.status(200).json({ message: 'Notice deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete notice', message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
