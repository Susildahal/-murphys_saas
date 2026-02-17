import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  updateTicketStatus
} from '../conttrolers/ticket.controller';
import upload from '../middleware/upload';
import cloudinaryMultiUpload from '../middleware/cloudinaryMultiUpload';
import { verifyToken } from '../middleware/auth';

const ticketRouter = express.Router();

// Create ticket with optional image uploads
ticketRouter.post('/tickets', verifyToken, upload.array('images', 5), cloudinaryMultiUpload, createTicket);

// Get all tickets with filters
ticketRouter.get('/tickets', verifyToken, getTickets);

// Get single ticket
ticketRouter.get('/tickets/:id', verifyToken, getTicketById);

// Update ticket
ticketRouter.put('/tickets/:id', verifyToken, upload.array('images', 5), cloudinaryMultiUpload, updateTicket);

// Update ticket status
ticketRouter.patch('/tickets/:id/status', verifyToken, updateTicketStatus);

// Delete ticket
ticketRouter.delete('/tickets/:id', deleteTicket);

export default ticketRouter;
