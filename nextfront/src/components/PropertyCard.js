import { useState } from 'react';

export default function PropertyCard({ property, onViewDetails, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`card h-100 shadow-sm border-0 rounded-3 feature-card ${
        isHovered ? 'translate-y-5 shadow-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-body p-4 text-center">
        <div className="rounded-circle bg-primary bg-opacity-10 mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{ width: '70px', height: '70px' }}>
          <i className="bi bi-house-door fs-2 text-primary"></i>
        </div>
        <h5 className="card-title fw-bold">
          {property.detail === 'apartment' ? 'Appartement' : 'Maison'} - {property.city}
        </h5>
        <p className="text-muted mb-3">{property.surface} m²</p>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className={`badge ${
            property.status === 'free' 
              ? 'bg-success' 
              : 'bg-warning'
          } py-2 px-3`}>
            {property.status === 'free' ? 'Disponible' : 'Loué'}
          </span>
          <span className="fw-bold text-primary">{property.rent} €/mois</span>
        </div>
      </div>
      <div className="card-footer bg-light border-0 text-center">
        <button 
          className="btn btn-outline-primary btn-sm action-btn me-2" 
          onClick={() => onViewDetails(property.id)}
        >
          <i className="bi bi-eye me-1"></i> Détails
        </button>
        <button 
          className="btn btn-outline-secondary btn-sm action-btn" 
          onClick={() => onEdit(property)}
        >
          <i className="bi bi-pencil me-1"></i> Modifier
        </button>
      </div>
    </div>
  );
}