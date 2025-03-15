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
        
        // Mettre à jour les statistiques
        document.getElementById('properties-count').textContent = properties.length;
        
        // Compter les propriétés avec locataires
        const propertiesWithTenants = properties.filter(prop => prop.tenantId !== null);
        document.getElementById('tenants-count').textContent = propertiesWithTenants.length;
        
        // Autres statistiques (à personnaliser selon vos besoins)
        document.getElementById('contracts-count').textContent = '0'; // À adapter
        document.getElementById('pending-payments').textContent = '0'; // À adapter
        
        return properties;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        // Afficher un message d'erreur à l'utilisateur
        const ownerSection = document.getElementById('owner-section');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger';
        errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Impossible de charger vos propriétés: ${error.message}`;
        ownerSection.prepend(errorMessage);
        return [];
    }
}

// Fonction pour charger les informations de location d'un locataire
async function loadTenantRental() {
    try {
        const propertyInfoElement = document.getElementById('tenant-property-info');
        
        // Tentative de récupération de la propriété louée par le locataire
        const response = await fetch('/api/tenant/property', {
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
            return;
        }
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des informations de location');
        }
        
        const property = await response.json();
        
        // Afficher les informations de la propriété
        propertyInfoElement.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>${property.detail === 'apartment' ? 'Appartement' : 'Maison'}</h5>
                    <p><i class="bi bi-geo-alt"></i> ${property.address}, ${property.city}</p>
                    <p><i class="bi bi-rulers"></i> Surface: ${property.surface} m²</p>
                </div>
                <div class="col-md-6">
                    <h5>Informations de location</h5>
                    <p><i class="bi bi-cash"></i> Loyer mensuel: ${property.rent} €</p>
                    <p><i class="bi bi-person"></i> Propriétaire: ${property.owner ? property.owner.username : 'Non spécifié'}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('tenant-property-info').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Impossible de charger les informations de location.
            </div>
        `;
    }
}

// Fonction pour générer des notifications factices (à remplacer par des données réelles)
function generateOwnerNotifications() {
    const notifications = [
        {
            title: 'Paiement reçu',
            date: 'il y a 3 jours',
            message: 'Le loyer pour l\'appartement rue de Paris a été reçu.'
        },
        {
            title: 'Contrat à renouveler',
            date: 'il y a 1 semaine',
            message: 'Le contrat de location pour l\'appartement rue du Commerce arrive à échéance.'
        },
        {
            title: 'Demande de réparation',
            date: 'il y a 2 semaines',
            message: 'Un locataire a signalé un problème de plomberie.'
        }
    ];
    
    const notificationsContainer = document.getElementById('owner-notifications');
    notificationsContainer.innerHTML = '';
    
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

// Fonction d'initialisation du tableau de bord
async function initDashboard() {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Récupérer, corriger si nécessaire, et afficher les informations de l'utilisateur
    const user = getCurrentUser();
    console.log("User info après correction:", user);
    
    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-username').textContent = user.username || '';
        
        // Déterminer le rôle correctement
        const roleDisplay = user.role === 'owner' ? 'Propriétaire' : 'Locataire';
        const roleLowercase = user.role === 'owner' ? 'propriétaire' : 'locataire';
        
        // Mettre à jour les éléments d'affichage du rôle
        document.getElementById('user-role').textContent = roleDisplay;
        document.getElementById('user-role-text').textContent = roleLowercase;
        
        // Afficher la section appropriée en fonction du rôle
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
        }
    }
    
    // Gérer la déconnexion
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
    });
}

// Initialiser le tableau de bord au chargement de la page
document.addEventListener('DOMContentLoaded', initDashboard);