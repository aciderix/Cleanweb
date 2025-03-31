const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

exports.handler = async function(event, context) {
  try {
    // Chemin vers le dossier des événements
    const eventsDir = path.join(__dirname, '../../_events');
    const files = fs.readdirSync(eventsDir);
    
    // Lire et analyser chaque fichier markdown
    const events = files
      .filter(filename => filename.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(eventsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        return {
          id: filename.replace('.md', ''),
          title: data.title,
          date: data.date,
          description: data.description,
          image: data.image,
          link: data.link || '#contact',
          linkText: data.linkText || "Plus d'informations",
          order: data.order || 999,
          content: marked(content) // Convertit le markdown en HTML
        };
      });
    
    // Trier les événements
    events.sort((a, b) => a.order - b.order);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(events)
    };
  } catch (error) {
    console.error('Erreur lors de la lecture des fichiers markdown:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
