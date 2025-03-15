// Authentication related functions

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

// Login function
function login(email, password) {
    const errorMsgElement = document.getElementById('error-message');
    
    // Call the login API
    apiCall('/api/user/login', 'POST', { email, password })
        .then(data => {
            // Store token and user in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            // Display error message
            errorMsgElement.textContent = error.message || 'Erreur de connexion. Veuillez réessayer.';
            errorMsgElement.style.display = 'block';
        });
}

// Register function
function register(username, email, password) {
    const errorMsgElement = document.getElementById('error-message');
    const successMsgElement = document.getElementById('success-message');
    
    // Call the register API
    apiCall('/api/user/create', 'POST', { username, email, password })
        .then(data => {
            // Display success message
            successMsgElement.textContent = 'Compte créé avec succès! Redirection vers la page de connexion...';
            successMsgElement.style.display = 'block';
            
            // Clear form
            document.getElementById('register-form').reset();
            
            // Redirect to login after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        })
        .catch(error => {
            // Display error message
            errorMsgElement.textContent = error.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
            errorMsgElement.style.display = 'block';
        });
}

// Logout function
function logout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home
    window.location.href = '../index.html';
}

// Check authentication status and update UI
function checkAuthStatus() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    
    if (isLoggedIn()) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            const userEmailElement = document.getElementById('user-email');
            if (userEmailElement) {
                const user = getCurrentUser();
                userEmailElement.textContent = user ? user.email : '';
            }
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Common function to show error message
function showError(message) {
    const errorMsgElement = document.getElementById('error-message');
    if (errorMsgElement) {
        errorMsgElement.textContent = message;
        errorMsgElement.style.display = 'block';
    }
}

// Initialize auth status when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Add logout event listener if the button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});