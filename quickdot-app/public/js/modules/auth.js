/**
 * Authentication Module
 * Handles Firebase authentication and user session management
 */

const Auth = {
  firebaseApp: null,
  firebaseAuth: null,
  currentUser: null,

  /**
   * Initialize Firebase
   */
  init() {
    try {
      this.firebaseApp = firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
      this.firebaseAuth = firebase.auth();
      
      // Set up auth state observer
      this.firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          this.onAuthStateChanged(user);
        } else {
          this.onLogout();
        }
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  },

  /**
   * Handle auth state changes
   */
  async onAuthStateChanged(firebaseUser) {
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Authenticate with backend
      const response = await API.authenticateUser(idToken);
      
      if (response.success) {
        // Store JWT token
        API.setToken(response.token);
        
        // Store user data
        this.currentUser = response.user;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
        
        // Show main app
        this.showMainApp();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      UI.showToast('Authentication failed. Please try again.', 'error');
      this.logout();
    }
  },

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      UI.showLoading('Signing in with Google...');
      
      const provider = new firebase.auth.GoogleAuthProvider();
      await this.firebaseAuth.signInWithPopup(provider);
      
      UI.hideLoading();
    } catch (error) {
      UI.hideLoading();
      console.error('Google sign-in error:', error);
      UI.showToast('Google sign-in failed. Please try again.', 'error');
    }
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      UI.showLoading('Signing in...');
      
      await this.firebaseAuth.signInWithEmailAndPassword(email, password);
      
      UI.hideLoading();
    } catch (error) {
      UI.hideLoading();
      console.error('Email sign-in error:', error);
      
      let message = 'Sign-in failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      UI.showToast(message, 'error');
    }
  },

  /**
   * Create account with email and password
   */
  async createAccountWithEmail(email, password) {
    try {
      UI.showLoading('Creating account...');
      
      await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
      
      UI.hideLoading();
      UI.showToast('Account created successfully!', 'success');
    } catch (error) {
      UI.hideLoading();
      console.error('Account creation error:', error);
      
      let message = 'Account creation failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      }
      
      UI.showToast(message, 'error');
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      await this.firebaseAuth.signOut();
      this.onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Handle logout
   */
  onLogout() {
    // Clear local storage
    API.clearToken();
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    
    // Reset current user
    this.currentUser = null;
    
    // Show login screen
    this.showLoginScreen();
  },

  /**
   * Show main app
   */
  showMainApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    // Initialize app after login
    if (window.App && window.App.init) {
      window.App.init();
    }
  },

  /**
   * Show login screen
   */
  showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      } catch (error) {
        return null;
      }
    }
    
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!API.getToken() && !!this.getCurrentUser();
  },
};

// Export for use in other modules
window.Auth = Auth;
