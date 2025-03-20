// Fonction pour récupérer les locataires attribués aux propriétés de l'utilisateur connecté
async function fetchTenantsFromProperties() {
    try {
        const properties = await apiCall('/api/property/getMyProperties');
        if (!Array.isArray(properties)) {
            throw new Error('Réponse invalide du serveur');
        }

        const propertiesWithTenants = properties.filter(property => property.status === 'rented' && property.tenant);

        if (propertiesWithTenants.length === 0) {
            return [];
        }

        // Fetch payment information for each tenant
        const tenantsWithPayments = await Promise.all(propertiesWithTenants.map(async (property) => {
            try {
                const payments = await apiCall(`/api/user/myPayments`);
                console.log(payments);
                const duePayments = payments.filter(pay => pay.status === 'due');
                const incomingPayments = payments.filter(pay => pay.status === 'incoming');
                
                return {
                    tenant: property.tenant,
                    property: {
                        id: property.id,
                        detail: property.detail,
                        address: property.address,
                        city: property.city,
                        rent: property.rent,
                        surface: property.surface
                    },
                    payments: {
                        due: duePayments.length,
                        incoming: incomingPayments.length
                    }
                };
            } catch (error) {
                console.error(`Erreur lors de la récupération des paiements pour le locataire ${property.tenant.id}:`, error);
                return {
                    tenant: property.tenant,
                    property: {
                        id: property.id,
                        detail: property.detail,
                        address: property.address,
                        city: property.city,
                        rent: property.rent,
                        surface: property.surface
                    },
                    payments: {
                        due: 0,
                        incoming: 0
                    }
                };
            }
        }));

        return tenantsWithPayments;
    } catch (error) {
        console.error('Erreur dans fetchTenantsFromProperties:', error);
        document.getElementById('error-text').textContent = error.message || 'Impossible de charger vos locataires.';
        document.getElementById('error-message').classList.remove('d-none');
        return [];
    } finally {
        document.getElementById('loading-spinner').classList.add('d-none');
    }
}

// Fonction pour supprimer un locataire d'une propriété
async function removeTenantFromProperty(propertyId) {
    try {
        await apiCall(`/api/property/${propertyId}/removeTenant`, 'PATCH');
    } catch (error) {
        console.error('Erreur lors de la suppression du locataire:', error);
        throw error;
    }
}

// Fonction pour afficher les locataires dans le tableau
function displayTenants(tenantsWithProperties) {
    const tableBody = document.getElementById('tenants-table-body');
    const tenantCount = document.getElementById('tenants-count');
    tableBody.innerHTML = '';
    tenantCount.textContent = tenantsWithProperties.length;

    if (tenantsWithProperties.length === 0) {
        document.getElementById('no-tenants-message').classList.remove('d-none');
        document.getElementById('tenants-table-container').classList.add('d-none');
        return;
    }

    document.getElementById('no-tenants-message').classList.add('d-none');
    document.getElementById('tenants-table-container').classList.remove('d-none');

    tenantsWithProperties.forEach(item => {
        const { tenant, property, payments } = item;
        const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';
        const propertyText = `${propertyType} - ${property.address}, ${property.city}`;
        const phoneText = tenant.phone || 'Non renseigné';

        // Determine status badge
        let statusBadge;
        if (payments.due == 1) {
            statusBadge = '<span class="badge bg-danger py-2 px-3">En retard</span>';
        } else if (payments.due > 1) {
            statusBadge = '<span class="badge bg-danger py-2 px-3">À régulariser</span>';
        } else if (payments.incoming > 0) {
            statusBadge = '<span class="badge bg-warning py-2 px-3">Paiements à venir</span>';
        } else {
            statusBadge = '<span class="badge bg-success py-2 px-3">À jour</span>';
        }

        const row = document.createElement('tr');
        row.className = 'feature-row';
        row.innerHTML = `
            <td>${tenant.username}</td>
            <td>${tenant.email}</td>
            <td>${phoneText}</td>
            <td>${propertyText}</td>
            <td>
                <div class="d-inline-block" data-bs-placement="top">
                    ${statusBadge}
                </div>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary action-btn btn-view-tenant" data-tenant-id="${tenant.id}" data-property-id="${property.id}" title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn btn-delete-tenant" data-property-id="${property.id}" title="Retirer locataire">
                        <i class="bi bi-person-dash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    attachEventListeners();
}

// Fonction pour afficher les détails d'un locataire
function showTenantDetails(tenant, property) {
    const modalBody = document.getElementById('tenant-details-content');
    const propertyType = property.detail === 'apartment' ? 'Appartement' : 'Maison';

    const html = `
        <div class="row">
            <div class="col-md-6 mb-4">
                <h6 class="fw-bold text-primary"><i class="bi bi-person me-2"></i> Informations du locataire</h6>
                <p><strong>Nom :</strong> ${tenant.username}</p>
                <p><strong>Email :</strong> ${tenant.email}</p>
                <p><strong>Téléphone :</strong> ${tenant.phone || 'Non renseigné'}</p>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold text-primary"><i class="bi bi-house-door me-2"></i> Bien loué</h6>
                <p><strong>Type :</strong> ${propertyType}</p>
                <p><strong>Adresse :</strong> ${property.address}, ${property.city}</p>
                <p><strong>Surface :</strong> ${property.surface} m²</p>
                <p><strong>Loyer mensuel :</strong> ${property.rent} €</p>
            </div>
        </div>
    `;

    modalBody.innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('tenantDetailsModal'));
    modal.show();
}

// Fonction pour attacher les gestionnaires d'événements
function attachEventListeners() {
    document.querySelectorAll('.btn-view-tenant').forEach(button => {
        button.addEventListener('click', async () => {
            const tenantId = button.getAttribute('data-tenant-id');
            const propertyId = button.getAttribute('data-property-id');
            try {
                const property = await apiCall(`/api/property/getInfos/${propertyId}`);
                showTenantDetails(property.tenant, property);
            } catch (error) {
                console.error('Erreur:', error);
                alert('Impossible de charger les détails du locataire : ' + (error.message || 'Erreur inconnue'));
            }
        });
    });

    document.querySelectorAll('.btn-delete-tenant').forEach(button => {
        button.addEventListener('click', async () => {
            const propertyId = button.getAttribute('data-property-id');
            if (confirm('Êtes-vous sûr de vouloir retirer ce locataire de la propriété ?')) {
                try {
                    await removeTenantFromProperty(propertyId);
                    initTenantsPage(); // Rafraîchir la liste
                } catch (error) {
                    alert('Erreur lors du retrait du locataire : ' + (error.message || 'Erreur inconnue'));
                }
            }
        });
    });

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

// Initialisation de la page
async function initTenantsPage() {
    console.log('Début de initTenantsPage');

    if (!isLoggedIn()) {
        console.log('Non connecté - Redirection');
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        console.log('Utilisateur introuvable - Déconnexion');
        logout();
        return;
    }

    if (!hasRole('owner')) {
        console.log('Non propriétaire - Redirection');
        alert('Accès réservé aux propriétaires.');
        window.location.href = 'dashboard.html';
        return;
    }

    console.log('Utilisateur:', user.email);
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-role').textContent = 'Propriétaire';

    checkTokenExpiration();

    try {
        const tenantsWithProperties = await fetchTenantsFromProperties();
        displayTenants(tenantsWithProperties);
    } catch (error) {
        console.error('Erreur dans initTenantsPage:', error);
    }
}

// Gestion des événements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé');
    initTenantsPage();
});