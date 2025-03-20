const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const auth = require("../middlewares/authentication");

// All routes require authentication
router.use(auth.authenticateJwt);

// Create a new ticket
router.post('/create', ticketController.createTicket);

// Get user's tickets (either as owner or tenant)
router.get('/myTickets', ticketController.getMyTickets);

// Get a ticket (either as owner or tenant)
router.get('/:ticketId', ticketController.getTicketInfos);

// Update ticket status
router.patch('/:ticketId/status', ticketController.updateTicketStatus);

// Get messages for a ticket
router.get('/:ticketId/messages', ticketController.getTicketMessages);

// Add a message to a ticket
router.post('/:ticketId/sendMessage', ticketController.addMessage);

module.exports = router; 