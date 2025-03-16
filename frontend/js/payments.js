// payments.js

// Fonctions utilitaires importées depuis auth.js (assumées disponibles)
function getToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

function isLoggedIn() {
    return !!getToken();
}

// Charger les données des paiements pour un propriétaire
async function loadOwnerPayments() {
    try {
        // Récupérer les propriétés du propriétaire
        const propertiesResponse = await fetch('/api/property/getMyProperties', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!propertiesResponse.ok) {
            throw new Error(`Erreur lors du chargement des propriétés: ${propertiesResponse.status}`);
        }
        const properties = await propertiesResponse.json();

        // Récupérer tous les paiements liés aux propriétés
        const paymentsResponse = await fetch('/api/user/myPayments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentsResponse.ok) {
            throw new Error(`Erreur lors du chargement des paiements: ${paymentsResponse.status}`);
        }
        const payments = await paymentsResponse.json();

        // Afficher les statistiques
        displayPaymentStats(payments);

        // Afficher les paiements dans le tableau
        displayPaymentsTable(payments, properties);

    } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
        const tableBody = document.getElementById('payments-table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Erreur: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Afficher les statistiques des paiements
function displayPaymentStats(payments) {
    const totalRent = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalRent - paidAmount;

    document.getElementById('total-rent').textContent = `${totalRent.toFixed(2)} €`;
    document.getElementById('paid-amount').textContent = `${paidAmount.toFixed(2)} €`;
    document.getElementById('pending-amount').textContent = `${pendingAmount.toFixed(2)} €`;
}

// Afficher les paiements dans le tableau
function displayPaymentsTable(payments, properties) {
    const tableBody = document.getElementById('payments-table-body');
    tableBody.innerHTML = ''; // Vider le tableau

    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucun paiement trouvé</td></tr>';
        return;
    }

    const userId = getCurrentUser().userId;

    payments.forEach(payment => {
        const property = properties.find(p => p.tenant.id === payment.tenantId) || {};
        const tenantName = property.tenant?.username || 'Inconnu';
        const propertyName = property.address ? `${property.address}, ${property.city}` : 'Inconnu';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>RENT-${payment.id.toString().padStart(6, '0')}</td>
            <td>${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
            <td>${tenantName}</td>
            <td>${propertyName}</td>
            <td>${payment.amount.toFixed(2)} €</td>
            <td>
                <span class="badge ${getStatusClass(payment.status)}">
                    ${formatStatus(payment.status)}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="Détails"><i class="bi bi-file-text"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" title="Envoyer rappel"><i class="bi bi-envelope"></i></button>
                    ${payment.status !== 'paid' ? '<button class="btn btn-sm btn-outline-success mark-paid-btn" data-payment-id="' + payment.id + '" title="Marquer comme payé"><i class="bi bi-check-circle"></i></button>' : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Ajouter des écouteurs pour "Marquer comme payé"
    document.querySelectorAll('.mark-paid-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const paymentId = e.target.closest('button').dataset.paymentId;
            await markPaymentAsPaid(paymentId);
        });
    });
}

// Formatter le statut pour l'affichage
function formatStatus(status) {
    switch (status) {
        case 'paid': return 'Payé';
        case 'due': return 'En retard';
        case 'incoming': return 'En attente';
        default: return 'Inconnu';
    }
}

// Obtenir la classe Bootstrap pour le statut
function getStatusClass(status) {
    switch (status) {
        case 'paid': return 'bg-success';
        case 'due': return 'bg-danger';
        case 'incoming': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// Marquer un paiement comme payé
async function markPaymentAsPaid(paymentId) {
    try {
        const response = await fetch(`/api/user/recordPayment/${paymentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paidDate: new Date().toISOString() })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du paiement');
        }

        await loadOwnerPayments(); // Recharger les données
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de marquer le paiement comme payé');
    }
}

// Gérer l'enregistrement d'un nouveau paiement
async function savePayment() {
    const form = document.getElementById('add-payment-form');
    const tenant = form.querySelector('#payment-tenant').value;
    const propertyId = form.querySelector('#payment-property').value;
    const amount = parseFloat(form.querySelector('#payment-amount').value);
    const paidDate = form.querySelector('#payment-date').value;
    const method = form.querySelector('#payment-method').value;
    const notes = form.querySelector('#payment-notes').value;

    if (!tenant || !propertyId || !amount || !paidDate || !method) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        const response = await fetch('/api/user/myPayments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                propertyId,
                amount,
                dueDate: new Date(paidDate).toISOString(), // Simplification, ajuster si nécessaire
                tenantId: tenant, // Suppose que tenant est l'ID ici
                paidDate: new Date(paidDate).toISOString(),
                paymentMethod: method,
                notes
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l’enregistrement du paiement');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('addPaymentModal'));
        modal.hide();
        await loadOwnerPayments(); // Recharger les données
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l’enregistrement du paiement');
    }
}

// Initialisation de la page
async function initPaymentsPage() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-role').textContent = user.role === 'owner' ? 'Propriétaire' : 'Locataire';
    }

    if (user.role === 'owner') {
        await loadOwnerPayments();

        // Gérer le bouton "Enregistrer" du modal
        document.getElementById('save-payment-btn').addEventListener('click', savePayment);

        // Bouton de déconnexion
        document.getElementById('logout-btn').addEventListener('click', () => {
            logout(); // Fonction assumée dans auth.js
        });
    } else {
        // Rediriger ou afficher un message pour les locataires
        document.querySelector('.container').innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Cette page est réservée aux propriétaires.
            </div>
        `;
    }
}

// Lancer l'initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initPaymentsPage);