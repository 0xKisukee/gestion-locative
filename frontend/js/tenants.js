// Fonction pour obtenir le token d'authentification 
function getToken() {
    return localStorage.getItem('token');
}

// Fonction pour récupérer les propriétés avec des locataires
async function fetchTenantsFromProperties() {
    try {
        // Afficher le spinner de chargement
        document.getElementById('loading-spinner').classList.remove('d-none');
        document.getElementById('error-message').classList.add('d-none');
        document.getElementById('no-tenants-message').classList.add('d-none');
        document.getElementById('tenants-table-container').classList.add('d-none');

        // Récupérer toutes les propriétés du propriétaire
        const response = await fetch('/api/property/getMyProperties', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des propriétés');
        }

        const properties = await response.json();
        
        // Filtrer les propriétés qui ont un locataire (status = 'rented')
        const propertiesWithTenants = properties.filter(property => property.status === 'rented');
        
        // Si aucune propriété avec locataire, afficher le message "aucun locataire"
        if (propertiesWithTenants.length === 0) {
            document.getElementById('loading-spinner').classList.add('d-none');
            document.getElementById('no-tenants-message').classList.remove('d-none');
            return [];
        }

        // Pour chaque propriété avec locataire, récupérer les détails du locataire
        const tenantDetailsPromises = propertiesWithTenants.map(async property => {
            try {
                // Récupérer les détails de la propriété incluant le locataire
                const detailsResponse = await fetch(`/api/property/getInfos/${property.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!detailsResponse.ok) {
                    console.error(`Erreur lors de la récupération des détails de la propriété ${property.id}`);
                    return null;
                }

                const detailedProperty = await detailsResponse.json();
                
                // S'assurer que la propriété a bien un locataire
                if (!detailedProperty.tenant) {
                    console.warn(`La propriété ${property.id} n'a pas de locataire, malgré son statut 'rented'`);
                    return null;
                }

                // Retourner un objet contenant les informations du locataire et de la propriété
                return {
                    tenant: detailedProperty.tenant,
                    property: {
                        id: detailedProperty.id,
                        detail: detailedProperty.detail,
                        address: detailedProperty.address,
                        city: detailedProperty.city,
                        rent: detailedProperty.rent,
                        surface: detailedProperty.surface
                    }
                };
            } catch (error) {
                console.error(`Erreur lors de la récupération des détails du locataire pour la propriété ${property.id}:`, error);
                return null;
            }
        });

        // Attendre toutes les promesses de récupération des détails des locataires
        const results = await Promise.all(tenantDetailsPromises);
        
        // Filtrer les résultats null (erreurs)
        const tenantsWithProperties = results.filter(result => result !== null);

        // Masquer le spinner de chargement
        document.getElementById('loading-spinner').classList.add('d-none');
        
        return tenantsWithProperties;
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('error-message').classList.remove('d-none');
        throw error;
    }
}

// Fonction pour afficher les locataires dans le tableau
function displayTenants(tenantsWithProperties) {
    const tableBody = document.getElementById('tenants-table-body');
    const tenantCount = document.getElementById('tenants-count');
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Mettre à jour le compteur de locataires
    tenantCount.textContent = tenantsWithProperties.length;
    
    // Si aucun locataire, afficher le message et cacher le tableau
    if (tenantsWithProperties.length === 0) {
        document.getElementById('no-tenants-message').classList.remove('d-none');
        document.getElementById('tenants-table-container').classList.add('d-none');
        return;
    }
    
    // Sinon, afficher le tableau et cacher le message
    document.getElementById('no-tenants-message').classList.add('d-none');
    document.getElementById('tenants-table-container').classList.remove('d-none');
    
    // Créer une ligne pour chaque locataire
    tenantsWithProperties.forEach(item => {
        const { tenant, property } = item;
        
        // Format du bien (Appartement/Maison + Ville)
        const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
        const propertyText = `${propertyType} - ${property.address}`;
        
        // Téléphone (afficher une valeur par défaut si non défini)
        const phoneText = tenant.phone || 'Non renseigné';
        
        // Créer la ligne
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tenant.username}</td>
            <td>${tenant.email}</td>
            <td>${phoneText}</td>
            <td>${propertyText}</td>
            <td><span class="badge bg-success">Actif</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary btn-view-tenant" data-tenant-id="${tenant.id}" data-property-id="${property.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary btn-edit-tenant" data-tenant-id="${tenant.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-tenant" data-tenant-id="${tenant.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Attacher les gestionnaires d'événements aux boutons d'action
    attachEventListeners();
}

// Fonction pour afficher les détails d'un locataire
function showTenantDetails(tenant, property) {
    const modalBody = document.getElementById('tenant-details-content');
    
    // Formater les informations de la propriété
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
    
    // Créer le contenu HTML
    const html = `
        <div class="mb-4">
            <h6 class="fw-bold">Informations du locataire</h6>
            <p><strong>Nom:</strong> ${tenant.username}</p>
            <p><strong>Email:</strong> ${tenant.email}</p>
            <p><strong>Téléphone:</strong> ${tenant.phone || 'Non renseigné'}</p>
        </div>
        <div>
            <h6 class="fw-bold">Bien loué</h6>
            <p><strong>Type:</strong> ${propertyType}</p>
            <p><strong>Adresse:</strong> ${property.address}, ${property.city}</p>
            <p><strong>Surface:</strong> ${property.surface} m²</p>
            <p><strong>Loyer mensuel:</strong> ${property.rent} €</p>
        </div>
    `;
    
    modalBody.innerHTML = html;
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('tenantDetailsModal'));
    modal.show();
}

// Fonction pour attacher les gestionnaires d'événements
function attachEventListeners() {
    // Gestionnaires pour les boutons "Voir détails"
    document.querySelectorAll('.btn-view-tenant').forEach(button => {
        button.addEventListener('click', async function() {
            const tenantId = this.getAttribute('data-tenant-id');
            const propertyId = this.getAttribute('data-property-id');
            
            try {
                // Récupérer les détails de la propriété (qui inclut le locataire)
                const response = await fetch(`/api/property/getInfos/${propertyId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails');
                }
                
                const propertyWithTenant = await response.json();
                
                // Afficher les détails
                showTenantDetails(propertyWithTenant.tenant, propertyWithTenant);
            } catch (error) {
                console.error('Erreur:', error);
                alert('Impossible de charger les détails du locataire.');
            }
        });
    });
    
    // Note: Pour les boutons d'édition et de suppression, nous laissons les fonctionnalités fictives pour l'instant
    document.querySelectorAll('.btn-edit-tenant, .btn-delete-tenant').forEach(button => {
        button.addEventListener('click', function() {
            const tenantId = this.getAttribute('data-tenant-id');
            const action = this.classList.contains('btn-edit-tenant') ? 'modifier' : 'supprimer';
            alert(`Fonctionnalité pour ${action} le locataire (ID: ${tenantId}) non implémentée.`);
        });
    });
}

// Fonction d'initialisation
async function initTenantsPage() {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Afficher les informations de l'utilisateur
    const user = getCurrentUser();
    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-role').textContent = user.role === 'owner' ? 'Propriétaire' : 'Locataire';
    }
    
    // Gérer la déconnexion
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
        window.location.href = 'login.html';
    });
    
    try {
        // Récupérer et afficher les locataires
        const tenantsWithProperties = await fetchTenantsFromProperties();
        displayTenants(tenantsWithProperties);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la page:', error);
    }
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initTenantsPage);