// Fonction pour obtenir le token d'authentification
function getToken() {
    return localStorage.getItem('token');
}

// Récupérer l'utilisateur courant depuis localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

// Charger les paiements pour un propriétaire
async function loadOwnerPayments() {
    try {
        const response = await fetch('/api/user/myPayments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur lors du chargement des paiements: ${response.status}`);
        }

        const payments = await response.json();

        // Calcul des statistiques
        const totalRent = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const paidAmount = payments
            .filter(payment => payment.isPaid)
            .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = totalRent - paidAmount;

        document.getElementById('total-rent').textContent = `${totalRent.toFixed(2)} €`;
        document.getElementById('paid-amount').textContent = `${paidAmount.toFixed(2)} €`;
        document.getElementById('pending-amount').textContent = `${pendingAmount.toFixed(2)} €`;

        // Remplir le tableau des paiements
        const tableBody = document.getElementById('owner-payments-table-body');
        tableBody.innerHTML = '';

        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun paiement trouvé.</td></tr>';
        } else {
            payments.forEach(payment => {
                const statusClass = payment.status === 'paid' ? 'bg-success' : payment.status === 'due' ? 'bg-danger' : 'bg-warning';
                const statusText = payment.status === 'paid' ? 'Payé' : payment.status === 'due' ? 'En retard' : 'À venir';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.id}</td>
                    <td>${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>${payment.paymentTenant?.username || 'N/A'}</td>
                    <td>${payment.property?.address || 'N/A'}</td>
                    <td>${payment.amount.toFixed(2)} €</td>
                    <td>
                        <span class="badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        ${payment.status !== 'paid' ? `<button class="btn btn-sm btn-primary record-payment-btn" data-payment-id="${payment.id}">Marquer comme payé</button>` : ''}
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Ajouter des listeners pour les boutons "Marquer comme payé"
            document.querySelectorAll('.record-payment-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const paymentId = button.getAttribute('data-payment-id');
                    await recordPayment(paymentId);
                    await loadOwnerPayments(); // Recharger les données après mise à jour
                });
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('owner-payments-table-body').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">Erreur: ${error.message}</td></tr>
        `;
    }
}

// Charger les paiements pour un locataire
async function loadTenantPayments() {
    try {
        const response = await fetch('/api/user/myPayments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur lors du chargement des paiements: ${response.status}`);
        }

        const payments = await response.json();

        // Trouver le prochain paiement non payé
        const nextPayment = payments.find(payment => !payment.isPaid);
        document.getElementById('next-payment-date').textContent = nextPayment
            ? new Date(nextPayment.dueDate).toLocaleDateString('fr-FR')
            : '--';
        document.getElementById('next-payment-amount').textContent = nextPayment
            ? `${nextPayment.amount.toFixed(2)} €`
            : '-- €';
        document.getElementById('payment-status').textContent = nextPayment
            ? (nextPayment.status === 'due' ? 'En retard' : 'À venir')
            : 'À jour';

        // Calcul des statistiques
        const paidAmount = payments
            .filter(payment => payment.isPaid)
            .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = payments
            .filter(payment => !payment.isPaid)
            .reduce((sum, payment) => sum + payment.amount, 0);

        document.getElementById('tenant-paid-amount').textContent = `${paidAmount.toFixed(2)} €`;
        document.getElementById('tenant-pending-amount').textContent = `${pendingAmount.toFixed(2)} €`;

        // Remplir le tableau des paiements
        const tableBody = document.getElementById('tenant-payments-table-body');
        tableBody.innerHTML = '';

        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun paiement trouvé.</td></tr>';
        } else {
            payments.forEach(payment => {
                const statusClass = payment.status === 'paid' ? 'bg-success' : payment.status === 'due' ? 'bg-danger' : 'bg-warning';
                const statusText = payment.status === 'paid' ? 'Payé' : payment.status === 'due' ? 'En retard' : 'À venir';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.id}</td>
                    <td>${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>${payment.property?.address || 'N/A'}</td>
                    <td>${payment.amount.toFixed(2)} €</td>
                    <td>
                        <span class="badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('tenant-payments-table-body').innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">Erreur: ${error.message}</td></tr>
        `;
    }
}

// Enregistrer un paiement (pour les propriétaires uniquement)
async function recordPayment(paymentId) {
    try {
        const response = await fetch(`/api/user/recordPayment/${paymentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'enregistrement du paiement');
        }

        alert('Paiement marqué comme payé avec succès !');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
}

// Initialisation de la page
async function initPaymentsPage() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Mettre à jour l'en-tête
    document.getElementById('user-email').textContent = user.email;
    const roleDisplay = user.role === 'owner' ? 'Propriétaire' : 'Locataire';
    document.getElementById('user-role').textContent = roleDisplay;

    // Afficher la section appropriée
    if (user.role === 'owner') {
        document.getElementById('owner-payments-section').classList.remove('d-none');
        document.getElementById('tenant-payments-section').classList.add('d-none');
        await loadOwnerPayments();
    } else if (user.role === 'tenant') {
        document.getElementById('tenant-payments-section').classList.remove('d-none');
        document.getElementById('owner-payments-section').classList.add('d-none');
        await loadTenantPayments();
    } else {
        // Gestion des rôles non autorisés
        document.body.innerHTML = '<div class="alert alert-danger">Rôle non autorisé pour cette page.</div>';
    }

    // Gestion de la déconnexion
    document.getElementById('logout-btn').addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

document.addEventListener('DOMContentLoaded', initPaymentsPage);