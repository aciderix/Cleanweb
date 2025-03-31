/**
 * API pour récupérer les événements depuis MongoDB
 * Cette fonction est utilisée par la page d'accueil pour afficher les événements
 */

const { createMongoClient } = require('./auth');

// Constantes pour MongoDB
const DB_NAME = 'Clean';
const COLLECTION_NAME = 'events';

exports.handler = async function(event, context) {
  console.log('Fonction get-events déclenchée');
  
  let client;
  try {
    // Établir la connexion à MongoDB
    client = await createMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Récupérer tous les événements triés par ordre
    const events = await collection.find({}).sort({ order: 1 }).toArray();
    
    // Convertir les ObjectId en strings pour JSON
    const serializedEvents = events.map(event => ({
      ...event,
      _id: event._id.toString()
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(serializedEvents)
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    
    // En cas d'erreur, essayer de charger depuis le fichier JSON de sauvegarde
    try {
      const fs = require('fs');
      const path = require('path');
      const backupPath = path.join(__dirname, '..', 'events.json');
      
      if (fs.existsSync(backupPath)) {
        const eventsData = fs.readFileSync(backupPath, 'utf8');
        const events = JSON.parse(eventsData);
        
        console.log('Événements chargés depuis le fichier de sauvegarde');
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
          },
          body: eventsData
        };
      }
    } catch (backupError) {
      console.error('Erreur lors du chargement du fichier de sauvegarde:', backupError);
    }
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Erreur lors de la récupération des événements',
        message: error.message
      })
    };
  } finally {
    // Fermer la connexion à MongoDB
    if (client) {
      await client.close();
    }
  }
}; 