const mongoose = require('mongoose');
require('dotenv').config();

// Schéma d'événement directement intégré pour éviter les problèmes d'import
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  link: { type: String, default: '#contact' },
  linkText: { type: String, default: "Plus d'informations" },
  publishDate: { type: Date, default: Date.now },
  order: { type: Number, default: 1 }
}, { timestamps: true });

// Modèle créé dynamiquement pour éviter les problèmes de cache
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// Connexion à MongoDB intégrée
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return true;
    }
    
    console.log("Tentative de connexion à MongoDB...");
    console.log("URI MongoDB (masqué): " + process.env.MONGODB_URI?.substring(0, 15) + "...");
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB connecté: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    return false;
  }
};

exports.handler = async function(event, context) {
  console.log("Fonction get-events-mongodb démarrée");
  
  // Désactiver la persistance de connexion pour les fonctions Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Vérifier si les variables d'environnement sont définies
    if (!process.env.MONGODB_URI) {
      throw new Error("Variable d'environnement MONGODB_URI non définie");
    }
    
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