// api/auth.js
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

// Récupération des variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'clean';

// Fonction pour vérifier le token JWT
const verifyToken = (token) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET non défini');
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
};

// Fonction pour créer un client MongoDB
const createMongoClient = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI non défini');
  }
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
};

// Fonction pour vérifier l'authentification depuis les en-têtes HTTP
const checkAuth = (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return null;
  }
};

module.exports = {
  verifyToken,
  createMongoClient,
  checkAuth
}; 