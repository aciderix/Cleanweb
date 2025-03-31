/**
 * Fonction Netlify pour synchroniser les événements avec MongoDB
 * Cette fonction est déclenchée après chaque modification dans Netlify CMS
 */

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// URI de connexion MongoDB (à récupérer depuis les variables d'environnement)
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'clean';
const COLLECTION_NAME = 'events';

exports.handler = async function(event, context) {
  console.log('Fonction synchroniser-mongodb déclenchée');
  console.log('Méthode HTTP:', event.httpMethod);
  console.log('Chemin:', event.path);

  // Vérifier si l'URI MongoDB est définie
  if (!MONGODB_URI) {
    console.error('Erreur: Variable d\'environnement MONGODB_URI non définie');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Configuration MongoDB manquante'
      })
    };
  }

  let client;
  try {
    // Se connecter à MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connexion à MongoDB établie');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Récupérer tous les événements de la base de données
    const events = await collection.find({}).sort({ order: 1 }).toArray();
    console.log(`${events.length} événements récupérés de MongoDB`);
    
    // Générer également un fichier JSON local pour compatibilité avec le code existant
    // et pour servir de cache si MongoDB n'est pas accessible
    const fs = require('fs');
    const apiDir = path.join(__dirname, '..');
    fs.writeFileSync(
      path.join(apiDir, 'events.json'),
      JSON.stringify(events.map(event => ({
        ...event,
        _id: event._id.toString() // Convertir ObjectId en string pour JSON
      })), null, 2)
    );
    
    console.log('Fichier events.json généré avec succès');
    
    // Ajouter un timestamp aléatoire pour éviter la mise en cache du navigateur
    const timestamp = Date.now();
    
    // Ajouter un code JavaScript pour forcer le rechargement de la page d'accueil
    fs.writeFileSync(
      path.join(__dirname, '..', 'refresh.js'),
      `// Timestamp: ${timestamp}
// Ce fichier est généré automatiquement pour forcer le rechargement des événements
console.log("Événements mis à jour le ${new Date().toLocaleString()}");`
    );
    
    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        timestamp: timestamp,
        message: 'Événements synchronisés avec succès',
        count: events.length
      })
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec MongoDB:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  } finally {
    // Fermer la connexion à MongoDB
    if (client) {
      await client.close();
      console.log('Connexion à MongoDB fermée');
    }
  }
}; 