/**
 * API pour gérer les événements via MongoDB
 * Gère les opérations CRUD pour les événements
 */

const { MongoClient, ObjectId } = require('mongodb');
const { checkAuth, createMongoClient } = require('./auth');

// Constantes pour MongoDB
const DB_NAME = 'Clean';
const COLLECTION_NAME = 'events';

exports.handler = async function(event, context) {
  console.log('Fonction mongodb-events déclenchée');
  console.log('Méthode HTTP:', event.httpMethod);
  console.log('Chemin:', event.path);
  
  // Vérifier l'authentification si nécessaire pour des opérations d'écriture
  if (event.httpMethod !== 'GET') {
    const auth = checkAuth(event);
    if (!auth) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Non autorisé' })
      };
    }
  }
  
  let client;
  try {
    // Établir la connexion à MongoDB
    client = await createMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Gérer les différentes méthodes HTTP
    if (event.httpMethod === 'GET') {
      // Récupérer tous les événements ou un événement spécifique
      const id = event.queryStringParameters?.id;
      
      if (id) {
        // Récupérer un événement spécifique
        const event = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!event) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Événement non trouvé' })
          };
        }
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            _id: event._id.toString()
          })
        };
      } else {
        // Récupérer tous les événements
        const events = await collection.find({}).sort({ order: 1 }).toArray();
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(events.map(event => ({
            ...event,
            _id: event._id.toString() // Convertir ObjectId en string pour JSON
          })))
        };
      }
    } 
    else if (event.httpMethod === 'POST') {
      // Créer un nouvel événement
      const eventData = JSON.parse(event.body);
      
      // Valider les données minimales requises
      if (!eventData.title || !eventData.date) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Titre et date sont requis' })
        };
      }
      
      // Ajouter des valeurs par défaut si nécessaire
      const newEvent = {
        ...eventData,
        link: eventData.link || '#contact',
        linkText: eventData.linkText || "Plus d'informations",
        order: eventData.order || 999,
        publishDate: eventData.publishDate || new Date().toISOString()
      };
      
      const result = await collection.insertOne(newEvent);
      
      // Déclencher la régénération du cache
      await triggerCacheRegeneration();
      
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          _id: result.insertedId.toString(),
          ...newEvent
        })
      };
    } 
    else if (event.httpMethod === 'PUT') {
      // Mettre à jour un événement existant
      const id = event.queryStringParameters?.id;
      
      if (!id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'ID manquant' })
        };
      }
      
      const eventData = JSON.parse(event.body);
      
      // Supprimer _id s'il est présent pour éviter les erreurs de MongoDB
      if (eventData._id) {
        delete eventData._id;
      }
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: eventData }
      );
      
      if (result.matchedCount === 0) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Événement non trouvé' })
        };
      }
      
      // Déclencher la régénération du cache
      await triggerCacheRegeneration();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          _id: id,
          ...eventData
        })
      };
    } 
    else if (event.httpMethod === 'DELETE') {
      // Supprimer un événement
      const id = event.queryStringParameters?.id;
      
      if (!id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'ID manquant' })
        };
      }
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Événement non trouvé' })
        };
      }
      
      // Déclencher la régénération du cache
      await triggerCacheRegeneration();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          _id: id
        })
      };
    }
    
    // Méthode non supportée
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Méthode non supportée' })
    };
    
  } catch (error) {
    console.error('Erreur MongoDB:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  } finally {
    // Fermer la connexion à MongoDB
    if (client) {
      await client.close();
    }
  }
};

// Fonction pour déclencher la régénération du cache
async function triggerCacheRegeneration() {
  try {
    // Utiliser la fonction de régénération d'événements
    const handler = require('./regenerate-events').handler;
    await handler({
      httpMethod: 'GET',
      path: '/api/regenerate-events'
    });
  } catch (error) {
    console.error('Erreur lors de la régénération du cache:', error);
  }
} 