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
  const [selectedProperty, setSelectedProperty] = useState(null);
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
      
      // Fermer le modal
      setShowEditModal(false);
      
      // Rafraîchir la liste des propriétés
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
        
        // Fermer le modal
        setShowEditModal(false);
        
        // Rafraîchir la liste des propriétés
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

  const openDetailsModal = async (propertyId) => {
    try {
      setIsLoading(true);
      
      const property = await apiCall(`/api/property/getInfos/${propertyId}`);
      setSelectedProperty(property);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      alert('Erreur: ' + (error.message || 'Impossible de charger les détails.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCheck requiredRole="owner">
      <PageContainer>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary"><i className="bi bi-house-door me-2"></i> Mes Biens</h2>
          <button className="btn btn-primary action-btn" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2"></i> Ajouter un bien
          </button>
        </div>

        {/* Chargement */}
        {isLoading && properties.length === 0 && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2 text-muted">Chargement de vos biens...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="alert alert-danger shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Message si aucun bien */}
        {!isLoading && !error && properties.length === 0 && (
          <div className="alert alert-info shadow-sm" role="alert">
            <i className="bi bi-info-circle me-2"></i> Vous n'avez encore aucun bien enregistré. Cliquez sur "Ajouter un bien" pour commencer.
          </div>
        )}

        {/* Liste des biens */}
        <div className="row g-4 mb-4">
          {properties.map(property => (
            <div className="col-md-4" key={property.id}>
              <div className="card h-100 shadow-sm border-0 rounded-3 feature-card">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '70px', height: '70px'}}>
                    <i className="bi bi-house-door fs-2 text-primary"></i>
                  </div>
                  <h5 className="card-title fw-bold">
                    {property.detail === 'apartment' ? 'Appartement' : 'Maison'} - {property.city}
                  </h5>
                  <p className="card-text text-muted">{property.surface} m²</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge ${property.status === 'free' ? 'bg-success' : 'bg-warning'} py-2 px-3`}>
                      {property.status === 'free' ? 'Disponible' : 'Loué'}
                    </span>
                    <span className="fw-bold text-primary">{property.rent} €/mois</span>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 text-center py-3">
                  <button className="btn btn-outline-primary btn-sm action-btn me-2" onClick={() => openDetailsModal(property.id)}>
                    <i className="bi bi-eye me-1"></i> Détails
                  </button>
                  <button className="btn btn-outline-secondary btn-sm action-btn" onClick={() => openEditModal(property)}>
                    <i className="bi bi-pencil me-1"></i> Modifier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Ajouter un bien */}
        {showAddModal && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content rounded-3 shadow">
                <div className="modal-header bg-primary bg-opacity-10 border-0">
                  <h5 className="modal-title fw-bold text-primary">
                    <i className="bi bi-plus-circle me-2"></i> Ajouter un bien
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form id="add-property-form" onSubmit={handleAddProperty}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="property-type" className="form-label fw-semibold">Type de bien</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-house"></i></span>
                          <select 
                            className="form-select" 
                            id="property-type" 
                            name="detail" 
                            value={formData.detail}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Sélectionner...</option>
                            <option value="apartment">Appartement</option>
                            <option value="house">Maison</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="property-surface" className="form-label fw-semibold">Surface (m²)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-rulers"></i></span>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="property-surface" 
                            name="surface" 
                            value={formData.surface}
                            onChange={handleInputChange}
                            required 
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="property-address" className="form-label fw-semibold">Adresse</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-geo-alt"></i></span>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="property-address" 
                            name="address" 
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="property-city" className="form-label fw-semibold">Ville</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-building"></i></span>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="property-city" 
                            name="city" 
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="property-rent" className="form-label fw-semibold">Loyer mensuel (€)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-cash"></i></span>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="property-rent" 
                            name="rent" 
                            value={formData.rent}
                            onChange={handleInputChange}
                            required 
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button 
                    type="button" 
                    className="btn btn-secondary action-btn" 
                    onClick={() => setShowAddModal(false)}
                  >
                    <i className="bi bi-x-circle me-1"></i> Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary action-btn" 
                    onClick={handleAddProperty}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i> Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Édition de propriété */}
        {showEditModal && selectedProperty && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content rounded-3 shadow">
                <div className="modal-header bg-primary bg-opacity-10 border-0">
                  <h5 className="modal-title fw-bold text-primary">
                    <i className="bi bi-pencil-square me-2"></i> Modifier un bien
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form id="edit-property-form" onSubmit={handleEditProperty}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="edit-property-type" className="form-label fw-semibold">Type de bien</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-house"></i></span>
                          <select 
                            className="form-select" 
                            id="edit-property-type" 
                            name="detail" 
                            value={formData.detail}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Sélectionner...</option>
                            <option value="apartment">Appartement</option>
                            <option value="house">Maison</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="edit-property-surface" className="form-label fw-semibold">Surface (m²)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-rulers"></i></span>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="edit-property-surface" 
                            name="surface" 
                            value={formData.surface}
                            onChange={handleInputChange}
                            required 
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="edit-property-address" className="form-label fw-semibold">Adresse</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-geo-alt"></i></span>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="edit-property-address" 
                            name="address" 
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="edit-property-city" className="form-label fw-semibold">Ville</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-building"></i></span>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="edit-property-city" 
                            name="city" 
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="edit-property-rent" className="form-label fw-semibold">Loyer mensuel (€)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light"><i className="bi bi-cash"></i></span>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="edit-property-rent" 
                            name="rent" 
                            value={formData.rent}
                            onChange={handleInputChange}
                            required 
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer bg-light border-0 d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-danger action-btn" 
                    onClick={handleDeleteProperty}
                    disabled={isLoading}
                  >
                    <i className="bi bi-trash me-2"></i> Supprimer
                  </button>
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-secondary action-btn me-2" 
                      onClick={() => setShowEditModal(false)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Annuler
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary action-btn" 
                      onClick={handleEditProperty}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i> Mettre à jour
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal détails de propriété */}
        {showDetailsModal && selectedProperty && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-3 shadow">
                <div className="modal-header bg-primary bg-opacity-10 border-0">
                  <h5 className="modal-title fw-bold text-primary">
                    <i className="bi bi-house-door me-2"></i> Détails du bien
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="fw-bold text-primary">
                        {selectedProperty.detail === 'apartment' ? 'Appartement' : 'Maison'}
                      </h5>
                      <p><i className="bi bi-rulers me-2 text-primary"></i> <strong>Surface :</strong> {selectedProperty.surface} m²</p>
                      <p><i className="bi bi-geo-alt me-2 text-primary"></i> <strong>Adresse :</strong> {selectedProperty.address}</p>
                      <p><i className="bi bi-building me-2 text-primary"></i> <strong>Ville :</strong> {selectedProperty.city}</p>
                    </div>
                    <div className="col-md-6">
                      <p><i className="bi bi-cash me-2 text-primary"></i> <strong>Loyer mensuel :</strong> {selectedProperty.rent} €</p>
                      <p>
                        <i className="bi bi-info-circle me-2 text-primary"></i> <strong>Statut :</strong> 
                        <span className={`badge ${selectedProperty.status === 'free' ? 'bg-success' : 'bg-warning'} ms-2 py-2 px-3`}>
                          {selectedProperty.status === 'free' ? 'Disponible' : 'Loué'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedProperty.tenant ? (
                    <div className="mt-4 border-top pt-3">
                      <h5 className="fw-bold text-primary mb-3"><i className="bi bi-person-circle me-2"></i> Informations locataire</h5>
                      <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                              <i className="bi bi-person-circle fs-2 text-primary"></i>
                            </div>
                            <div>
                              <h5 className="card-title mb-1 fw-bold">{selectedProperty.tenant.username}</h5>
                              <p className="card-text text-muted mb-2">
                                {selectedProperty.tenant.email && (
                                  <><i className="bi bi-envelope me-1"></i> {selectedProperty.tenant.email}</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 border-top pt-3">
                      <div className="alert alert-info d-flex align-items-center shadow-sm" role="alert">
                        <i className="bi bi-info-circle-fill me-2 fs-4 text-info"></i>
                        <div>Aucun locataire assigné.</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer justify-content-end bg-light border-0">
                  <button 
                    type="button" 
                    className="btn btn-secondary action-btn" 
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <i className="bi bi-x-circle me-1"></i> Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </AuthCheck>
  );
}