// Fonctions API spécifiques à Properties
async function fetchProperties() {
    try {
        const properties = await apiCall('/api/property/getMyProperties');
        return properties;
    } catch (error) {
        document.getElementById('error-text').textContent = error.message || 'Impossible de charger vos biens.';
        document.getElementById('error-message').classList.remove('d-none');
        throw error;
    } finally {
        document.getElementById('loading-spinner').classList.add('d-none');
    }
}

async function createProperty(propertyData) {
    try {
        const result = await apiCall('/api/property/create', 'POST', propertyData);
        document.getElementById('no-properties-message').classList.add('d-none');
        return result;
    } catch (error) {
        alert('Erreur lors de la création : ' + (error.message || 'Veuillez réessayer.'));
        throw error;
    }
}

async function updateProperty(propertyId, propertyData) {
    try {
        return await apiCall(`/api/property/update/${propertyId}`, 'PATCH', propertyData);
    } catch (error) {
        alert('Erreur lors de la mise à jour : ' + (error.message || 'Veuillez réessayer.'));
        throw error;
    }
}

async function deleteProperty(propertyId) {
    try {
        return await apiCall(`/api/property/delete/${propertyId}`, 'DELETE');
    } catch (error) {
        alert('Erreur lors de la suppression : ' + (error.message || 'Veuillez réessayer.'));
        throw error;
    }
}

async function assignTenant(propertyId, tenantId, entryDate) {
    try {
        return await apiCall(`/api/property/${propertyId}/setTenant/${tenantId}`, 'PATCH', { entryDate });
    } catch (error) {
        alert('Erreur lors de l\'assignation : ' + (error.message || 'Veuillez réessayer.'));
        throw error;
    }
}

async function removeTenant(propertyId) {
    try {
        return await apiCall(`/api/property/${propertyId}/removeTenant`, 'PATCH');
    } catch (error) {
        alert('Erreur lors du retrait : ' + (error.message || 'Veuillez réessayer.'));
        throw error;
    }
}

async function getPropertyDetails(propertyId) {
    try {
        return await apiCall(`/api/property/getInfos/${propertyId}`);
    } catch (error) {
        alert('Erreur lors de la récupération des détails : ' + (error.message || 'Veuillez réessayer.'));
        throw error;
    }
}

// Fonction pour créer une carte de propriété
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
    const statusClass = property.status === 'free' ? 'bg-success' : 'bg-warning';
    const statusText = property.status === 'free' ? 'Disponible' : 'Loué';

    card.innerHTML = `
                <div class="card h-100 shadow-sm border-0 rounded-3 feature-card">
                    <div class="card-body p-4 text-center">
                        <div class="rounded-circle bg-primary bg-opacity-10 mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 70px; height: 70px;">
                            <i class="bi bi-house-door fs-2 text-primary"></i>
                        </div>
                        <h5 class="card-title fw-bold">${propertyType} - ${property.city}</h5>
                        <p class="card-text text-muted">${property.surface} m²</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge ${statusClass} py-2 px-3">${statusText}</span>
                            <span class="fw-bold text-primary">${property.rent} €/mois</span>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-0 text-center py-3">
                        <button class="btn btn-outline-primary btn-sm action-btn btn-details" data-property-id="${property.id}"><i class="bi bi-eye me-1"></i> Détails</button>
                        <button class="btn btn-outline-secondary btn-sm action-btn btn-edit" data-property-id="${property.id}"><i class="bi bi-pencil me-1"></i> Modifier</button>
                    </div>
                </div>
            `;
    return card;
}

