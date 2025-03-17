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
            .filter(payment => payment.status == "incoming")
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
                        `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Payé</span>`
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
            // Ajout des coordonnées bancaires du propriétaire (à compléter avec l'API réelle)
            // Idéalement ces informations devraient venir de l'API
            document.getElementById('owner-iban').textContent = nextPayment.paymentOwner?.iban || 'FR76 1234 5678 9101 1121 3141 516';
            document.getElementById('owner-bic').textContent = nextPayment.paymentOwner?.bic || 'AGRIFPPP123';
            document.getElementById('owner-name').textContent = nextPayment.paymentOwner?.bankAccountName || nextPayment.paymentOwner?.username || 'SCI EXEMPLE';
//            document.getElementById('payment-reference').textContent = nextPayment.reference || `REF-${nextPayment.id}`;
        }

        // Calcul des statistiques
        const dueCounter = payments.filter(pay => pay.status === "due").length;
        const dueAmount = payments
            .filter(payment => payment.status === "due")
            .reduce((sum, payment) => sum + payment.amount, 0);

        // Mise à jour des statistiques
        document.getElementById('tenant-due-count').textContent = dueCounter;
        document.getElementById('tenant-due-amount').textContent = `${dueAmount.toFixed(2)} €`;

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

                // Créer les cellules de la ligne
                row.innerHTML = `
                    <td class="ps-4">${payment.id}</td>
                    <td class="payment-date">${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>${payment.paymentProperty.address || 'N/A'}</td>
                    <td class="payment-amount">${payment.amount.toFixed(2)} €</td>
                    <td class="">
                        <span class="badge ${statusClass} badge-status">
                            ${statusText}
                        </span>
                    </td>
                    <td class="pe-4"></td> <!-- Placeholder pour la colonne Actions -->
                `;

                // Créer le contenu de la dernière cellule (Actions)
                const actionCell = row.querySelector('td:last-child');
                if (payment.status !== 'paid') {
                    // Créer le bouton "Payer"
                    const button = document.createElement('button');
                    button.className = 'btn btn-sm btn-primary action-btn';
                    button.setAttribute('data-payment-id', payment.id);
                    button.innerHTML = `<i class="bi bi-check2-circle me-1"></i>Payer`;

                    // Ajouter l'écouteur d'événement directement au bouton
                    button.addEventListener('click', () => {
                        const paymentId = button.getAttribute('data-payment-id');
                        const row = button.closest('tr');
                        const amount = row.querySelector('.payment-amount').textContent.replace(' €', '');
                        preparePaymentModal(paymentId, amount);
                    });

                    // Ajouter le bouton à la cellule
                    actionCell.appendChild(button);
                } else {
                    // Ajouter le texte "Complet" si le paiement est déjà effectué
                    const completeSpan = document.createElement('span');
                    completeSpan.className = 'text-success';
                    completeSpan.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>Complet`;
                    actionCell.appendChild(completeSpan);
                }

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

// Fonction pour préparer et ouvrir la modale
function preparePaymentModal(paymentId, amount) {
    // Remplir les champs de la modale avec les données du paiement
    document.getElementById('modal-payment-reference').textContent = formatReference(paymentId);
    document.getElementById('modal-payment-amount').textContent = `${amount} €`;

    // Copier les coordonnées bancaires depuis la section existante
    document.getElementById('modal-owner-iban').textContent = document.getElementById('owner-iban').textContent;
    document.getElementById('modal-owner-bic').textContent = document.getElementById('owner-bic').textContent;
    document.getElementById('modal-owner-name').textContent = document.getElementById('owner-name').textContent;

    // Ouvrir la modale
    const payModal = new bootstrap.Modal(document.getElementById('payInvoiceModal'));
    payModal.show();
}

function formatReference(paymentId) {
    const tenantName = getCurrentUser().username;

    // Vérifier que les arguments sont valides
    if (!paymentId || !tenantName || typeof tenantName !== 'string') {
        console.log(paymentId);
        console.log(tenantName);
        throw new Error(`Impossible de générer la référence.`);
    }

    // Extraire le nom de famille (dernier mot du nom complet)
    const nameParts = tenantName.trim().split(' ');
    const lastName = nameParts[nameParts.length - 1].toUpperCase();

    // Formater l'ID avec 5 chiffres (zéros à gauche)
    const formattedId = String(paymentId).padStart(5, '0');

    // Construire la référence
    return `REF-${lastName}-${formattedId}`;
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

}

// Gestion des événements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé');
    initPaymentsPage();
});