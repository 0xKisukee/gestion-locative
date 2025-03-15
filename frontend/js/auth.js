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
function register(username, email, role, password) {
    const errorMsgElement = document.getElementById('error-message');
    const successMsgElement = document.getElementById('success-message');

    // Call the register API
    apiCall('/api/user/create', 'POST', { username, email, role, password })
        .then(data => {
            // Display success message
            successMsgElement.textContent = 'Compte créé avec succès! Redirection vers la page de connexion...';
            successMsgElement.style.display = 'block';
            errorMsgElement.style.display = 'none';

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
    clearLocalStorage();

    // Redirect to home
    window.location.href = '../index.html';
}

// Check authentication status and update UI
function checkAuthStatus() {
    const authButtons = document.getElementById('auth-buttons');
    const welcomeConnexion = document.getElementById('welcome-connect');
    const welcomeMsg = document.getElementById('welcome-message');
    const userName = document.getElementById('user-firstname');
    const userInfo = document.getElementById('user-info');
    const userEmailElement = document.getElementById('user-email');

    // Ne pas rediriger - juste mettre à jour l'interface utilisateur
    if (isLoggedIn()) {
        // User is logged in
        const user = getCurrentUser();
        
        // Masquer les boutons d'authentification
        if (authButtons) authButtons.style.display = 'none';
        
        // Afficher les informations de l'utilisateur
        if (userInfo) userInfo.style.display = 'flex';
        if (userEmailElement) userEmailElement.textContent = user ? user.email : '';
        
        // Mise à jour des messages de bienvenue
        if (welcomeConnexion) welcomeConnexion.style.display = 'none';
        if (welcomeMsg) welcomeMsg.style.display = 'block';
        if (userName) userName.textContent = user ? user.username : '';
    } else {
        // User is not logged in
        
        // Afficher les boutons d'authentification
        if (authButtons) authButtons.style.display = 'block';
        
        // Masquer les informations de l'utilisateur
        if (userInfo) userInfo.style.display = 'none';
        
        // Mise à jour des messages de bienvenue
        if (welcomeConnexion) welcomeConnexion.style.display = 'block';
        if (welcomeMsg) welcomeMsg.style.display = 'none';
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
document.addEventListener('DOMContentLoaded', function () {
    // Vérifier et mettre à jour l'interface selon l'état de connexion
    checkAuthStatus();

    // Add logout event listener if the button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

function clearLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}