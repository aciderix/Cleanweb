const mongoose = require('mongoose');
require('dotenv').config();

// Schéma d'événement directement intégré
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

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// Connexion à MongoDB intégrée
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return true;
    }
    console.log("Tentative de connexion à MongoDB...");
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
    // Vérifier si les variables d'environnement sont définies
    if (!process.env.MONGODB_URI) {
      throw new Error("Variable d'environnement MONGODB_URI non définie");
    }
    
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