// Fonction pour obtenir le token d'authentification 
function getToken() {
    return localStorage.getItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

// Fonction pour charger le dashboard d'un propriétaire
async function loadOwnerDashboard() {
    try {
        // Afficher les indicateurs de chargement
        document.getElementById('owner-tickets').innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="text-muted mt-3">Chargement des données...</p>
            </div>
        `;

        const propertiesResponse = await fetch('/api/property/getMyProperties', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!propertiesResponse.ok) {
            const errorText = await propertiesResponse.text();
            console.error('Erreur de l\'API:', errorText);
            throw new Error(`Erreur lors du chargement des propriétés: ${propertiesResponse.status} ${propertiesResponse.statusText}`);
        }

        const paymentsResponse = await fetch('/api/user/myPayments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentsResponse.ok) {
            const errorText = await paymentsResponse.text();
            console.error('Erreur de l\'API:', errorText);
            throw new Error(`Erreur lors du chargement des paiements: ${paymentsResponse.status} ${paymentsResponse.statusText}`);
        }

        const properties = await propertiesResponse.json();
        const payments = await paymentsResponse.json();

        // Filtrer les propriétés avec locataires (status rented)
        const propertiesWithTenants = properties.filter(prop => prop.status === 'rented');

        // Mettre à jour les statistiques dans les cartes
        const propertiesCount = document.getElementById('properties-count');
        const tenantsCount = document.getElementById('tenants-count');
        const duePaymentsCount = document.getElementById('due-payments');

        // Ajouter une animation simple pour le compteur
        function animateCounter(element, value, duration = 1000) {
            if (!element) return;
            const startValue = 0;
            const increment = (value / duration) * 10;
            let currentValue = startValue;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= value) {
                    clearInterval(timer);
                    currentValue = value;
                }
                if (typeof value === 'number' && !isNaN(value)) {
                    if (element.id.includes('amount') || element.id.includes('revenue')) {
                        element.textContent = `${Math.floor(currentValue)} €`;
                    } else {
                        element.textContent = Math.floor(currentValue);
                    }
                }
            }, 10);
        }

        // Nombre total de propriétés
        if (propertiesCount) animateCounter(propertiesCount, properties.length);

        // Nombre de propriétés avec locataires
        if (tenantsCount) {
            animateCounter(tenantsCount, propertiesWithTenants.length);
        }

        // Données réelles des paiements en retard
        const duePayments = payments.filter(pay => pay.status === 'due');
        if (duePaymentsCount) animateCounter(duePaymentsCount, duePayments.length);

        // Calcul des statistiques
        // 1. Revenu mensuel (somme des loyers des biens occupés)
        const monthlyRevenue = propertiesWithTenants.reduce((sum, prop) => (sum + prop.rent), 0);

        // 2. Revenu potentiel (somme de tous les loyers)
        const potentialRevenue = properties.reduce((sum, prop) => (sum + prop.rent), 0);

        // 3. Nombre de biens inoccupés
        const freeProperties = properties.filter(prop => prop.status === 'free').length;

        // 4. Total des impayés dûs
        const unpaidAmount = duePayments.reduce((sum, pay) => (sum + pay.amount), 0);

        // Mettre à jour les statistiques dans la section "Statistiques clés"
        const monthlyRevenueStat = document.getElementById('monthly-revenue-stat');
        const potentialRevenueStat = document.getElementById('potential-revenue-stat');
        const freePropertiesStat = document.getElementById('free-properties-stat');
        const unpaidAmountStat = document.getElementById('unpaid-amount-stat');

        if (monthlyRevenueStat) animateCounter(monthlyRevenueStat, monthlyRevenue);
        if (potentialRevenueStat) animateCounter(potentialRevenueStat, potentialRevenue);
        if (freePropertiesStat) animateCounter(freePropertiesStat, freeProperties);
        if (unpaidAmountStat) animateCounter(unpaidAmountStat, unpaidAmount);

        return properties;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        const ownerSection = document.getElementById('owner-section');
        if (ownerSection) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i> Impossible de charger vos propriétés: ${error.message}`;
            ownerSection.prepend(errorMessage);
        }
        return [];
    }
}

