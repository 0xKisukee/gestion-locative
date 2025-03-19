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
            <div className="card bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-white/20 p-4">
                  <i className="bi bi-house-door text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Bienvenue, {user?.username || 'Utilisateur'}</h2>
                  <p className="text-white/90">
                    Vous êtes connecté en tant que {user?.role === 'owner' ? 'propriétaire' : 'locataire'}
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Section */}
            {user?.role === 'owner' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Properties Card */}
                  <div className="feature-card">
                    <div className="feature-icon feature-icon-house">
                      <i className="bi bi-house-door text-blue-600 text-xl"></i>
                    </div>
                    <h3 className="feature-title">Mes biens</h3>
                    <p className="text-3xl font-bold text-blue-600 my-4">{dashboardData.properties}</p>
                    <p className="feature-description mb-4">Propriétés en gestion</p>
                    <Link href="/properties" className="btn-primary w-full">
                      <i className="bi bi-gear"></i> Gérer mes biens
                    </Link>
                  </div>

                  {/* Tenants Card */}
                  <div className="feature-card">
                    <div className="feature-icon feature-icon-users">
                      <i className="bi bi-people text-green-600 text-xl"></i>
                    </div>
                    <h3 className="feature-title">Mes locataires</h3>
                    <p className="text-3xl font-bold text-green-600 my-4">{dashboardData.tenants}</p>
                    <p className="feature-description mb-4">Locataires actifs</p>
                    <Link href="/locataires" className="btn-success w-full">
                      <i className="bi bi-person-vcard"></i> Voir la liste
                    </Link>
                  </div>

                  {/* Payments Card */}
                  <div className="feature-card">
                    <div className="feature-icon feature-icon-money">
                      <i className="bi bi-receipt text-yellow-600 text-xl"></i>
                    </div>
                    <h3 className="feature-title">Mes paiements</h3>
                    <p className="text-3xl font-bold text-yellow-600 my-4">{dashboardData.duePayments}</p>
                    <p className="feature-description mb-4">Paiements en retard</p>
                    <Link href="/paiements" className="btn-primary w-full">
                      <i className="bi bi-cash-coin"></i> Gérer les paiements
                    </Link>
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    <i className="bi bi-graph-up text-blue-600 mr-2"></i> Statistiques clés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <i className="bi bi-cash text-blue-600"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenu mensuel</p>
                          <p className="text-lg font-bold text-blue-600">{dashboardData.stats.monthlyRevenue} €</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <i className="bi bi-piggy-bank text-green-600"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenu potentiel</p>
                          <p className="text-lg font-bold text-green-600">{dashboardData.stats.potentialRevenue} €</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <i className="bi bi-houses text-yellow-600"></i>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Biens inoccupés</p>
                          <p className="text-lg font-bold text-yellow-600">{dashboardData.stats.freeProperties}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <i className="bi bi-exclamation-circle text-red-600"></i>
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
            )}

            {/* Tenant Section */}
            {user?.role === 'tenant' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Info */}
                <div className="card">
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
                <div className="card">
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
                    <Link href="/paiements" className="btn-primary">
                      <i className="bi bi-receipt"></i> Voir l'historique des paiements
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