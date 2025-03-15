// Main JavaScript file for the application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add animation to dashboard cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow');
        });
    });
    
    // Check for token expiration on page load
    checkTokenExpiration();
});

// Function to check if token is expired
function checkTokenExpiration() {
    const token = getToken();
    
    if (token) {
        try {
            // JWT tokens have three parts separated by dots
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                // Not a valid JWT token
                return;
            }
            
            // The second part contains the payload
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Check if token has expiration time
            if (payload.exp) {
                const expirationTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                
                // If token is expired
                if (currentTime > expirationTime) {
                    // Clear local storage and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    // Only redirect if not already on login or register page
                    if (!window.location.pathname.includes('login.html') && 
                        !window.location.pathname.includes('register.html')) {
                        window.location.href = '/pages/login.html';
                    }
                }
            }
        } catch (error) {
            console.error('Error checking token expiration:', error);
        }
    }
}

/**
 * Extrait et retourne le rôle de l'utilisateur à partir du token JWT stocké
 * @returns {string|null} Le rôle de l'utilisateur ('owner', 'tenant', etc.) ou null si non disponible
 */
function getUserRole() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return null;
    }
    
    try {
        // JWT tokens have three parts separated by dots
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            // Not a valid JWT token
            return null;
        }
        
        // The second part contains the payload
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Return the role from the payload
        return payload.role || null;
    } catch (error) {
        console.error('Error extracting user role from token:', error);
        return null;
    }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param {string} role Le rôle à vérifier ('owner', 'tenant', etc.)
 * @returns {boolean} True si l'utilisateur a le rôle spécifié, false sinon
 */
function hasRole(role) {
    const userRole = getUserRole();
    return userRole === role;
}

// Fonction pour obtenir le token d'authentification 
function getToken() {
    return localStorage.getItem('token');
}