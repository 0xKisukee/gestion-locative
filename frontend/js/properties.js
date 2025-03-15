// Fonction pour obtenir le token d'authentification 
function getToken() {
    return localStorage.getItem('token');
}

// Fonction pour récupérer les propriétés de l'utilisateur
async function fetchProperties() {
    try {
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
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('error-message').classList.remove('d-none');
        throw error;
    } finally {
        document.getElementById('loading-spinner').classList.add('d-none');
    }
}

// Fonction pour créer une nouvelle propriété
async function createProperty(propertyData) {
    try {
        const response = await fetch('/api/property/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la création de la propriété');
        }
        
        document.getElementById('no-properties-message').classList.add('d-none');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible d\'ajouter la propriété. Veuillez réessayer.');
        throw error;
    }
}

// Fonction pour mettre à jour une propriété
async function updateProperty(propertyId, propertyData) {
    try {
        const response = await fetch(`/api/property/update/${propertyId}`, {
            method: 'PATCH', // Modification pour correspondre à vos routes
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour de la propriété');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de mettre à jour la propriété. Veuillez réessayer.');
        throw error;
    }
}

// Fonction pour afficher les détails d'une propriété
function showPropertyDetails(property) {
    const modal = document.getElementById('property-details-content');
    
    // Traduction du type de propriété
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
    
    // Traduction du statut
    const statusBadge = property.status === 'free' 
        ? '<span class="badge bg-success">Disponible</span>' 
        : '<span class="badge bg-warning">Loué</span>';
    
    // Créer le contenu HTML
    const html = `
        <div class="row" data-property-id="${property.id}">
            <div class="col-md-6">
                <h5>${propertyType}</h5>
                <p><strong>Surface:</strong> ${property.surface} m²</p>
                <p><strong>Adresse:</strong> ${property.address}</p>
                <p><strong>Ville:</strong> ${property.city}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Loyer mensuel:</strong> ${property.rent} €</p>
                <p><strong>Statut:</strong> ${statusBadge}</p>
                ${property.tenantId ? `<p><strong>Locataire ID:</strong> ${property.tenantId}</p>` : ''}
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    
    // Afficher le modal
    const detailsModal = new bootstrap.Modal(document.getElementById('propertyDetailsModal'));
    detailsModal.show();
}

// Nouvelle fonction pour assigner un locataire
async function setTenant(propertyId, tenantId) {
    try {
        const response = await fetch(`/api/property/${propertyId}/setTenant/${tenantId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur inconnue lors de l\'assignation du locataire');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur !!! :', error.message);
        alert('Impossible d\'assigner le locataire. Veuillez réessayer.');
        throw error;
    }
}

// Fonction pour créer une carte de propriété
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-3';
    
    // Détermine le type de propriété (Appartement, Maison, etc.)
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
    
    // Détermine le statut (Disponible ou Loué)
    const statusClass = property.status === 'free' ? 'bg-success' : 'bg-warning';
    const statusText = property.status === 'free' ? 'Disponible' : 'Loué';
    
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${propertyType} - ${property.city}</h5>
                <p class="card-text">${propertyType}, ${property.surface}m²</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge ${statusClass}">${statusText}</span>
                    <span class="fw-bold">${property.rent}€/mois</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="btn-group w-100">
                    <button class="btn btn-outline-primary btn-details" data-property-id="${property.id}">Détails</button>
                    <button class="btn btn-outline-secondary btn-edit" data-property-id="${property.id}">Modifier</button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Fonction pour initialiser la page avec les propriétés
async function initPropertiesPage() {
    try {
        const properties = await fetchProperties();
        const container = document.getElementById('properties-container');
        
        // Effacer le contenu actuel
        container.innerHTML = '';
        
        // Vérifier s'il y a des propriétés
        if (properties.length === 0) {
            document.getElementById('no-properties-message').classList.remove('d-none');
            return;
        }
        
        // Créer une carte pour chaque propriété
        properties.forEach(property => {
            const card = createPropertyCard(property);
            container.appendChild(card);
        });
        
        // Attacher les écouteurs d'événements aux boutons
        attachEventListeners();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la page:', error);
    }
}

