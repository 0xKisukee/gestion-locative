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
        const paidAmount = payments
            .filter(payment => payment.status == "paid")
            .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = payments
            .filter(payment => payment.status == "pending")
            .reduce((sum, payment) => sum + payment.amount, 0);
        const dueAmount = payments
            .filter(payment => payment.status == "due")
            .reduce((sum, payment) => sum + payment.amount, 0);

        document.getElementById('paid-amount').textContent = `${paidAmount.toFixed(2)} €`;
        document.getElementById('pending-amount').textContent = `${pendingAmount.toFixed(2)} €`;
        document.getElementById('due-amount').textContent = `${dueAmount.toFixed(2)} €`;

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

                // Ajout de classe pour les lignes en retard pour attirer l'attention
                if (payment.status === 'due') {
                    row.classList.add('table-danger');
                }

                row.innerHTML = `
                    <td class="ps-4 payment-reference">${payment.id}</td>
                    <td class="payment-date">${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>${payment.paymentTenant.username || 'N/A'}</td>
                    <td>${payment.paymentProperty.address || 'N/A'}</td>
                    <td class="payment-amount">${payment.amount.toFixed(2)} €</td>
                    <td>
                        <span class="badge ${statusClass} badge-status">
                            ${statusText}
                        </span>
                    </td>
                    <td class="text-end pe-4">
                        ${payment.status !== 'paid' ?
                        `<button class="btn btn-sm btn-primary action-btn record-payment-btn" data-payment-id="${payment.id}">
                                <i class="bi bi-check2-circle me-1"></i>Marquer comme payé
                            </button>` :
                        `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Complet</span>`
                    }
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
        const nextPayment = payments.find(payment => !payment.isPaid && payment.status !== 'paid');

        if (nextPayment) {
            // Mise à jour des dates du prochain paiement
            const formattedDate = new Date(nextPayment.dueDate).toLocaleDateString('fr-FR');
            document.getElementById('next-payment-date').textContent = formattedDate;
            document.getElementById('next-payment-date-alert').textContent = formattedDate;
            document.getElementById('next-payment-amount').textContent = `${nextPayment.amount.toFixed(2)} €`;

            // Ajout des coordonnées bancaires du propriétaire (à compléter avec l'API réelle)
            // Idéalement ces informations devraient venir de l'API
            document.getElementById('owner-iban').textContent = nextPayment.paymentOwner?.iban || 'FR76 1234 5678 9101 1121 3141 516';
            document.getElementById('owner-bic').textContent = nextPayment.paymentOwner?.bic || 'AGRIFPPP123';
            document.getElementById('owner-name').textContent = nextPayment.paymentOwner?.bankAccountName || nextPayment.paymentOwner?.username || 'SCI EXEMPLE';
            document.getElementById('payment-reference').textContent = nextPayment.reference || `REF-${nextPayment.id}`;
        }

        // Calcul des statistiques
        const paidCounter = payments.filter(payment => payment.status === "paid").length;
        const pendingCounter = payments.filter(pay => pay.status === "due").length;
        const pendingAmount = payments
            .filter(payment => payment.status === "due")
            .reduce((sum, payment) => sum + payment.amount, 0);

        // Mise à jour des statistiques
        document.getElementById('tenant-paid-count').textContent = paidCounter;
        document.getElementById('tenant-pending-count').textContent = pendingCounter;
        document.getElementById('tenant-pending-amount').textContent = `${pendingAmount.toFixed(2)} €`;

        // Remplir le tableau des paiements
        const tableBody = document.getElementById('tenant-payments-table-body');
        tableBody.innerHTML = '';

        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun paiement trouvé.</td></tr>';
        } else {
            payments.forEach(payment => {
                const statusClass = payment.status === 'paid' ? 'bg-success' : payment.status === 'due' ? 'bg-danger' : 'bg-warning';
                const statusText = payment.status === 'paid' ? 'Payé' : payment.status === 'due' ? 'En retard' : 'À venir';
                const row = document.createElement('tr');

                // Ajout de classe pour les lignes en retard pour attirer l'attention
                if (payment.status === 'due') {
                    row.classList.add('table-danger');
                }

                row.innerHTML = `
                    <td class="ps-4 payment-reference">${payment.id}</td>
                    <td class="payment-date">${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>${payment.paymentOwner.username || 'N/A'}</td>
                    <td>${payment.paymentProperty.address || 'N/A'}</td>
                    <td class="payment-amount">${payment.amount.toFixed(2)} €</td>
                    <td class="pe-4">
                        <span class="badge ${statusClass} badge-status">
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
            <tr><td colspan="6" class="text-center text-danger">Erreur: ${error.message}</td></tr>
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

        // Remplacer l'alerte par une notification plus moderne
        showNotification('Paiement marqué comme payé avec succès !', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur: ' + error.message, 'danger');
    }
}

// Fonction pour afficher une notification
function showNotification(message, type = 'info') {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.borderRadius = '8px';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.3s ease';

    // Icône basée sur le type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${icon}-fill me-2"></i>
            <div>${message}</div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Ajouter au body
    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Fermeture automatique après 5 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);

    // Fermeture manuelle
    notification.querySelector('.btn-close').addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
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

    // Ajout du gestionnaire de recherche s'il existe
    const searchInput = document.querySelector('input[placeholder="Rechercher..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('#owner-payments-table-body tr');

            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', initPaymentsPage);