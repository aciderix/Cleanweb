const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const connectDB = require('../api/db/connection');
const Event = require('../api/models/Event');
require('dotenv').config();

async function migrateEventsToMongoDB() {
  console.log('Démarrage de la migration des événements vers MongoDB...');
  
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Chemin vers le dossier des événements markdown
    const eventsDir = path.join(__dirname, '..', '_events');
    
    // Lire tous les fichiers markdown
    const files = fs.readdirSync(eventsDir).filter(file => file.endsWith('.md'));
    
    console.log(`${files.length} fichiers markdown trouvés à migrer...`);
    
    // Pour chaque fichier markdown
    for (const file of files) {
      const filePath = path.join(eventsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parser le frontmatter avec gray-matter
      const { data } = matter(fileContent);
      
      // Créer un nouvel événement dans MongoDB
      const event = new Event({
        title: data.title || 'Sans titre',
        date: data.date || 'À venir',
        description: data.description || '',
        image: data.image || null,
        link: data.link || '#contact',
        linkText: data.linkText || "Plus d'informations",
        publishDate: data.publishDate || new Date(),
        order: data.order || 1
      });
      
      // Sauvegarder l'événement
      await event.save();
      
      console.log(`Événement migré: ${data.title}`);
    }
    
    console.log('Migration terminée avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    // Déconnexion de MongoDB
    process.exit(0);
  }
}

// Exécuter la migration
migrateEventsToMongoDB(); 