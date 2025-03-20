// Variables globales
let currentTicketId = null;
let userRole = null;

// Fonction pour charger les tickets
async function loadTickets() {
    try {
        document.getElementById('loading-spinner').classList.remove('d-none');
        document.getElementById('error-message').classList.add('d-none');
        document.getElementById('no-tickets-message').classList.add('d-none');
        document.getElementById('tickets-table-container').classList.add('d-none');

        const response = await fetch('/api/ticket/myTickets', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des tickets');
        }

        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('error-text').textContent = error.message || 'Impossible de charger vos tickets.';
        document.getElementById('error-message').classList.remove('d-none');
    } finally {
        document.getElementById('loading-spinner').classList.add('d-none');
    }
}

// Fonction pour afficher les tickets dans le tableau
function displayTickets(tickets) {
    const tbody = document.getElementById('ticketsList');
    const ticketsCount = document.getElementById('tickets-count');
    tbody.innerHTML = '';

    ticketsCount.textContent = tickets.length;

    if (tickets.length === 0) {
        document.getElementById('no-tickets-message').classList.remove('d-none');
        document.getElementById('tickets-table-container').classList.add('d-none');
        return;
    }

    document.getElementById('no-tickets-message').classList.add('d-none');
    document.getElementById('tickets-table-container').classList.remove('d-none');

    tickets.forEach(ticket => {
        const tr = document.createElement('tr');
        tr.className = 'feature-row';

        // Determine status badge
        let statusBadge;
        if (ticket.status === 'opened') {
            statusBadge = '<span class="badge bg-success py-2 px-3">Ouvert</span>';
        } else {
            statusBadge = '<span class="badge bg-secondary py-2 px-3">Clôturé</span>';
        }

        tr.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.Property?.address || 'N/A'}</td>
            <td>${getCategoryLabel(ticket.category)}</td>
            <td>${statusBadge}</td>
            <td>${new Date(ticket.updatedAt).toLocaleString()}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary action-btn btn-view-ticket" data-ticket-id="${ticket.id}" title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${ticket.status === 'opened' ?
                `<button class="btn btn-sm btn-outline-success action-btn btn-close-ticket" data-ticket-id="${ticket.id}" title="Clôturer ticket">
                        <i class="bi bi-check-circle"></i>
                    </button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    attachEventListeners();
}

// Fonction pour charger les propriétés dans le select
async function loadProperties() {
    try {
        let response;
        console.log(userRole);
        if (userRole == 'owner') {
            response = await fetch('/api/property/getMyProperties', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } else if (userRole == 'tenant') {
            response = await fetch('/api/user/myProperty', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } else {
            throw new Error('Chelou hein');
        }

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des propriétés');
        }

        let properties = await response.json();
        console.log(properties);
        
        // Si c'est un locataire, on met la property dans un tableau
        if (userRole === 'tenant') {
            properties = [properties];
        }

        const select = document.getElementById('propertySelect');
        select.innerHTML = '';

        properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property.id;
            option.textContent = `${property.address}, ${property.city}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des propriétés');
    }
}

// Fonction pour créer un nouveau ticket
async function createTicket() {
    const propertyId = document.getElementById('propertySelect').value;
    const category = document.getElementById('categorySelect').value;
    const description = document.getElementById('description').value;

    if (!propertyId || !category || !description.trim()) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        const response = await fetch('/api/ticket/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                propertyId: parseInt(propertyId),
                category,
                description
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création du ticket');
        }

        bootstrap.Modal.getInstance(document.getElementById('newTicketModal')).hide();
        document.getElementById('newTicketForm').reset();
        loadTickets();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du ticket: ' + (error.message || 'Erreur inconnue'));
    }
}

