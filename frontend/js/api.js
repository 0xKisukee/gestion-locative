// API related functions

// Base API URL
const API_BASE_URL = ''; // Change this to match your API endpoint

// Generic API call function
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Prepare request options
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add body
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        
        // Make the API call
        const response = await fetch(url, options);
        
        // Parse response as JSON
        const result = await response.json();
        
        // Check if response is not ok (4xx or 5xx status)
        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue');
        }
        
        return result;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Function to handle unauthorized requests (token expired)
function handleUnauthorized() {
    // Clear localStorage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
    
    // Show an alert
    alert('Votre session a expiré. Veuillez vous reconnecter.');
}

// Add a global fetch error handler
window.addEventListener('unhandledrejection', function(event) {
    // Check if the error is related to an API call
    if (event.reason && event.reason.message) {
        // Check if it's an authentication error
        if (event.reason.message.includes('Authentication') || 
            event.reason.message.includes('token') || 
            event.reason.message.includes('JWT')) {
            handleUnauthorized();
        }
    }
});