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
    const token = localStorage.getItem('token');
    
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