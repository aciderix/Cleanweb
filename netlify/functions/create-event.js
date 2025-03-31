const connectDB = require('../../api/db/connection');
const Event = require('../../api/models/Event');

exports.handler = async function(event, context) {
  // Désactiver la persistance de connexion pour les fonctions Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' })
    };
  }
  
  try {
    // Connexion à MongoDB
    const connected = await connectDB();
    
    if (!connected) {
      throw new Error("Impossible de se connecter à MongoDB");
    }
    
    // Extraire les données de l'événement du corps de la requête
    const eventData = JSON.parse(event.body);
    
    // Créer un nouvel événement
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    console.log(`Nouvel événement créé avec l'ID: ${newEvent._id}`);
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Événement créé avec succès',
        event: newEvent
      })
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Erreur lors de la création de l\'événement',
        error: error.message
      })
    };
  }
}; 