// Fonction pour charger le dashboard d'un locataire
async function loadTenantDashboard() {
    try {
        const propertyInfoElement = document.getElementById('tenant-property-info');
        const user = getCurrentUser();

        // Display tenant ID
        const tenantIdElement = document.getElementById('tenant-id');
        if (tenantIdElement) {
            if (user && user.userId) {
                tenantIdElement.textContent = user.userId;
                tenantIdElement.classList.remove('text-muted');
                tenantIdElement.classList.add('text-primary');
            } else {
                tenantIdElement.textContent = 'Non disponible';
                tenantIdElement.classList.add('text-muted');
                tenantIdElement.classList.remove('text-primary');
            }
        }

        const propertyResponse = await fetch('/api/user/myProperty', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (propertyResponse.status === 404) {
            propertyInfoElement.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> Vous n'avez actuellement aucune location active.
                </div>
            `;
            // Mettre à jour les informations de paiement
            document.getElementById('next-payment-date').textContent = '--';
            document.getElementById('next-payment-amount').textContent = '-- €';
            document.getElementById('payment-status').textContent = 'À jour';
            return;
        }

        if (!propertyResponse.ok) {
            const errorText = await propertyResponse.text();
            throw new Error(`Erreur lors du chargement des informations de location: ${propertyResponse.status} - ${errorText}`);
        }

        const property = await propertyResponse.json();
        const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';

        propertyInfoElement.innerHTML = `
            <div class="d-flex align-items-start mb-4">
                <div class="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                    <i class="bi bi-house-door fs-2 text-primary"></i>
                </div>
                <div>
                    <h5 class="mb-1 fw-bold">${propertyType}</h5>
                    <p class="text-muted mb-0">${property.address}, ${property.city}</p>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-rulers text-primary"></i>
                        </div>
                        <div>
                            <div class="text-muted small">Surface</div>
                            <strong>${property.surface} m²</strong>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-cash text-primary"></i>
                        </div>
                        <div>
                            <div class="text-muted small">Loyer mensuel</div>
                            <strong>${property.rent} €</strong>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-person text-primary"></i>
                        </div>
                        <div>
                            <div class="text-muted small">Propriétaire</div>
                            <strong>${property.owner?.username || 'Non spécifié'}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="bi bi-calendar-check text-primary"></i>
                        </div>
                        <div>
                            <div class="text-muted small">Date d'entrée</div>
                            <strong>${new Date(property.moveInDate || Date.now()).toLocaleDateString('fr-FR')}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const paymentsResponse = await fetch('/api/user/myPayments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentsResponse.ok) {
            const errorText = await paymentsResponse.text();
            console.error('Erreur de l\'API:', errorText);
            throw new Error(`Erreur lors du chargement des paiements: ${paymentsResponse.status} ${paymentsResponse.statusText}`);
        }

        const payments = await paymentsResponse.json();
        const duePaymentsCounter = payments.filter(pay => pay.status === 'due').length;

        // Infos du prochain loyer
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        document.getElementById('next-payment-date').textContent = lastDayOfMonth.toLocaleDateString('fr-FR'); // À adapter
        document.getElementById('next-payment-amount').textContent = `${property.rent} €`; // OK

        // Mettre à jour le statut de paiement avec une couleur appropriée
        const paymentStatus = document.getElementById('payment-status');

        if (duePaymentsCounter == 0) {
            paymentStatus.textContent = 'À jour';
            paymentStatus.className = 'badge bg-success rounded-pill px-3 py-2';
        } else if (duePaymentsCounter == 1) {
            paymentStatus.textContent = 'Paiement en attente';
            paymentStatus.className = 'badge bg-danger rounded-pill px-3 py-2';
        } else if (duePaymentsCounter > 1) {
            paymentStatus.textContent = 'Situation à régulariser';
            paymentStatus.className = 'badge bg-danger rounded-pill px-3 py-2';
        }

    } catch (error) {
        console.error('Erreur lors du chargement de la location:', error);
        const propertyInfoElement = document.getElementById('tenant-property-info');
        if (propertyInfoElement) {
            propertyInfoElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i> Impossible de charger les informations: ${error.message}
                </div>
            `;
        }
        // Réinitialiser les champs de paiement en cas d'erreur
        document.getElementById('next-payment-date').textContent = '--';
        document.getElementById('next-payment-amount').textContent = '-- €';
        const paymentStatus = document.getElementById('payment-status');
        paymentStatus.textContent = 'Erreur';
        paymentStatus.className = 'badge bg-danger rounded-pill px-3 py-2';
    }
}

// Fonction pour générer les tickets
async function generateOwnerTickets() {
    try {
        const response = await fetch('/api/ticket/myTickets', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des tickets');
        }

        const tickets = await response.json();
        const ticketsContainer = document.getElementById('owner-tickets');
        const ticketCountElement = document.getElementById('ticket-count');

        if (ticketsContainer) {
            // Update ticket count with number of opened tickets
            const openedTicketsCount = tickets.filter(ticket => ticket.status === 'opened').length;
            if (ticketCountElement) {
                ticketCountElement.textContent = openedTicketsCount;
            }

            if (tickets.length === 0) {
                ticketsContainer.innerHTML = '<p class="text-muted p-4 text-center">Aucun ticket</p>';
                return;
            }

            ticketsContainer.innerHTML = '';
            tickets.forEach(ticket => {
                const statusClass = ticket.status === 'opened' ? 'success' : 'secondary';
                const statusIcon = ticket.status === 'opened' ? 'check-circle' : 'x-circle';

                const ticketElement = document.createElement('div');
                ticketElement.className = 'list-group-item list-group-item-action border-0 border-bottom';
                ticketElement.innerHTML = `
                    <div class="d-flex align-items-start">
                        <div class="me-3">
                            <span class="badge bg-${statusClass}-subtle text-${statusClass} p-2 rounded-circle">
                                <i class="bi bi-${statusIcon}"></i>
                            </span>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1 fw-semibold">${ticket.category}</h6>
                                <small class="text-muted">${new Date(ticket.updatedAt).toLocaleDateString('fr-FR')}</small>
                            </div>
                            <p class="mb-1 text-muted small">${ticket.description}</p>
                        </div>
                    </div>
                `;
                ticketsContainer.appendChild(ticketElement);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
        const ticketsContainer = document.getElementById('owner-tickets');
        if (ticketsContainer) {
            ticketsContainer.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="bi bi-exclamation-triangle me-2"></i> Impossible de charger les tickets: ${error.message}
                </div>
            `;
        }
    }
}

// Fonction pour générer des tickets pour les locataires
async function generateTenantTickets() {
    try {
        const response = await fetch('/api/ticket/myTickets', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des tickets');
        }

        const tickets = await response.json();
        const ticketsContainer = document.getElementById('tenant-tickets');

        if (ticketsContainer) {
            if (tickets.length === 0) {
                ticketsContainer.innerHTML = '<p class="text-muted p-4 text-center">Aucun ticket</p>';
                return;
            }

            ticketsContainer.innerHTML = '';
            tickets.forEach(ticket => {
                const statusClass = ticket.status === 'opened' ? 'success' : 'secondary';
                const statusIcon = ticket.status === 'opened' ? 'check-circle' : 'x-circle';

                const ticketElement = document.createElement('div');
                ticketElement.className = 'list-group-item list-group-item-action border-0 border-bottom';
                ticketElement.innerHTML = `
                    <div class="d-flex align-items-start">
                        <div class="me-3">
                            <span class="badge bg-${statusClass}-subtle text-${statusClass} p-2 rounded-circle">
                                <i class="bi bi-${statusIcon}"></i>
                            </span>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1 fw-semibold">${ticket.category}</h6>
                                <small class="text-muted">${new Date(ticket.updatedAt).toLocaleDateString('fr-FR')}</small>
                            </div>
                            <p class="mb-1 text-muted small">${ticket.description}</p>
                        </div>
                    </div>
                `;
                ticketsContainer.appendChild(ticketElement);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
        const ticketsContainer = document.getElementById('tenant-tickets');
        if (ticketsContainer) {
            ticketsContainer.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="bi bi-exclamation-triangle me-2"></i> Impossible de charger les tickets: ${error.message}
                </div>
            `;
        }
    }
}

// Fonction d'initialisation du tableau de bord
async function initDashboard() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    console.log("User info:", user);

    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-username').textContent = user.username || 'Utilisateur';
        const roleDisplay = user.role === 'owner' ? 'Propriétaire' : 'Locataire';

        document.getElementById('user-role').textContent = roleDisplay;
        document.getElementById('user-role-text').textContent = roleDisplay.toLowerCase();

        if (user.role === 'owner') {
            console.log("Affichage de la section propriétaire");
            document.getElementById('owner-section').classList.remove('d-none');
            document.getElementById('tenant-section').classList.add('d-none');
            await loadOwnerDashboard();
            await generateOwnerTickets();
        } else {
            console.log("Affichage de la section locataire");
            document.getElementById('tenant-section').classList.remove('d-none');
            document.getElementById('owner-section').classList.add('d-none');
            await loadTenantDashboard();
            await generateTenantTickets();
        }
    }

    // Ajouter une animation au survol des cartes
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.08)';
        });
    });
}

// Gestion des événements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé');
    initDashboard();
});