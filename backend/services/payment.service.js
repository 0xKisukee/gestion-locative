require('dotenv').config();
const { User, Property, Payment } = require("../models");
const { Op } = require('sequelize');
const { AppError } = require('../middlewares/errorHandler');
const userService = require('./user.service.js');

function getEndOfMonth(date) {
    const inputDate = new Date(date);

    if (isNaN(inputDate.getTime())) throw new Error("Date invalide 1");

    return new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
}

function calculateFirstRent(monthlyRent, entryDate) {
    const startDate = new Date(entryDate);
    if (isNaN(startDate.getTime())) throw new Error("Date invalide 2");

    const entryDay = startDate.getDate();

    // Nombre total de jours dans le mois
    const lastDayOfMonth = getEndOfMonth(startDate);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Calculer le nombre de jours restants dans le mois
    const remainingDays = totalDaysInMonth - entryDay + 1; // +1 car le jour d'entrée est inclus

    // Calculer le loyer au prorata pour les jours restants
    const proratedRent = monthlyRent * remainingDays / totalDaysInMonth;

    // Retourner le montant arrondi à 2 décimales
    return Number(proratedRent.toFixed(2));
}

// Create first rent when a tenant is added to property (prorata)
async function initRent(propertyId, entryDate) {
    // Get property by id
    const property = await Property.findByPk(propertyId);

    // Verify if property exists
    if (!property) throw new AppError('Propriété non trouvée', 404);

    // Verify if property has tenant
    if (!property.tenantId) throw new AppError('No tenant', 404);

    // Date conversion
    const startDate = new Date(entryDate);
    if (isNaN(startDate.getTime())) throw new Error("Date invalide 3");

    // Create payment
    const payment = await Payment.create({
        amount: calculateFirstRent(property.rent, entryDate),
        dueDate: getEndOfMonth(entryDate),
        tenantId: property.tenantId,
        ownerId: property.ownerId,
        propertyId: property.id,
    });

    return payment;
}

// Call this function at the end of every month (with a crontab) to create a payment for each property
async function createRentsLoop() {
    // Récupérer toutes les propriétés louées
    const properties = await Property.findAll({
        where: {
            tenantId: { [Op.ne]: null }
        }
    });

    if (!properties || properties.length === 0) {
        console.log("Aucune propriété louée trouvée.");
        return [];
    }

    const transaction = await Property.sequelize.transaction(); // Créer une transaction

    const actualDate = new Date();
    const payments = await Promise.all(
        properties.map(async (property) => {
            return await Payment.create({
                amount: property.rent,
                dueDate: getEndOfMonth(actualDate),
                tenantId: property.tenantId,
                ownerId: property.ownerId,
                propertyId: property.id,
            }, { transaction });
        })
    );

    // Si tout s'est bien passé, on commit la transaction
    await transaction.commit();

    console.log(`${payments.length} paiements créés avec succès.`);
    return payments;
}

async function getOwnerPayments(userId) {
    const owner = await User.findByPk(userId);

    // Verify owner role
    if (!owner || owner.role !== 'owner') {
        throw new AppError('User must have the "owner" role', 400);
    }

    // Get all payments of owner
    const payments = await Payment.findAll({
        where: { ownerId: userId },
        include: [
            {
                model: User,
                as: 'paymentTenant',
                attributes: { exclude: ['password'] }
            },
            {
                model: Property,
                as: 'paymentProperty',
                attributes: ['address', 'city']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return payments;
}

async function getTenantPayments(userId) {
    const owner = await User.findByPk(userId);

    // Verify owner role
    if (!owner || owner.role !== 'tenant') {
        throw new AppError('User must have the "owner" tenant', 400);
    }

    // Get all payments of owner
    const payments = await Payment.findAll({
        where: { tenantId: userId },
        include: [
            {
                model: User,
                as: 'paymentOwner',
                attributes: { exclude: ['password'] }
            },
            {
                model: User,
                as: 'paymentTenant',
                attributes: { exclude: ['password'] }
            },
            {
                model: Property,
                as: 'paymentProperty',
                attributes: ['address', 'city']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return payments;
}

// Create first rent when a tenant is added to property (prorata)
async function recordPayment(userId, paymentId) {
    // Get payment by id
    const payment = await Payment.findByPk(paymentId);

    // Verify if payment exists
    if (!payment) throw new AppError('Payment not found', 404);

    // Verify user ownership
    if (userId !== payment.ownerId) {
        throw new AppError('You are not the owner of this payment', 403);
    }

    // Update payment
    await payment.update({
        isPaid: true
    });

    return payment;
}

module.exports = {
    initRent,
    createRentsLoop,
    getOwnerPayments,
    getTenantPayments,
    recordPayment,
};