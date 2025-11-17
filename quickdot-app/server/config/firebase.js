const admin = require('firebase-admin');

/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase for authentication and Firestore database
 */

let firebaseApp;

const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Initialize Firebase Admin SDK
    // In production, credentials are loaded from environment variables
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    };

    firebaseApp = admin.initializeApp(config);
    console.log('✅ Firebase initialized successfully');
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw new Error('Failed to initialize Firebase');
  }
};

// Get Firestore instance
const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.firestore();
};

// Get Firebase Auth instance
const getAuth = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.auth();
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  verifyIdToken,
  admin,
};
