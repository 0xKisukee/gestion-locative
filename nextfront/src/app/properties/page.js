'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import AuthCheck from '@/components/AuthCheck';
import { apiCall } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [assignData, setAssignData] = useState({
    tenantId: '',
    startDate: ''
  });
  const [formData, setFormData] = useState({
    detail: '',
    surface: '',
    address: '',
    city: '',
    rent: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiCall('/api/property/getMyProperties');
      setProperties(data);
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
      setError(error.message || 'Impossible de charger vos biens.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const newProperty = {
        detail: formData.detail,
        surface: parseFloat(formData.surface),
        address: formData.address,
        city: formData.city,
        rent: parseFloat(formData.rent)
      };
      
      await apiCall('/api/property/create', 'POST', newProperty);
      
      // Réinitialiser le formulaire
      setFormData({
        detail: '',
        surface: '',
        address: '',
        city: '',
        rent: ''
      });
      
      // Fermer le modal
      setShowAddModal(false);
      
      // Rafraîchir la liste des propriétés
      fetchProperties();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la propriété:', error);
      alert('Erreur lors de l\'ajout: ' + (error.message || 'Veuillez réessayer.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProperty = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const updatedProperty = {
        detail: formData.detail,
        surface: parseFloat(formData.surface),
        address: formData.address,
        city: formData.city,
        rent: parseFloat(formData.rent)
      };
      
      await apiCall(`/api/property/update/${selectedProperty.id}`, 'PATCH', updatedProperty);
      
      setShowEditModal(false);
      fetchProperties();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la propriété:', error);
      alert('Erreur lors de la mise à jour: ' + (error.message || 'Veuillez réessayer.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      try {
        setIsLoading(true);
        await apiCall(`/api/property/delete/${selectedProperty.id}`, 'DELETE');
        setShowEditModal(false);
        fetchProperties();
      } catch (error) {
        console.error('Erreur lors de la suppression de la propriété:', error);
        if (error.message.includes('Please remove the tenant')) {
          alert('Impossible de supprimer ce bien car il est actuellement loué. Veuillez d\'abord retirer le locataire.');
        } else {
          alert('Erreur lors de la suppression: ' + (error.message || 'Veuillez réessayer.'));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAssignTenant = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      await apiCall(`/api/property/${selectedProperty.id}/setTenant/${assignData.tenantId}`, 'PATCH', {
        entryDate: assignData.startDate
      });
      
      setShowAssignModal(false);
      const updatedProperty = await apiCall(`/api/property/getInfos/${selectedProperty.id}`);
      setSelectedProperty(updatedProperty);
      fetchProperties(); // Rafraîchir la liste des propriétés
    } catch (error) {
      console.error('Erreur lors de l\'assignation du locataire:', error);
      alert('Erreur lors de l\'assignation: ' + (error.message || 'Veuillez réessayer.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTenant = async () => {
    if (!selectedProperty) return;
    
    if (confirm('Êtes-vous sûr de vouloir retirer ce locataire ?')) {
      try {
        setIsLoading(true);
        await apiCall(`/api/property/${selectedProperty.id}/removeTenant`, 'PATCH');
        const updatedProperty = await apiCall(`/api/property/getInfos/${selectedProperty.id}`);
        setSelectedProperty(updatedProperty);
        fetchProperties();
      } catch (error) {
        console.error('Erreur lors du retrait du locataire:', error);
        alert('Erreur lors du retrait: ' + (error.message || 'Veuillez réessayer.'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      detail: '',
      surface: '',
      address: '',
      city: '',
      rent: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (property) => {
    setSelectedProperty(property);
    setFormData({
      detail: property.detail,
      surface: property.surface,
      address: property.address,
      city: property.city,
      rent: property.rent
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (property) => {
    try {
      setIsLoading(true);
      const propertyDetails = await apiCall(`/api/property/getInfos/${property.id}`);
      setSelectedProperty(propertyDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      alert('Erreur: ' + (error.message || 'Impossible de charger les détails.'));
    } finally {
      setIsLoading(false);
    }
  };

  const openAssignModal = () => {
    setShowDetailsModal(false);
    setAssignData({
      tenantId: '',
      startDate: ''
    });
    setShowAssignModal(true);
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowAssignModal(false);
  };

  return (
    <AuthCheck requiredRole="owner">
      <PageContainer>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h1 className="text-2xl font-bold text-blue-600">Mes Biens</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un bien
          </button>
        </div>

        {isLoading && properties.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Chargement de vos biens...</p>
          </div>
        ) : !isLoading && properties.length === 0 ? (
          <div className="bg-blue-50 rounded-lg p-4 text-blue-700">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vous n'avez encore aucun bien enregistré. Cliquez sur "Ajouter un bien" pour commencer.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(property => (
              <div key={property.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {property.detail === 'apartment' ? 'Appartement' : 'Maison'} - {property.city}
                    </h3>
                    <p className="text-gray-600 mb-4">{property.surface} m²</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        property.status === 'free' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status === 'free' ? 'Disponible' : 'Loué'}
                      </span>
                      <span className="text-blue-600 font-semibold">{property.rent} €/mois</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openDetailsModal(property)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => openEditModal(property)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Ajouter un bien */}
        {showAddModal && (
          <>
            <div className="fixed inset-0 bg-white/80 z-40" onClick={closeAllModals}></div>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-full max-w-md mx-4 shadow-lg z-50">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-semibold text-gray-900">Ajouter un bien</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddProperty} className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de bien
                    </label>
                    <select
                      name="detail"
                      value={formData.detail}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="apartment">Appartement</option>
                      <option value="house">Maison</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      name="surface"
                      value={formData.surface}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loyer mensuel (€)
                  </label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    min="1"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Modal Détails */}
        {showDetailsModal && selectedProperty && (
          <>
            <div className="fixed inset-0 bg-white/80 z-40" onClick={closeAllModals}></div>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-full max-w-md mx-4 shadow-lg z-50">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Détails du bien</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600">
                      {selectedProperty.detail === 'apartment' ? 'Appartement' : 'Maison'}
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Surface : {selectedProperty.surface} m²
                      </p>
                      <p className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {selectedProperty.address}, {selectedProperty.city}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Loyer : {selectedProperty.rent} €/mois
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedProperty.status === 'free' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedProperty.status === 'free' ? 'Disponible' : 'Loué'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedProperty.tenant ? (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-blue-600 mb-3">
                        <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Informations locataire
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                <span className="font-medium">Nom :</span> {selectedProperty.tenant.username}
                              </p>
                              {selectedProperty.tenant.email && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Email :</span> {selectedProperty.tenant.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <Link 
                            href={`/tenants?id=${selectedProperty.tenant.id}`}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Détails
                          </Link>
                        </div>
                        <button 
                          onClick={handleRemoveTenant}
                          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                          </svg>
                          Retirer le locataire
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded-lg p-4 mt-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-blue-700">Aucun locataire assigné.</span>
                      </div>
                      <button 
                        onClick={openAssignModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Assigner
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal Édition */}
        {showEditModal && selectedProperty && (
          <>
            <div className="fixed inset-0 bg-white/80 z-40" onClick={closeAllModals}></div>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-full max-w-md mx-4 shadow-lg z-50">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Modifier le bien</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleEditProperty} className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de bien
                    </label>
                    <select
                      name="detail"
                      value={formData.detail}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="apartment">Appartement</option>
                      <option value="house">Maison</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      name="surface"
                      value={formData.surface}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loyer mensuel (€)
                  </label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    min="1"
                  />
                </div>
                <div className="flex justify-between gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleDeleteProperty}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={isLoading}
                  >
                    Supprimer
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Modal Assignation */}
        {showAssignModal && selectedProperty && (
          <>
            <div className="fixed inset-0 bg-white/80 z-40" onClick={closeAllModals}></div>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-full max-w-md mx-4 shadow-lg z-50">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-blue-600">Assigner un locataire</h2>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAssignTenant} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID du locataire
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={assignData.tenantId}
                        onChange={(e) => setAssignData({...assignData, tenantId: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Entrez l'identifiant unique du locataire à assigner"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'entrée
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="date"
                        value={assignData.startDate}
                        onChange={(e) => setAssignData({...assignData, startDate: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Date d'entrée du locataire dans le logement</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Assignation...' : 'Assigner'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </PageContainer>
    </AuthCheck>
  );
}