'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import AuthCheck from '@/components/AuthCheck';
import { getCurrentUser } from '@/lib/auth';
import { apiCall } from '@/lib/api';

export default function PaymentsPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        paidAmount: 0,
        pendingAmount: 0,
        dueAmount: 0,
        dueCount: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentDetails] = useState({
        iban: 'FR76 1234 5678 9101 1121 3141 516',
        bic: 'AGRIFPPP123',
        owner: 'owner',
    });
    const [showIbanModal, setShowIbanModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const initPaymentsPage = async () => {
            try {
                setIsLoading(true);
                const currentUser = getCurrentUser();

                if (!currentUser) {
                    router.push('/connexion');
                    return;
                }

                setUser(currentUser);

                // Charger les paiements
                const paymentsData = await apiCall('/api/user/myPayments');
                setPayments(paymentsData);

                // Calculer les statistiques en fonction du rôle
                if (currentUser.role === 'owner') {
                    calculateOwnerStats(paymentsData);
                } else if (currentUser.role === 'tenant') {
                    calculateTenantStats(paymentsData);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des paiements:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initPaymentsPage();
    }, [router]);

    const calculateOwnerStats = (paymentsData) => {
        const paidAmount = paymentsData
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);

        const pendingAmount = paymentsData
            .filter(payment => payment.status === 'incoming')
            .reduce((sum, payment) => sum + payment.amount, 0);

        const dueAmount = paymentsData
            .filter(payment => payment.status === 'due')
            .reduce((sum, payment) => sum + payment.amount, 0);

        setStats({
            paidAmount,
            pendingAmount,
            dueAmount,
            dueCount: 0
        });
    };

    const calculateTenantStats = (paymentsData) => {
        const duePayments = paymentsData.filter(payment => payment.status === 'due');
        const dueAmount = duePayments.reduce((sum, payment) => sum + payment.amount, 0);

        setStats({
            paidAmount: 0,
            pendingAmount: 0,
            dueAmount,
            dueCount: duePayments.length
        });
    };

    const recordPayment = async (paymentId) => {
        try {
            await apiCall(`/api/user/recordPayment/${paymentId}`, 'PATCH');

            // Recharger les paiements après la mise à jour
            const updatedPayments = await apiCall('/api/user/myPayments');
            setPayments(updatedPayments);

            // Recalculer les statistiques
            if (user.role === 'owner') {
                calculateOwnerStats(updatedPayments);
            } else {
                console.log("impossible");
                calculateTenantStats(updatedPayments);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const formatReference = (paymentId, tenantName) => {
        if (!paymentId || !tenantName) return 'REF-UNKNOWN';

        const nameParts = tenantName.trim().split(' ');
        const lastName = nameParts[nameParts.length - 1].toUpperCase();
        const formattedId = String(paymentId).padStart(5, '0');

        return `REF-${lastName}-${formattedId}`;
    };

    const closeAllModals = () => {
        setShowIbanModal(false);
    };

    return (
        <AuthCheck>
            <PageContainer>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="ml-3 text-gray-600">Chargement des paiements...</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <h1 className="text-3xl font-bold border-b border-blue-500 pb-4">Mes Paiements</h1>

                        {/* Section propriétaire */}
                        {user?.role === 'owner' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-500 rounded-xl p-6 text-white">
                                    <div className="flex justify-center mb-4">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg text-center opacity-90">Paiements reçus</h3>
                                    <p className="text-3xl font-bold text-center mt-2">{stats.paidAmount.toFixed(2)} €</p>
                                </div>

                                <div className="bg-yellow-500 rounded-xl p-6 text-white">
                                    <div className="flex justify-center mb-4">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg text-center opacity-90">En attente</h3>
                                    <p className="text-3xl font-bold text-center mt-2">{stats.pendingAmount.toFixed(2)} €</p>
                                </div>

                                <div className="bg-red-500 rounded-xl p-6 text-white">
                                    <div className="flex justify-center mb-4">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg text-center opacity-90">En retard</h3>
                                    <p className="text-3xl font-bold text-center mt-2">{stats.dueAmount.toFixed(2)} €</p>
                                </div>
                            </div>
                        )}

                        {/* Section locataire */}
                        {user?.role === 'tenant' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <h2 className="text-xl font-semibold ml-2">Mes statistiques de paiement</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-600">Factures à payer</p>
                                            <p className="text-2xl font-bold mt-1">{stats.dueCount}</p>
                                        </div>

                                        <div className="bg-red-50 rounded-lg p-4">
                                            <p className="text-gray-600">Montant total à payer</p>
                                            <p className="text-2xl font-bold text-red-600 mt-1">{stats.dueAmount.toFixed(2)} €</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <h2 className="text-xl font-semibold ml-2">Coordonnées bancaires</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Pour effectuer votre paiement</p>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-600 mb-1">IBAN</p>
                                            <p className="font-mono bg-gray-50 p-3 rounded-lg">{payments[0].paymentOwner.iban}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 mb-1">BIC</p>
                                            <p className="font-mono bg-gray-50 p-3 rounded-lg">{payments[0].paymentOwner.bic}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 mb-1">Titulaire</p>
                                            <p className="font-mono bg-gray-50 p-3 rounded-lg">{payments[0].paymentOwner.username}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tableau des paiements */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {user?.role === 'tenant' ? 'Historique des paiements' : 'Liste des paiements'}
                                    </h2>
                                </div>
                                <button className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {user?.role === 'tenant' ? 'Télécharger' : 'Exporter'}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'échéance</th>
                                            {user?.role === 'owner' && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locataire</th>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bien</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.map((payment) => {
                                            const statusConfig = {
                                                paid: { class: 'bg-green-100 text-green-800', text: 'Payé' },
                                                due: { class: 'bg-red-100 text-red-800', text: 'En retard' },
                                                incoming: { class: 'bg-yellow-100 text-yellow-800', text: 'À venir' }
                                            };

                                            const status = statusConfig[payment.status];
                                            console.log(payment);
                                            return (
                                                <tr key={payment.id} className={payment.status === 'due' ? 'bg-red-50' : ''}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {formatReference(payment.id, payment.paymentTenant?.username)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(payment.dueDate)}
                                                    </td>
                                                    {user?.role === 'owner' && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.paymentTenant?.username || 'N/A'}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.paymentProperty?.address || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {payment.amount.toFixed(2)} €
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.class}`}>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        {payment.status == 'paid' ? (
                                                            <span className="inline-flex items-center text-green-600">
                                                                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Payé
                                                            </span>
                                                        ) : user?.role === 'owner' ? (
                                                            <button
                                                                onClick={() => recordPayment(payment.id)}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Marquer comme payé
                                                            </button>
                                                        ) : user?.role === 'tenant' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setShowIbanModal(true);
                                                                    setSelectedPayment(payment);
                                                                }}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Payer
                                                            </button>
                                                        ) : console.log("but who are you??")}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-white px-4 py-3 flex items-center justify-center border-t">
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        Précédent
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-600 text-sm font-medium text-white">
                                        1
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        2
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        3
                                    </button>
                                    <button className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        Suivant
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Bank account and paymentinfos */}
                {showIbanModal && (
                    <>
                        <div className="fixed inset-0 bg-white/80 z-40" onClick={closeAllModals}></div>
                        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-full max-w-md mx-4 shadow-lg z-50 space-y-6">
                            {/* En-tête avec icône, titre et bouton de fermeture */}
                            <div className="flex items-center p-4 border-b">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-blue-600 flex-1">Payer une facture</h2>
                                <button
                                    onClick={() => setShowIbanModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Section coordonnées bancaires */}
                            <div className="p-4 border-b">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-100 p-1 rounded mr-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-blue-600">Coordonnées bancaires</h3>
                                </div>

                                <div className="mb-3 flex">
                                    <div className="w-1/4">
                                        <span className="text-blue-600 font-medium">IBAN</span>
                                    </div>
                                    <div className="w-3/4">
                                        <span className="font-mono">{selectedPayment.paymentOwner.iban || "FR76 1234 5678 9101 1121 3141 516"}</span>
                                    </div>
                                </div>

                                <div className="mb-3 flex">
                                    <div className="w-1/4">
                                        <span className="text-blue-600 font-medium">BIC</span>
                                    </div>
                                    <div className="w-3/4">
                                        <span className="font-mono">{selectedPayment.paymentOwner.bic || "AGRIPPPP123"}</span>
                                    </div>
                                </div>

                                <div className="mb-1 flex">
                                    <div className="w-1/4">
                                        <span className="text-blue-600 font-medium">Titulaire</span>
                                    </div>
                                    <div className="w-3/4">
                                        <span>{selectedPayment.paymentOwner.owner || "owner"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section détails du paiement */}
                            <div className="p-4 border-b">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-100 p-1 rounded mr-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-blue-600">Détails du paiement</h3>
                                </div>

                                <div className="mb-3 flex">
                                    <div className="w-1/3">
                                        <span className="text-gray-700">Référence :</span>
                                    </div>
                                    <div className="w-2/3 text-right">
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">{formatReference(selectedPayment.id, selectedPayment.paymentTenant?.username)}</span>
                                    </div>
                                </div>

                                <div className="mb-1 flex">
                                    <div className="w-1/3">
                                        <span className="text-gray-700">Montant à payer :</span>
                                    </div>
                                    <div className="w-2/3 text-right">
                                        <span className="text-red-500 font-bold text-xl">{selectedPayment.amount} €</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section instructions */}
                            <div className="p-4 mx-4 mb-4 bg-blue-50 rounded-lg">
                                <div className="flex">
                                    <div className="mr-2 mt-1">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-bold text-blue-600">Instructions : </span>
                                        <span className="text-blue-600">Effectuez un virement avec la référence ci-dessus pour valider votre paiement. Une fois le paiement reçu, le statut sera mis à jour.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton fermer */}
                            <div className="p-4 flex justify-center">
                                <button
                                    onClick={() => setShowIbanModal(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-md flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </PageContainer>
        </AuthCheck >
    );
}