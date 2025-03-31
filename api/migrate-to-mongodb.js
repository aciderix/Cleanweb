/**
 * Script de migration pour transférer les événements existants des fichiers Markdown vers MongoDB
 * À exécuter une seule fois pour initialiser la base de données MongoDB
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { MongoClient } = require('mongodb');

// URL de connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'Clean';
const COLLECTION_NAME = 'events';

exports.handler = async function(event, context) {
  console.log('Fonction migrate-to-mongodb déclenchée');
  
  // Vérifier si l'URI MongoDB est définie
  if (!MONGODB_URI) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Variable d\'environnement MONGODB_URI non définie' })
    };
  }
  
  let client;
  try {
    // Lire tous les fichiers du dossier _events
    const eventsDir = path.join(__dirname, '..', '_events');
    const files = fs.readdirSync(eventsDir);
    
    console.log(`${files.length} fichiers trouvés dans le dossier _events`);
    
    // Traiter chaque fichier Markdown
    const events = files
      .filter(filename => filename.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(eventsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);
        
        return {
          title: data.title,
          date: data.date,
          description: data.description,
          image: data.image,
          link: data.link || '#contact',
          linkText: data.linkText || "Plus d'informations",
          order: data.order || 999,
          publishDate: data.publishDate,
          sourceFile: filename // Garder une référence au fichier source
        };
      });
    
    console.log(`${events.length} événements extraits des fichiers Markdown`);
    
    // Se connecter à MongoDB et insérer les événements
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connexion à MongoDB établie');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Vérifier si la collection est vide avant d'insérer
    const count = await collection.countDocuments();
    
    if (count > 0) {
      console.log(`La collection ${COLLECTION_NAME} contient déjà ${count} documents`);
      
      // Demander confirmation pour continuer (dans un environnement serverless, on suppose oui)
      if (event.queryStringParameters?.force !== 'true') {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `La collection contient déjà ${count} documents. Ajoutez ?force=true pour forcer la migration.`,
            eventsFound: events.length,
            existingEvents: count
          })
        };
      }
    }
    
    // Insérer les événements
    if (events.length > 0) {
      const result = await collection.insertMany(events);
      console.log(`${result.insertedCount} événements insérés dans MongoDB`);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true,
          message: `${result.insertedCount} événements migrés avec succès vers MongoDB`,
          insertedIds: result.insertedIds
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true,
          message: 'Aucun événement à migrer'
        })
      };
    }
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
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
      console.log('Connexion à MongoDB fermée');
    }
  }
}; 