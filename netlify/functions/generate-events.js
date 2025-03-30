const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

exports.handler = async function(event, context) {
  try {
    // Lire tous les fichiers du dossier _events
    const eventsDir = path.join(__dirname, '../..', '_events');
    const files = fs.readdirSync(eventsDir);
    
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
          publishDate: data.publishDate
        };
      });
    
    // Trier les événements par ordre
    events.sort((a, b) => a.order - b.order);
    
    // Créer le répertoire api s'il n'existe pas
    const apiDir = path.join(__dirname, '../..', 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Écrire le fichier JSON
    fs.writeFileSync(
      path.join(apiDir, 'events.json'),
      JSON.stringify(events, null, 2)
    );
    
    console.log('Fichier events.json généré avec succès');
    
    // Ajouter un timestamp aléatoire pour éviter la mise en cache du navigateur
    const timestamp = Date.now();
    
    // Ajouter un code JavaScript pour forcer le rechargement de la page d'accueil
    fs.writeFileSync(
      path.join(__dirname, '../..', 'refresh.js'),
      `// Timestamp: ${timestamp}
// Ce fichier est généré automatiquement pour forcer le rechargement des événements
console.log("Événements mis à jour le ${new Date().toLocaleString()}");`
    );
    
    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        timestamp: timestamp,
        message: 'Événements générés avec succès',
        count: events.length
      })
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  }
}; 