// Fonction pour attacher les écouteurs d'événements
function attachEventListeners() {
    // Boutons de détails
    document.querySelectorAll('.btn-details').forEach(button => {
        button.addEventListener('click', async function() {
            const propertyId = this.getAttribute('data-property-id');
            try {
                const response = await fetch(`/api/property/getInfos/${propertyId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de la propriété');
                }
                
                const property = await response.json();
                showPropertyDetails(property);
            } catch (error) {
                console.error('Erreur:', error);
                alert('Impossible de charger les détails de la propriété.');
            }
        });
    });
    
    // Boutons de modification
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', async function() {
            const propertyId = this.getAttribute('data-property-id');
            try {
                const response = await fetch(`/api/property/getInfos/${propertyId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de la propriété');
                }
                
                const property = await response.json();
                
                // Remplir le formulaire d'édition
                document.getElementById('edit-property-id').value = property.id;
                document.getElementById('edit-property-type').value = property.detail;
                document.getElementById('edit-property-surface').value = property.surface;
                document.getElementById('edit-property-address').value = property.address;
                document.getElementById('edit-property-city').value = property.city;
                document.getElementById('edit-property-rent').value = property.rent;
                
                // Afficher le modal d'édition
                const editModal = new bootstrap.Modal(document.getElementById('editPropertyModal'));
                editModal.show();
            } catch (error) {
                console.error('Erreur:', error);
                alert('Impossible de charger les détails de la propriété pour modification.');
            }
        });
    });
}

// Initialisation de la page
function initPage() {
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
    
    // Initialiser la page avec les propriétés
    initPropertiesPage();
    
    // Gérer la déconnexion
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
        window.location.href = 'login.html';
    });
    
    // Gérer l'ajout d'une propriété
    document.getElementById('save-property-btn').addEventListener('click', async function() {
        const form = document.getElementById('add-property-form');
        
        // Vérifier la validité du formulaire
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Récupérer les données du formulaire
        const propertyData = {
            detail: document.getElementById('property-type').value,
            surface: parseFloat(document.getElementById('property-surface').value),
            address: document.getElementById('property-address').value,
            city: document.getElementById('property-city').value,
            rent: parseFloat(document.getElementById('property-rent').value)
        };
        
        try {
            await createProperty(propertyData);
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
            modal.hide();
            
            // Réinitialiser le formulaire
            form.reset();
            
            // Rafraîchir la liste des propriétés
            initPropertiesPage();
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la propriété:', error);
        }
    });
    
    // Gérer la mise à jour d'une propriété
    document.getElementById('update-property-btn').addEventListener('click', async function() {
        const form = document.getElementById('edit-property-form');
        
        // Vérifier la validité du formulaire
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const propertyId = document.getElementById('edit-property-id').value;
        
        // Récupérer les données du formulaire
        const propertyData = {
            detail: document.getElementById('edit-property-type').value,
            surface: parseFloat(document.getElementById('edit-property-surface').value),
            address: document.getElementById('edit-property-address').value,
            city: document.getElementById('edit-property-city').value,
            rent: parseFloat(document.getElementById('edit-property-rent').value)
        };
        
        try {
            await updateProperty(propertyId, propertyData);
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editPropertyModal'));
            modal.hide();
            
            // Rafraîchir la liste des propriétés
            initPropertiesPage();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la propriété:', error);
        }
    });

        // Gérer l'assignation d'un locataire
        document.getElementById('save-tenant-btn').addEventListener('click', async function() {
            const form = document.getElementById('set-tenant-form');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const propertyId = document.getElementById('set-tenant-property-id').value;
            const tenantId = document.getElementById('tenant-id').value;
            
            try {
                await setTenant(propertyId, tenantId);
                
                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('setTenantModal'));
                modal.hide();
                
                // Réinitialiser le formulaire
                form.reset();
                
                // Rafraîchir la liste des propriétés
                initPropertiesPage();
            } catch (error) {
                console.error('Erreur lors de l\'assignation du locataire:', error);
            }
        });
        
        // Gérer le clic sur "Assigner un locataire" dans le modal des détails
        document.getElementById('assign-tenant-btn').addEventListener('click', function() {
            const propertyId = document.querySelector('#property-details-content .row').getAttribute('data-property-id');
            document.getElementById('set-tenant-property-id').value = propertyId;
        });
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initPage);