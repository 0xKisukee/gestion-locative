'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import AuthCheck from '@/components/AuthCheck';
import { getCurrentUser } from '@/lib/auth';
import { apiCall } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    properties: 0,
    tenants: 0,
    duePayments: 0,
    stats: {
      monthlyRevenue: 0,
      potentialRevenue: 0,
      freeProperties: 0,
      unpaidAmount: 0
    },
    property: null,
    nextPayment: {
      date: null,
      amount: 0
    },
    paymentStatus: 'à jour'
  });
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setIsLoading(true);
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          router.push('/connexion');
          return;
        }
        
        setUser(currentUser);
        
        // Charger les données du tableau de bord en fonction du rôle de l'utilisateur
        if (currentUser.role === 'owner') {
          await loadOwnerDashboard();
        } else if (currentUser.role === 'tenant') {
          await loadTenantDashboard();
        }
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const loadOwnerDashboard = async () => {
    try {
      // Récupérer les propriétés
      const properties = await apiCall('/api/property/getMyProperties');
      
      // Récupérer les paiements
      const payments = await apiCall('/api/user/myPayments');
      
      // Calculer les statistiques
      const propertiesWithTenants = properties.filter(prop => prop.status === 'rented');
      const duePayments = payments.filter(pay => pay.status === 'due');
      
      // Revenu mensuel (loyers des biens occupés)
      const monthlyRevenue = propertiesWithTenants.reduce((sum, prop) => (sum + prop.rent), 0);
      
      // Revenu potentiel (tous les loyers)
      const potentialRevenue = properties.reduce((sum, prop) => (sum + prop.rent), 0);
      
      // Propriétés inoccupées
      const freeProperties = properties.filter(prop => prop.status === 'free').length;
      
      // Total impayés
      const unpaidAmount = duePayments.reduce((sum, pay) => (sum + pay.amount), 0);
      
      setDashboardData({
        properties: properties.length,
        tenants: propertiesWithTenants.length,
        duePayments: duePayments.length,
        stats: {
          monthlyRevenue,
          potentialRevenue,
          freeProperties,
          unpaidAmount
        }
      });
      
      // Charger les tickets (pour l'exemple, pourrait être implémenté plus tard)
      // await generateOwnerTickets();
    } catch (error) {
      console.error('Erreur lors du chargement des données propriétaire:', error);
    }
  };

  const loadTenantDashboard = async () => {
    try {
      // Récupérer les informations de la propriété du locataire
      const property = await apiCall('/api/user/myProperty');
      
      // Récupérer les paiements
      const payments = await apiCall('/api/user/myPayments');
      
      // Calculer les statistiques
      const duePaymentsCount = payments.filter(pay => pay.status === 'due').length;
      
      // Déterminer le statut de paiement
      let paymentStatus = 'à jour';
      if (duePaymentsCount === 1) {
        paymentStatus = 'en attente';
      } else if (duePaymentsCount > 1) {
        paymentStatus = 'à régulariser';
      }
      
      // Date du prochain paiement (exemple)
      const today = new Date();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setDashboardData({
        ...dashboardData,
        property,
        nextPayment: {
          date: lastDayOfMonth,
          amount: property ? property.rent : 0
        },
        paymentStatus
      });
      
      // Charger les tickets (pour l'exemple, pourrait être implémenté plus tard)
      // await generateTenantTickets();
    } catch (error) {
      console.error('Erreur lors du chargement des données locataire:', error);
    }
  };

  // Fonction pour animer les compteurs
  const animateValue = (start, end, duration) => {
    if (start === end) return end;
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    return end; // Simplifié pour Next.js (pas d'animation côté serveur)
  };

  return (
    <AuthCheck>
      <PageContainer>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Chargement du tableau de bord...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Bienvenue, {user?.username || 'owner'} !</h2>
                  <p className="text-gray-600">
                    Vous êtes connecté en tant que {user?.role === 'owner' ? 'propriétaire' : 'locataire'}. Voici un aperçu de votre situation.
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Dashboard */}
            {user?.role === 'owner' && (
              <>
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Properties Card */}
                  <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Mes biens</h3>
                      <p className="text-4xl font-bold text-blue-600 mb-2">{dashboardData.properties}</p>
                      <p className="text-gray-600 mb-4">Propriétés en gestion</p>
                      <Link href="/properties" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Gérer mes biens
                      </Link>
                    </div>
                  </div>

                  {/* Tenants Card */}
                  <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9 3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3 3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3 3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.536 5.536 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13v-1.75M0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9-.59.68-.95 1.62-.95 2.65V20H0m24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65 2.56.34 4.45 1.51 4.45 2.9V20Z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Mes locataires</h3>
                      <p className="text-4xl font-bold text-green-600 mb-2">{dashboardData.tenants}</p>
                      <p className="text-gray-600 mb-4">Locataires actifs</p>
                      <Link href="/tenants" className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Voir la liste
                      </Link>
                    </div>
                  </div>

                  {/* Payments Card */}
                  <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm12 4v2h3V7h-3zm-4 0v2h3V7h-3zM7 7v2h3V7H7zm8 4v2h3v-2h-3zm-4 0v2h3v-2h-3zm-4 0v2h3v-2H7zm8 4v2h3v-2h-3zm-4 0v2h3v-2h-3zm-4 0v2h3v-2H7z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Mes paiements</h3>
                      <p className="text-4xl font-bold text-yellow-600 mb-2">{dashboardData.duePayments}</p>
                      <p className="text-gray-600 mb-4">Paiements en retard</p>
                      <Link href="/payments" className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        Gérer les paiements
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tickets Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                      </svg>
                      <h2 className="text-xl font-semibold text-gray-900">Derniers tickets</h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">0</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600">Aucun ticket</p>
                    </div>
                    <div className="mt-4 text-center">
                      <Link href="/tickets" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Voir tous mes tickets
                      </Link>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      <h2 className="text-xl font-semibold text-gray-900">Statistiques clés</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenu mensuel</p>
                            <p className="text-lg font-bold text-blue-600">{dashboardData.stats.monthlyRevenue} €</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenu potentiel</p>
                            <p className="text-lg font-bold text-green-600">{dashboardData.stats.potentialRevenue} €</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Biens inoccupés</p>
                            <p className="text-lg font-bold text-blue-600">{dashboardData.stats.freeProperties}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Impayés totaux</p>
                            <p className="text-lg font-bold text-red-600">{dashboardData.stats.unpaidAmount} €</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tenant Dashboard */}
            {user?.role === 'tenant' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Info */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    <i className="bi bi-house-door text-blue-600 mr-2"></i> Mon logement
                  </h3>
                  {dashboardData.property ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <i className="bi bi-house-door text-2xl text-blue-600"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">
                            {dashboardData.property.detail === 'apartment' ? 'Appartement' : 'Maison'}
                          </h4>
                          <p className="text-gray-600">{dashboardData.property.address}, {dashboardData.property.city}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <i className="bi bi-rulers text-blue-600"></i>
                            <div>
                              <p className="text-sm text-gray-600">Surface</p>
                              <p className="font-semibold">{dashboardData.property.surface} m²</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <i className="bi bi-cash text-blue-600"></i>
                            <div>
                              <p className="text-sm text-gray-600">Loyer mensuel</p>
                              <p className="font-semibold">{dashboardData.property.rent} €</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
                      <i className="bi bi-info-circle mr-2"></i> Vous n'avez actuellement aucune location active.
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      <i className="bi bi-cash-coin text-blue-600 mr-2"></i> Mes paiements
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dashboardData.paymentStatus === 'à jour'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dashboardData.paymentStatus === 'à jour'
                        ? 'À jour'
                        : dashboardData.paymentStatus === 'en attente'
                          ? 'Paiement en attente'
                          : 'Situation à régulariser'
                      }
                    </span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex gap-4">
                      <i className="bi bi-calendar-event text-2xl text-blue-600"></i>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">Prochain loyer</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date d'échéance :</span>
                            <span className="font-medium">
                              {dashboardData.nextPayment.date
                                ? new Date(dashboardData.nextPayment.date).toLocaleDateString('fr-FR')
                                : '--'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Montant :</span>
                            <span className="font-medium text-blue-600">
                              {dashboardData.nextPayment.amount} €
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Link href="/paiements" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i className="bi bi-receipt mr-2"></i> Voir l'historique des paiements
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </AuthCheck>
  );
}