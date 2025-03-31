const connectDB = require('../../api/db/connection');
const Event = require('../../api/models/Event');

exports.handler = async function(event, context) {
  // Désactiver la persistance de connexion pour les fonctions Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'PUT') {
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
    
    // Récupérer l'ID de l'événement à partir des paramètres de la requête
    const id = event.path.split('/').pop();
    
    if (!id) {
      throw new Error("ID d'événement non fourni");
    }
    
    // Extraire les données de mise à jour de l'événement
    const eventData = JSON.parse(event.body);
    
    // Mettre à jour l'événement
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      eventData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Événement non trouvé'
        })
      };
    }
    
    console.log(`Événement mis à jour avec l'ID: ${updatedEvent._id}`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Événement mis à jour avec succès',
        event: updatedEvent
      })
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Erreur lors de la mise à jour de l\'événement',
        error: error.message
      })
    };
  }
}; 