const ticketService = require('../services/ticket.service');

async function createTicket(req, res, next) {
    try {
        const newTicket = await ticketService.createTicket(req.auth.userId, req.body);
        res.json(newTicket);
    } catch (err) {
        next(err);
    }
}

async function getMyTickets(req, res, next) {
    try {
        const tickets = await ticketService.getUserTickets(req.auth.userId, req.auth.role);
        res.json(tickets);
    } catch (err) {
        next(err);
    }
}

async function getTicketInfos(req, res, next) {
    try {
        const ticket = await ticketService.getTicket(req.params.ticketId, req.auth.userId, req.auth.role);
        res.json(ticket);
    } catch (err) {
        next(err);
    }
}

async function updateTicketStatus(req, res, next) {
    try {
        const updatedTicket = await ticketService.updateTicketStatus(
            req.params.ticketId,
            req.auth.userId,
            req.auth.role,
            req.body.status
        );
        res.json(updatedTicket);
    } catch (err) {
        next(err);
    }
}

async function getTicketMessages(req, res, next) {
    try {
        const messages = await ticketService.getTicketMessages(
            req.params.ticketId,
            req.auth.userId,
            req.auth.role
        );
        res.json(messages);
    } catch (err) {
        next(err);
    }
}

async function addMessage(req, res, next) {
    try {
        const newMessage = await ticketService.addMessage(
            req.params.ticketId,
            req.auth.userId,
            req.body.content
        );
        res.json(newMessage);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createTicket,
    getMyTickets,
    getTicketInfos,
    updateTicketStatus,
    getTicketMessages,
    addMessage
}; 