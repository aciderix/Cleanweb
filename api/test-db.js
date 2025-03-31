const { createMongoClient } = require('./auth');

// Constantes pour MongoDB
const DB_NAME = 'Clean';

exports.handler = async function(event, context) {
  console.log('Fonction test-db déclenchée');
  
  let client;
  try {
    console.log('Tentative de connexion à MongoDB...');
    client = await createMongoClient();
    console.log('Connexion à MongoDB établie');
    
    const db = client.db(DB_NAME);
    console.log('Base de données trouvée:', DB_NAME);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections disponibles:', collections.map(c => c.name));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        collections: collections.map(c => c.name)
      })
    };
  } catch (error) {
    console.error('Erreur détaillée:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, stack: error.stack })
    };
  } finally {
    if (client) await client.close();
  }
};
