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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de la récupération des propriétés');
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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de la création de la propriété');
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
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de la mise à jour de la propriété');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de mettre à jour la propriété. Veuillez réessayer.');
        throw error;
    }
}

// Fonction pour supprimer une propriété
async function deleteProperty(propertyId) {
    try {
        const response = await fetch(`/api/property/delete/${propertyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de la mise à jour de la propriété');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer la propriété. Veuillez réessayer.');
        throw error;
    }
}

// Fonction pour afficher les détails d'une propriété
function showPropertyDetails(property) {
    const modalBody = document.getElementById('property-details-content');

    // Traduction du type de propriété
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';

    // Traduction du statut
    const statusBadge = property.status === 'free'
        ? '<span class="badge bg-success">Disponible</span>'
        : '<span class="badge bg-warning">Loué</span>';

    // Créer le contenu HTML
    let html = `
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
            </div>
        </div>
    `;

    // Ajouter la carte locataire si présent
    if (property.tenant) {
        html += `
            <div class="mt-4 border-top pt-3">
                <h5 class="mb-3">Informations locataire</h5>
                <div class="card hover-shadow shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <i class="bi bi-person-circle fs-1 text-primary"></i>
                            </div>
                            <div>
                                <h5 class="card-title mb-1">${property.tenant.username}</h5>
                                <p class="card-text text-muted mb-2">
                                    ${property.tenant.email ? `<i class="bi bi-envelope me-1"></i>${property.tenant.email}` : ''}
                                </p>
                                <div>
                                    <a href="tenant-details.html?id=${property.tenant.id}" class="btn btn-sm btn-outline-primary">
                                        <i class="bi bi-info-circle me-1"></i>Voir détails
                                    </a>
                                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="contactTenant(${property.tenant.id})">
                                        <i class="bi bi-chat me-1"></i>Contacter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    } else {
        html += `
            <div class="mt-4 border-top pt-3">
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <i class="bi bi-info-circle-fill me-2 fs-4"></i>
                    <div>
                        Aucun locataire n'est assigné à ce bien.
                        <button class="btn btn-sm btn-primary ms-3" data-bs-toggle="modal" data-bs-target="#setTenantModal" 
                        id="assign-tenant-from-details">
                            <i class="bi bi-person-plus me-1"></i>Assigner un locataire
                        </button>
                    </div>
                </div>
            </div>`;
    }

    modalBody.innerHTML = html;

    // Attacher l'événement au bouton d'assignation dans l'alerte si présent
    const assignFromDetails = document.getElementById('assign-tenant-from-details');
    if (assignFromDetails) {
        assignFromDetails.addEventListener('click', function () {
            prepareAssignTenant(property.id);
        });
    }

    // Gérer le bouton de changement de locataire
    const editTenantBtn = document.getElementById('edit-tenant-btn');
    if (property.tenant) {
        editTenantBtn.disabled = false;
        editTenantBtn.classList.remove('d-none');

        editTenantBtn.onclick = function () {
            prepareAssignTenant(property.id);
        };
    }

    // Gérer le bouton de suppression de locataire
    const removeTenantBtn = document.getElementById('remove-tenant-btn');
    if (property.tenant) {
        removeTenantBtn.disabled = false;
        removeTenantBtn.classList.remove('d-none');

        // Ajouter un gestionnaire d'événements pour la suppression
        removeTenantBtn.onclick = function () {
            prepareRemoveTenant(property.id);
        };
    } else {
        editTenantBtn.classList.add('d-none');
        removeTenantBtn.classList.add('d-none');
    }

    // Afficher le modal
    const detailsModal = new bootstrap.Modal(document.getElementById('propertyDetailsModal'));
    detailsModal.show();
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
        <div class="card h-100 hover-shadow">
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
        button.addEventListener('click', async function () {
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
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Erreur lors de la récupération des détails de la propriété');
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
        button.addEventListener('click', async function () {
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
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Erreur lors de la récupération des détails de la propriété');
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

    // Ajouter des animations pour les cartes de propriétés
    const propertyCards = document.querySelectorAll('.hover-shadow');
    propertyCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.classList.add('shadow');
        });

        card.addEventListener('mouseleave', function () {
            this.classList.remove('shadow');
        });
    });
}

function prepareAssignTenant(propertyId) {
    // Mettre à jour l'ID de la propriété
    document.getElementById('set-tenant-property-id').value = propertyId;

    // Mettre à jour le titre et le texte du bouton
    document.getElementById('setTenantModalLabel').textContent = 'Assigner un locataire';
    document.getElementById('save-tenant-btn').innerHTML = '<i class="bi bi-person-check me-2"></i>Assigner';

    // Réinitialiser le champ tenant-id et s'assurer qu'il est visible
    document.getElementById('tenant-id').value = '';
    document.querySelector('#set-tenant-form .mb-3').classList.remove('d-none');

    // Supprimer le message de confirmation s'il existe
    const confirmText = document.getElementById('remove-tenant-confirm');
    if (confirmText) {
        confirmText.remove();
    }
}

// Nouvelle fonction pour assigner un locataire
async function assignTenant(propertyId, tenantId) {
    if (!propertyId || !tenantId) {
        throw new Error('ID de propriété ou ID de locataire manquant');
    }

    try {
        const response = await fetch(`/api/property/${propertyId}/setTenant/${tenantId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Vérifier si la réponse est en JSON ou en HTML (erreur 404)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur inconnue lors de l\'assignation du locataire');
            } else {
                throw new Error(`Erreur ${response.status}: L'URL n'est pas valide ou le serveur ne répond pas correctement`);
            }
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur !!! :', error.message);
        alert('Impossible d\'assigner le locataire. Veuillez réessayer. ' + error.message);
        throw error;
    }
}

// Ajoutez cette fonction pour préparer le modal de suppression de locataire
function prepareRemoveTenant(propertyId) {
    // Mettre à jour l'ID de la propriété
    document.getElementById('set-tenant-property-id').value = propertyId;

    // Mettre à jour le titre et le texte du bouton
    document.getElementById('setTenantModalLabel').textContent = 'Retirer le locataire';
    document.getElementById('save-tenant-btn').innerHTML = '<i class="bi bi-person-dash me-2"></i>Confirmer la suppression';

    // Cacher le champ de saisie tenant-id
    document.querySelector('#set-tenant-form .mb-3').classList.add('d-none');

    // Ajouter le message de confirmation
    const existingConfirm = document.getElementById('remove-tenant-confirm');
    if (!existingConfirm) {
        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'remove-tenant-confirm';
        confirmDiv.className = 'alert alert-warning';
        confirmDiv.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Êtes-vous sûr de vouloir retirer le locataire de ce bien?';

        const formGroup = document.querySelector('#set-tenant-form');
        formGroup.insertBefore(confirmDiv, formGroup.firstChild);
    }
}

// Fonction pour retirer un locataire
async function removeTenant(propertyId) {
    if (!propertyId) {
        throw new Error('ID de propriété manquant');
    }

    try {
        const response = await fetch(`/api/property/${propertyId}/removeTenant`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Vérifier si la réponse est en JSON ou en HTML (erreur 404)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur inconnue lors du retrait du locataire');
            } else {
                throw new Error(`Erreur ${response.status}: L'URL n'est pas valide ou le serveur ne répond pas correctement`);
            }
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur:', error.message);
        alert('Impossible de retirer le locataire. Veuillez réessayer. ' + error.message);
        throw error;
    }
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
    document.getElementById('logout-btn').addEventListener('click', function () {
        logout();
        window.location.href = 'login.html';
    });

    // Gérer l'ajout d'une propriété
    document.getElementById('save-property-btn').addEventListener('click', async function () {
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
    document.getElementById('update-property-btn').addEventListener('click', async function () {
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
    
    // Gérer la suppression d'une propriété
    document.getElementById('delete-property-btn').addEventListener('click', async function () {
        const propertyId = document.getElementById('edit-property-id').value;

        try {
            await deleteProperty(propertyId);

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editPropertyModal'));
            modal.hide();

            // Rafraîchir la liste des propriétés
            initPropertiesPage();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la propriété:', error);
        }
    });

    // Gérer l'assignation ou la suppression d'un locataire
    document.getElementById('save-tenant-btn').addEventListener('click', async function () {
        const propertyId = document.getElementById('set-tenant-property-id').value;
        const modalTitle = document.getElementById('setTenantModalLabel').textContent;

        // Vérifier si nous sommes en mode suppression ou assignation
        if (modalTitle.includes('Retirer')) {
            try {
                await removeTenant(propertyId);

                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('setTenantModal'));
                modal.hide();

                // Rafraîchir la liste des propriétés et les détails ouverts
                initPropertiesPage();

                // Réafficher les détails de la propriété avec les données à jour
                try {
                    const response = await fetch(`/api/property/getInfos/${propertyId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const property = await response.json();
                        showPropertyDetails(property);
                    }
                } catch (err) {
                    console.error('Erreur lors de la mise à jour des détails:', err);
                }

                // Restaurer le modal à son état d'origine
                const confirmText = document.getElementById('remove-tenant-confirm');
                if (confirmText) confirmText.remove();
                document.querySelector('#set-tenant-form .mb-3').classList.remove('d-none');
            } catch (error) {
                console.error('Erreur lors du retrait du locataire:', error);
            }
        } else {
            // Code pour l'assignation d'un locataire
            const form = document.getElementById('set-tenant-form');

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const tenantId = document.getElementById('tenant-id').value;

            if (!propertyId) {
                alert('ID de propriété manquant. Veuillez réessayer.');
                return;
            }

            try {
                await assignTenant(propertyId, tenantId);

                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('setTenantModal'));
                modal.hide();

                // Réinitialiser le formulaire
                form.reset();

                // Rafraîchir la liste des propriétés
                initPropertiesPage();

                // Réafficher les détails de la propriété avec les données à jour
                try {
                    const response = await fetch(`/api/property/getInfos/${propertyId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const property = await response.json();
                        showPropertyDetails(property);
                    }
                } catch (err) {
                    console.error('Erreur lors de la mise à jour des détails:', err);
                }
            } catch (error) {
                console.error('Erreur lors de l\'assignation du locataire:', error);
            }
        }
    });
}

// Initialiser la page au chargement du document
document.addEventListener('DOMContentLoaded', initPage);