// Fonction pour afficher les détails d'un ticket
async function showTicketDetails(ticketId) {
    currentTicketId = ticketId;

    try {
        const ticketResponse = await fetch(`/api/ticket/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const messagesResponse = await fetch(`/api/ticket/${ticketId}/messages`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log(ticketResponse);
        console.log(messagesResponse);

        if (!ticketResponse.ok || !messagesResponse.ok) {
            throw new Error('Erreur lors du chargement des données du ticket');
        }

        const ticket = await ticketResponse.json();
        const messages = await messagesResponse.json();

        // Remplir les détails du ticket
        document.getElementById('ticketId').textContent = ticket.id;
        document.getElementById('ticketProperty').textContent = `${ticket.Property.address}, ${ticket.Property.city}`;
        document.getElementById('ticketCategory').textContent = getCategoryLabel(ticket.category);
        document.getElementById('ticketStatus').textContent = getStatusLabel(ticket.status);
        document.getElementById('ticketCreatedAt').textContent = new Date(ticket.createdAt).toLocaleString();
        document.getElementById('ticketUpdatedAt').textContent = new Date(ticket.updatedAt).toLocaleString();
        document.getElementById('ticketDescription').textContent = ticket.description;

        // Afficher ou masquer le bouton de clôture selon le statut
        const closeButton = document.getElementById('closeTicketBtn');
        if (ticket.status === 'opened') {
            closeButton.style.display = 'inline-block';
        } else {
            closeButton.style.display = 'none';
        }

        displayMessages(messages);

        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById('ticketDetailsModal'));
        modal.show();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des détails du ticket: ' + (error.message || 'Erreur inconnue'));
    }
}

// Fonction pour afficher les messages
function displayMessages(messages) {
    const container = document.getElementById('messagesList');
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-3">Aucun message pour le moment</div>';
        return;
    }

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isSystem ? 'system-message' : ''} mb-3`;

        const content = message.isSystem
            ? `<div class="alert alert-info">${message.content}</div>`
            : `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="card-subtitle mb-0 fw-bold">${message.User.username}</h6>
                            <span class="text-muted small">${new Date(message.createdAt).toLocaleString()}</span>
                        </div>
                        <p class="card-text mb-0">${message.content}</p>
                    </div>
                </div>
            `;

        messageDiv.innerHTML = content;
        container.appendChild(messageDiv);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Fonction pour envoyer un nouveau message
async function sendMessage(event) {
    event.preventDefault();

    const content = document.getElementById('messageContent').value;
    if (!content.trim()) return;

    try {
        const response = await fetch(`/api/ticket/${currentTicketId}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi du message');
        }

        document.getElementById('messageContent').value = '';

        // Recharger les messages
        const messagesResponse = await fetch(`/api/ticket/${currentTicketId}/messages`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!messagesResponse.ok) {
            throw new Error('Erreur lors du chargement des messages');
        }

        const messages = await messagesResponse.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'envoi du message: ' + (error.message || 'Erreur inconnue'));
    }
}

// Fonction pour mettre à jour le statut d'un ticket
async function updateTicketStatus(status) {
    try {
        const response = await fetch(`/api/ticket/${currentTicketId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du statut');
        }

        // Vérifier si le modal est ouvert avant d'essayer de le fermer
        const modal = document.getElementById('ticketDetailsModal');
        if (modal.classList.contains('show')) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        
        loadTickets();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour du statut: ' + (error.message || 'Erreur inconnue'));
    }
}

// Fonction pour attacher les gestionnaires d'événements
function attachEventListeners() {
    // Boutons d'affichage des détails
    document.querySelectorAll('.btn-view-ticket').forEach(button => {
        button.addEventListener('click', () => {
            const ticketId = button.getAttribute('data-ticket-id');
            showTicketDetails(ticketId);
        });
    });

    // Boutons de clôture des tickets
    document.querySelectorAll('.btn-close-ticket').forEach(button => {
        button.addEventListener('click', () => {
            const ticketId = button.getAttribute('data-ticket-id');
            if (confirm('Êtes-vous sûr de vouloir clôturer ce ticket ?')) {
                currentTicketId = ticketId;
                updateTicketStatus('closed');
            }
        });
    });

    // Animation de survol pour les lignes
    const rows = document.querySelectorAll('.feature-row');
    rows.forEach(row => {
        row.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.1)';
        });
        row.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Fonctions utilitaires
function getCategoryLabel(category) {
    const labels = {
        repair: 'Réparation',
        payment: 'Paiement',
        other: 'Autre'
    };
    return labels[category] || category;
}

function getStatusLabel(status) {
    const labels = {
        opened: 'Ouvert',
        closed: 'Clôturé'
    };
    return labels[status] || status;
}

function getStatusBadgeClass(status) {
    const classes = {
        opened: 'bg-success',
        closed: 'bg-secondary'
    };
    return classes[status] || 'bg-primary';
}

// Déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Vérification de l'authentification et du rôle
function checkAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return false;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('user-email').textContent = user.email || '';

    if (user.role === 'owner') {
        userRole = 'owner';
        document.getElementById('user-role').textContent = 'Propriétaire';
    } else if (user.role === 'tenant') {
        userRole = 'tenant';
        document.getElementById('user-role').textContent = 'Locataire';
    } else {
        logout();
        return false;
    }

    return true;
}

// Initialisation de la page
function initTicketsPage() {
    if (!checkAuth()) return;

    loadTickets();
    loadProperties();

    // Event listeners
    document.getElementById('createTicketBtn').addEventListener('click', createTicket);
    document.getElementById('newMessageForm').addEventListener('submit', sendMessage);
    document.getElementById('closeTicketBtn').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir clôturer ce ticket ?')) {
            updateTicketStatus('closed');
        }
    });
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initTicketsPage);