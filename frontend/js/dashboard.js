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
        console.log('Tentative de chargement des propriétés...');
        console.log('Token utilisé:', getToken());
        
        const response = await fetch('/api/property/getMyProperties', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Statut de la réponse:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur de l\'API:', errorText);
            throw new Error(`Erreur lors du chargement des propriétés: ${response.status} ${response.statusText}`);
        }
        
        const properties = await response.json();
        console.log('Propriétés chargées:', properties);
        
        // Mettre à jour les statistiques dans les cartes
        const propertiesCount = document.getElementById('properties-count');
        const tenantsCount = document.getElementById('tenants-count');
        const duePayments = document.getElementById('due-payments');
        
        if (propertiesCount) propertiesCount.textContent = properties.length;
        if (tenantsCount) {
            const propertiesWithTenants = properties.filter(prop => prop.status == 'rented');
            tenantsCount.textContent = propertiesWithTenants.length;
        }
        if (duePayments) duePayments.textContent = '0'; // À adapter avec données réelles
        
        // Mettre à jour les statistiques dans la section "Statistiques clés"
        const monthlyRevenueStat = document.getElementById('monthly-revenue-stat');
        const potentialRevenueStat = document.getElementById('potential-revenue-stat');
        const freePropertiesStat = document.getElementById('free-properties-stat');
        const openTicketsStat = document.getElementById('open-tickets-stat');
        
        if (monthlyRevenueStat) monthlyRevenueStat.textContent = '0'; // À adapter
        if (potentialRevenueStat) potentialRevenueStat.textContent = '0'; // À adapter
        if (freePropertiesStat) freePropertiesStat.textContent = '0'; // À adapter
        if (openTicketsStat) openTicketsStat.textContent = '0'; // À adapter
        
        return properties;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        const ownerSection = document.getElementById('owner-section');
        if (ownerSection) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Impossible de charger vos propriétés: ${error.message}`;
            ownerSection.prepend(errorMessage);
        }
        return [];
    }
}

// Fonction pour charger le dashboard d'un locataire
async function loadTenantDashboard() {
    try {
        const propertyInfoElement = document.getElementById('tenant-property-info');
        
        const response = await fetch('/api/user/myProperty', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 404) {
            propertyInfoElement.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Vous n'avez actuellement aucune location active.
                </div>
            `;
            // Mettre à jour les informations de paiement
            document.getElementById('next-payment-date').textContent = '--';
            document.getElementById('next-payment-amount').textContent = '-- €';
            document.getElementById('payment-status').textContent = 'À jour';
            return;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur lors du chargement des informations de location: ${response.status} - ${errorText}`);
        }
        
        const property = await response.json();
        const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
        
        propertyInfoElement.innerHTML = `
            <h5 class="mb-3">${propertyType}</h5>
            <p><i class="bi bi-geo-alt"></i> ${property.address}, ${property.city}</p>
            <p><i class="bi bi-rulers"></i> Surface: ${property.surface} m²</p>
            <p><i class="bi bi-cash"></i> Loyer: ${property.rent} €</p>
            <p><i class="bi bi-person"></i> Propriétaire: ${property.owner?.username || 'Non spécifié'}</p>
        `;
        
        // Exemple fictif pour les paiements (à remplacer par une API réelle)
        document.getElementById('next-payment-date').textContent = '20 mars 2025'; // À adapter
        document.getElementById('next-payment-amount').textContent = `${property.rent} €`; // OK
        document.getElementById('payment-status').textContent = 'À jour'; // À adapter
    } catch (error) {
        console.error('Erreur lors du chargement de la location:', error);
        const propertyInfoElement = document.getElementById('tenant-property-info');
        if (propertyInfoElement) {
            propertyInfoElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Impossible de charger les informations: ${error.message}
                </div>
            `;
        }
        // Réinitialiser les champs de paiement en cas d'erreur
        document.getElementById('next-payment-date').textContent = '--';
        document.getElementById('next-payment-amount').textContent = '-- €';
        document.getElementById('payment-status').textContent = 'Erreur';
    }
}

// Fonction pour générer les tickets
function generateOwnerTickets() {
    // fake tickets for tests
    const tickets = [
        { title: 'Paiement reçu', date: 'il y a 3 jours', message: 'Le loyer pour l\'appartement rue de Paris a été reçu.' },
        { title: 'Contrat à renouveler', date: 'il y a 1 semaine', message: 'Le contrat de location pour l\'appartement rue du Commerce arrive à échéance.' },
        { title: 'Demande de réparation', date: 'il y a 2 semaines', message: 'Un locataire a signalé un problème de plomberie.' }
    ];
    
    const ticketsContainer = document.getElementById('owner-tickets');
    if (ticketsContainer) {
        ticketsContainer.innerHTML = tickets.length === 0 ? '<p class="text-muted">Aucun ticket</p>' : '';
        tickets.forEach(tickt => {
            const ticktElement = document.createElement('a');
            ticktElement.href = '#';
            ticktElement.className = 'list-group-item list-group-item-action';
            ticktElement.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${tickt.title}</h6>
                    <small>${tickt.date}</small>
                </div>
                <p class="mb-1">${tickt.message}</p>
            `;
            ticketsContainer.appendChild(ticktElement);
        });
        document.getElementById('ticket-count').textContent = tickets.length;
    }
}

// Fonction pour générer des tickets factices pour les locataires
function generateTenantTickets() {
    const tickets = [
        { title: 'Paiement dû', date: 'dans 5 jours', message: 'Votre loyer est dû le 20 mars.' },
        { title: 'Entretien prévu', date: 'il y a 2 jours', message: 'Un technicien passera le 18 mars pour une vérification.' }
    ];
    
    const ticketsContainer = document.getElementById('tenant-tickets');
    if (ticketsContainer) {
        ticketsContainer.innerHTML = tickets.length === 0 ? '<p class="text-muted">Aucun ticket</p>' : '';
        tickets.forEach(tickt => {
            const ticktElement = document.createElement('a');
            ticktElement.href = '#';
            ticktElement.className = 'list-group-item list-group-item-action';
            ticktElement.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${tickt.title}</h6>
                    <small>${tickt.date}</small>
                </div>
                <p class="mb-1">${tickt.message}</p>
            `;
            ticketsContainer.appendChild(ticktElement);
        });
    }
}

// Fonction d'initialisation du tableau de bord
async function initDashboard() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = getCurrentUser();
    console.log("User info après correction:", user);
    
    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-username').textContent = user.username || '';
        const roleDisplay = user.role === 'owner' ? 'Propriétaire' : 'Locataire';
        
        document.getElementById('user-role').textContent = roleDisplay;
        document.getElementById('user-role-text').textContent = roleDisplay.toLowerCase();
        
        if (user.role === 'owner') {
            console.log("Affichage de la section propriétaire");
            document.getElementById('owner-section').classList.remove('d-none');
            document.getElementById('tenant-section').classList.add('d-none');
            await loadOwnerDashboard();
            generateOwnerTickets();
        } else {
            console.log("Affichage de la section locataire");
            document.getElementById('tenant-section').classList.remove('d-none');
            document.getElementById('owner-section').classList.add('d-none');
            await loadTenantDashboard();
            generateTenantTickets();
        }
    }
    
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);