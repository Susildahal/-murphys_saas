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

const ticketRouter = express.Router();

// Create ticket with optional image uploads
ticketRouter.post('/tickets', upload.array('images', 5), cloudinaryMultiUpload, createTicket);

// Get all tickets with filters
ticketRouter.get('/tickets', getTickets);

// Get single ticket
ticketRouter.get('/tickets/:id', getTicketById);

// Update ticket
ticketRouter.put('/tickets/:id', upload.array('images', 5), cloudinaryMultiUpload, updateTicket);

// Update ticket status
ticketRouter.patch('/tickets/:id/status', updateTicketStatus);

// Delete ticket
ticketRouter.delete('/tickets/:id', deleteTicket);

export default ticketRouter;
