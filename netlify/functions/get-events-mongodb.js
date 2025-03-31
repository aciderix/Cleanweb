const connectDB = require('../../api/db/connection');
const Event = require('../../api/models/Event');

exports.handler = async function(event, context) {
  console.log("Fonction get-events-mongodb démarrée");
  
  // Désactiver la persistance de connexion pour les fonctions Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connexion à MongoDB
    const connected = await connectDB();
    
    if (!connected) {
      throw new Error("Impossible de se connecter à MongoDB");
    }
    
    console.log("Récupération des événements depuis MongoDB");
    
    // Récupérer tous les événements et les trier par ordre
    const events = await Event.find({})
      .sort({ order: 1 })
      .lean();
    
    console.log(`${events.length} événements récupérés depuis MongoDB`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*' // Autoriser les requêtes cross-origin
      },
      body: JSON.stringify(events)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    
    // Retourner un événement de secours en cas d'erreur
    const fallbackEvents = [
      {
        id: 'error-1',
        title: 'Erreur de chargement',
        date: 'À venir',
        description: `Une erreur est survenue lors du chargement des événements: ${error.message}`,
        image: null,
        link: '#contact',
        linkText: "Contactez-nous",
        order: 1
      }
    ];
    
    return {
      statusCode: 200, // Retourne 200 même en cas d'erreur pour éviter les erreurs côté client
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(fallbackEvents)
    };
  }
}; 