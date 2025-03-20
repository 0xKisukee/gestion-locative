const { Ticket, Message, User, Property } = require('../models');
const { Op } = require('sequelize');

async function createTicket(userId, ticketData) {
    // Get user and their role
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Get property and verify ownership/tenancy
    const property = await Property.findByPk(ticketData.propertyId);
    if (!property) {
        throw new Error('Property not found');
    }

    // Verify user has access to this property
    if (user.role === 'owner' && property.ownerId !== userId) {
        throw new Error('You do not own this property');
    }
    if (user.role === 'tenant' && property.tenantId !== userId) {
        throw new Error('You are not the tenant of this property');
    }

    // Create ticket
    const ticket = await Ticket.create({
        ...ticketData,
        tenantId: property.tenantId,
        ownerId: property.ownerId
    });

    // Create system message
    await Message.create({
        ticketId: ticket.id,
        userId: userId,
        content: `Ticket created by ${user.username} (${user.role}) on ${new Date().toLocaleString()}`,
        isSystem: true
    });

    return ticket;
}

async function getUserTickets(userId, userRole) {
    const whereClause = userRole === 'owner'
        ? { ownerId: userId }
        : { tenantId: userId };

    const allTickets = await Ticket.findAll({
        where: whereClause,
        include: [
            { model: User, as: 'tenant', attributes: ['id', 'username'] },
            { model: User, as: 'owner', attributes: ['id', 'username'] },
            { model: Property, attributes: ['id', 'address'] }
        ],
        order: [['updatedAt', 'DESC']]
    });

    return allTickets;
}

async function getTicket(ticketId, userId, userRole) {
    const ticket = await Ticket.findByPk(ticketId, {
        include: [
            { model: User, as: 'tenant', attributes: ['id', 'username'] },
            { model: User, as: 'owner', attributes: ['id', 'username'] },
            { model: Property, attributes: ['id', 'address', 'city'] }
        ]
    });

    if (!ticket) {
        throw new Error('Ticket not found');
    }

    // Verify user has access to this ticket
    if (userRole === 'owner' && ticket.ownerId !== userId) {
        throw new Error('You do not own this ticket');
    }
    if (userRole === 'tenant' && ticket.tenantId !== userId) {
        throw new Error('You are not the tenant of this ticket');
    }

    return ticket;
}

async function updateTicketStatus(ticketId, userId, userRole, newStatus) {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }

    // Verify user is owner and has access to this ticket
    if (userRole === 'owner' && ticket.ownerId !== userId) {
        throw new Error('You do not own this ticket');
    }
    if (userRole === 'tenant') {
        throw new Error('Only owners can change the status of a ticket');
    }

    // Update status
    ticket.status = newStatus;
    await ticket.save();

    // Create system message
    const user = await User.findByPk(userId);
    await Message.create({
        ticketId: ticket.id,
        userId: userId,
        content: `Ticket status updated to ${newStatus} by ${user.username} (${user.role}) on ${new Date().toLocaleString()}`,
        isSystem: true
    });

    return ticket;
}

async function getTicketMessages(ticketId, userId, userRole) {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }

    // Verify user has access to this ticket
    if (userRole === 'owner' && ticket.ownerId !== userId) {
        throw new Error('You do not own this ticket');
    }
    if (userRole === 'tenant' && ticket.tenantId !== userId) {
        throw new Error('You are not the tenant of this ticket');
    }

    const allMsgs = await Message.findAll({
        where: { ticketId },
        include: [
            { model: User, attributes: ['id', 'username', 'role'] }
        ],
        order: [['createdAt', 'ASC']]
    });

    return allMsgs;
}

async function addMessage(ticketId, userId, content) {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }

    // Verify user has access to this ticket
    if (ticket.ownerId !== userId && ticket.tenantId !== userId) {
        throw new Error('You do not have access to this ticket');
    }

    if (ticket.status === 'closed') {
        throw new Error('Ticket is closed');
    }

    // Create message
    const message = await Message.create({
        ticketId,
        userId,
        content,
        isSystem: false
    });

    return message;
}

module.exports = {
    createTicket,
    getUserTickets,
    getTicket,
    updateTicketStatus,
    getTicketMessages,
    addMessage
}; 