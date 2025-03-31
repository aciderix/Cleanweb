const connectDB = require('../../api/db/connection');
const Event = require('../../api/models/Event');

exports.handler = async function(event, context) {
  // Désactiver la persistance de connexion pour les fonctions Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'DELETE') {
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
    
    // Supprimer l'événement
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
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
    
    console.log(`Événement supprimé avec l'ID: ${id}`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Événement supprimé avec succès',
        event: deletedEvent
      })
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Erreur lors de la suppression de l\'événement',
        error: error.message
      })
    };
  }
}; 