// Fonction pour afficher les détails d'une propriété
function showPropertyDetails(property) {
    const modalBody = document.getElementById('property-details-content');
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
    const statusBadge = property.status === 'free' ? '<span class="badge bg-success py-2 px-3">Disponible</span>' : '<span class="badge bg-warning py-2 px-3">Loué</span>';

    let html = `
                <div class="row" data-property-id="${property.id}">
                    <div class="col-md-6">
                        <h5 class="fw-bold text-primary">${propertyType}</h5>
                        <p><i class="bi bi-rulers me-2 text-primary"></i> <strong>Surface :</strong> ${property.surface} m²</p>
                        <p><i class="bi bi-geo-alt me-2 text-primary"></i> <strong>Adresse :</strong> ${property.address}</p>
                        <p><i class="bi bi-building me-2 text-primary"></i> <strong>Ville :</strong> ${property.city}</p>
                    </div>
                    <div class="col-md-6">
                        <p><i class="bi bi-cash me-2 text-primary"></i> <strong>Loyer mensuel :</strong> ${property.rent} €</p>
                        <p><i class="bi bi-info-circle me-2 text-primary"></i> <strong>Statut :</strong> ${statusBadge}</p>
                    </div>
                </div>
            `;

    if (property.tenant) {
        html += `
                    <div class="mt-4 border-top pt-3">
                        <h5 class="fw-bold text-primary mb-3"><i class="bi bi-person-circle me-2"></i> Informations locataire</h5>
                        <div class="card shadow-sm border-0 rounded-3">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <div class="me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                                        <i class="bi bi-person-circle fs-2 text-primary"></i>
                                    </div>
                                    <div>
                                        <h5 class="card-title mb-1 fw-bold">${property.tenant.username}</h5>
                                        <p class="card-text text-muted mb-2">${property.tenant.email ? `<i class="bi bi-envelope me-1"></i> ${property.tenant.email}` : ''}</p>
                                        <a href="tenant-details.html?id=${property.tenant.id}" class="btn btn-sm btn-outline-primary action-btn"><i class="bi bi-info-circle me-1"></i> Détails</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
    } else {
        html += `
                    <div class="mt-4 border-top pt-3">
                        <div class="alert alert-info d-flex align-items-center shadow-sm" role="alert">
                            <i class="bi bi-info-circle-fill me-2 fs-4 text-info"></i>
                            <div>Aucun locataire assigné. 
                                <button class="btn btn-sm btn-primary action-btn ms-3" data-bs-toggle="modal" data-bs-target="#setTenantModal" id="assign-tenant-from-details">
                                    <i class="bi bi-person-plus me-1"></i> Assigner
                                </button>
                            </div>
                        </div>
                    </div>`;
    }

    modalBody.innerHTML = html;

    const startRemoveTenantBtn = document.getElementById('start-remove-tenant-btn');
    if (property.tenant) {
        startRemoveTenantBtn.classList.remove('d-none');
    } else {
        startRemoveTenantBtn.classList.add('d-none');
    }

    // Ajouter un gestionnaire d'événements pour la suppression
    startRemoveTenantBtn.onclick = function () {
        prepareRemoveTenant(property.id);
    };

    const assignFromDetails = document.getElementById('assign-tenant-from-details');
    if (assignFromDetails) {
        assignFromDetails.addEventListener('click', () => prepareAssignTenant(property.id));
    }

    const detailsModal = new bootstrap.Modal(document.getElementById('propertyDetailsModal'));
    detailsModal.show();
}

// Préparer l'assignation d'un locataire
function prepareAssignTenant(propertyId) {
    document.getElementById('tenant-property-id').value = propertyId;
    const existingConfirm = document.getElementById('assign-tenant-confirm');
    if (!existingConfirm) {
        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'assign-tenant-confirm';
        confirmDiv.className = 'alert alert-warning shadow-sm';
        confirmDiv.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i> Êtes-vous sûr de vouloir ajouter ce locataire ?';
        document.querySelector('#confirm-assign-tenant-body').prepend(confirmDiv);
    }
}

// Préparer la suppression d'un locataire
function prepareRemoveTenant(propertyId) {
    document.getElementById('tenant-property-id').value = propertyId;
    const existingConfirm = document.getElementById('remove-tenant-confirm');
    if (!existingConfirm) {
        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'remove-tenant-confirm';
        confirmDiv.className = 'alert alert-warning shadow-sm';
        confirmDiv.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i> Êtes-vous sûr de vouloir retirer le locataire ?';
        document.querySelector('#confirm-remove-tenant-body').prepend(confirmDiv);
    }
}

// Initialisation de la page
async function initPropertiesPage() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    if (!hasRole('owner')) {
        alert('Accès réservé aux propriétaires.');
        window.location.href = 'dashboard.html';
        return;
    }

    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-role').textContent = 'Propriétaire';
    }

    checkTokenExpiration();

    try {
        const properties = await fetchProperties();
        const container = document.getElementById('properties-container');
        container.innerHTML = '';

        if (properties.length === 0) {
            document.getElementById('no-properties-message').classList.remove('d-none');
            return;
        }

        properties.forEach(property => container.appendChild(createPropertyCard(property)));
        attachEventListeners();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// Attacher les écouteurs d'événements
function attachEventListeners() {
    document.querySelectorAll('.btn-details').forEach(button => {
        button.addEventListener('click', async function () {
            const propertyId = this.getAttribute('data-property-id');
            try {
                const property = await getPropertyDetails(propertyId);
                showPropertyDetails(property);
            } catch (error) {
                console.error('Erreur:', error);
            }
        });
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', async function () {
            const propertyId = this.getAttribute('data-property-id');
            try {
                const property = await getPropertyDetails(propertyId);
                document.getElementById('edit-property-id').value = property.id;
                document.getElementById('edit-property-type').value = property.detail;
                document.getElementById('edit-property-surface').value = property.surface;
                document.getElementById('edit-property-address').value = property.address;
                document.getElementById('edit-property-city').value = property.city;
                document.getElementById('edit-property-rent').value = property.rent;

                const editModal = new bootstrap.Modal(document.getElementById('editPropertyModal'));
                editModal.show();
            } catch (error) {
                console.error('Erreur:', error);
            }
        });
    });

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
    initPropertiesPage();

    document.getElementById('save-property-btn').addEventListener('click', async () => {
        const form = document.getElementById('add-property-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const propertyData = {
            detail: document.getElementById('property-type').value,
            surface: parseFloat(document.getElementById('property-surface').value),
            address: document.getElementById('property-address').value,
            city: document.getElementById('property-city').value,
            rent: parseFloat(document.getElementById('property-rent').value)
        };
        try {
            await createProperty(propertyData);
            bootstrap.Modal.getInstance(document.getElementById('addPropertyModal')).hide();
            form.reset();
            initPropertiesPage();
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
        }
    });

    document.getElementById('update-property-btn').addEventListener('click', async () => {
        const form = document.getElementById('edit-property-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const propertyId = document.getElementById('edit-property-id').value;
        const propertyData = {
            detail: document.getElementById('edit-property-type').value,
            surface: parseFloat(document.getElementById('edit-property-surface').value),
            address: document.getElementById('edit-property-address').value,
            city: document.getElementById('edit-property-city').value,
            rent: parseFloat(document.getElementById('edit-property-rent').value)
        };
        try {
            await updateProperty(propertyId, propertyData);
            bootstrap.Modal.getInstance(document.getElementById('editPropertyModal')).hide();
            initPropertiesPage();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    });

    document.getElementById('delete-property-btn').addEventListener('click', async () => {
        const propertyId = document.getElementById('edit-property-id').value;
        if (confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
            try {
                await deleteProperty(propertyId);
                bootstrap.Modal.getInstance(document.getElementById('editPropertyModal')).hide();
                initPropertiesPage();
            } catch (error) {
                if (error.message.includes('Please remove the tenant')) {
                    alert('Impossible de supprimer ce bien car il est actuellement loué. Veuillez d\'abord retirer le locataire.');
                } else {
                    alert('Erreur lors de la suppression : ' + (error.message || 'Veuillez réessayer.'));
                }
            }
        }
    });

    document.getElementById('confirm-assign-tenant-btn').addEventListener('click', async () => {
        const propertyId = document.getElementById('tenant-property-id').value;
        const form = document.getElementById('set-tenant-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const tenantId = document.getElementById('tenant-id').value;
        const entryDate = document.getElementById('entry-date').value;
        try {
            await assignTenant(propertyId, tenantId, entryDate);
            bootstrap.Modal.getInstance(document.getElementById('confirmAssignTenantModal')).hide();
            form.reset();
            initPropertiesPage();
            const property = await getPropertyDetails(propertyId);
            showPropertyDetails(property);
        } catch (error) {
            console.error('Erreur lors de l\'assignation:', error);
        }
    });

    document.getElementById('confirm-remove-tenant-btn').addEventListener('click', async () => {
        const propertyId = document.getElementById('tenant-property-id').value;

        if (!propertyId) {
            console.log("OUPSI");
        }

        try {
            await removeTenant(propertyId);
            bootstrap.Modal.getInstance(document.getElementById('confirmRemoveTenantModal')).hide();
            initPropertiesPage();
            const property = await getPropertyDetails(propertyId);
            showPropertyDetails(property);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    });
});