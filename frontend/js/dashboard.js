// Fonction pour obtenir le token d'authentification 
function getToken() {
    return localStorage.getItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

// Fonction pour charger les propriétés d'un propriétaire
async function loadOwnerProperties() {
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
        const pendingPayments = document.getElementById('pending-payments');
        
        if (propertiesCount) propertiesCount.textContent = properties.length;
        if (tenantsCount) {
            const propertiesWithTenants = properties.filter(prop => prop.tenantId !== null);
            tenantsCount.textContent = propertiesWithTenants.length;
        }
        if (pendingPayments) pendingPayments.textContent = '0'; // À adapter avec données réelles
        
        // Mettre à jour les statistiques dans la section "Statistiques clés"
        const propertiesCountStat = document.getElementById('properties-count-stat');
        const tenantsCountStat = document.getElementById('tenants-count-stat');
        const contractsCountStat = document.getElementById('contracts-count-stat');
        const pendingPaymentsStat = document.getElementById('pending-payments-stat');
        
        if (propertiesCountStat) propertiesCountStat.textContent = properties.length;
        if (tenantsCountStat) tenantsCountStat.textContent = properties.filter(prop => prop.tenantId !== null).length;
        if (contractsCountStat) contractsCountStat.textContent = '0'; // À adapter
        if (pendingPaymentsStat) pendingPaymentsStat.textContent = '0'; // À adapter
        
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

// Fonction pour charger les informations de location d'un locataire
async function loadTenantRental() {
    try {
        const propertyInfoElement = document.getElementById('tenant-property-info');
        
        const response = await fetch('/api/user/myProperty', { // Note : vérifiez si c'est bien '/api/tenant/property' dans votre backend
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
            document.getElementById('next-payment-date').textContent = 'N/A';
            document.getElementById('next-payment-amount').textContent = '0 €';
            document.getElementById('payment-status').textContent = 'N/A';
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
        document.getElementById('next-payment-amount').textContent = `${property.rent} €`;
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

// Fonction pour générer des notifications factices pour les propriétaires
function generateOwnerNotifications() {
    const notifications = [
        { title: 'Paiement reçu', date: 'il y a 3 jours', message: 'Le loyer pour l\'appartement rue de Paris a été reçu.' },
        { title: 'Contrat à renouveler', date: 'il y a 1 semaine', message: 'Le contrat de location pour l\'appartement rue du Commerce arrive à échéance.' },
        { title: 'Demande de réparation', date: 'il y a 2 semaines', message: 'Un locataire a signalé un problème de plomberie.' }
    ];
    
    const notificationsContainer = document.getElementById('owner-notifications');
    if (notificationsContainer) {
        notificationsContainer.innerHTML = notifications.length === 0 ? '<p class="text-muted">Aucune notification</p>' : '';
        notifications.forEach(notif => {
            const notifElement = document.createElement('a');
            notifElement.href = '#';
            notifElement.className = 'list-group-item list-group-item-action';
            notifElement.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${notif.title}</h6>
                    <small>${notif.date}</small>
                </div>
                <p class="mb-1">${notif.message}</p>
            `;
            notificationsContainer.appendChild(notifElement);
        });
        document.getElementById('notification-count').textContent = notifications.length;
    }
}

// Fonction pour générer des notifications factices pour les locataires
function generateTenantNotifications() {
    const notifications = [
        { title: 'Paiement dû', date: 'dans 5 jours', message: 'Votre loyer est dû le 20 mars.' },
        { title: 'Entretien prévu', date: 'il y a 2 jours', message: 'Un technicien passera le 18 mars pour une vérification.' }
    ];
    
    const notificationsContainer = document.getElementById('tenant-notifications');
    if (notificationsContainer) {
        notificationsContainer.innerHTML = notifications.length === 0 ? '<p class="text-muted">Aucune notification</p>' : '';
        notifications.forEach(notif => {
            const notifElement = document.createElement('a');
            notifElement.href = '#';
            notifElement.className = 'list-group-item list-group-item-action';
            notifElement.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${notif.title}</h6>
                    <small>${notif.date}</small>
                </div>
                <p class="mb-1">${notif.message}</p>
            `;
            notificationsContainer.appendChild(notifElement);
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
            await loadOwnerProperties();
            generateOwnerNotifications();
        } else {
            console.log("Affichage de la section locataire");
            document.getElementById('tenant-section').classList.remove('d-none');
            document.getElementById('owner-section').classList.add('d-none');
            await loadTenantRental();
            generateTenantNotifications();
        }
    }
    
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);