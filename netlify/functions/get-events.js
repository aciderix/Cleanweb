const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

exports.handler = async function(event, context) {
  try {
    // Définir les chemins possibles pour le dossier _events
    const possiblePaths = [
      path.join(__dirname, '../../_events'), // Chemin relatif au dossier des fonctions
      path.join(process.cwd(), '_events'),   // Chemin relatif au répertoire de travail
      path.join(__dirname, '../../_events_copy'), // Dossier copié par prepare-events.js
      '/_events',                           // Chemin absolu dans certains environnements Netlify
      '/opt/build/repo/_events'             // Chemin dans l'environnement de build Netlify
    ];
    
    // Trouver le premier chemin qui existe
    let eventsDir = null;
    for (const testPath of possiblePaths) {
      try {
        if (fs.existsSync(testPath)) {
          eventsDir = testPath;
          console.log(`Dossier _events trouvé à: ${eventsDir}`);
          break;
        }
      } catch (err) {
        console.log(`Chemin non trouvé: ${testPath}`);
      }
    }
    
    if (!eventsDir) {
      // Si aucun chemin n'est trouvé, retourner des événements de secours pour éviter une erreur
      console.log("Aucun dossier _events trouvé. Utilisation des événements de secours.");
      
      const fallbackEvents = [
        {
          id: 'fallback-1',
          title: 'Événement de test',
          date: 'À venir',
          description: 'Ceci est un événement de secours généré automatiquement car le dossier _events n\'a pas été trouvé.',
          image: null,
          link: '#contact',
          linkText: "Plus d'informations",
          order: 1
        }
      ];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(fallbackEvents)
      };
    }
    
    // Lire les fichiers du dossier _events
    const files = fs.readdirSync(eventsDir);
    console.log(`Fichiers dans ${eventsDir}:`, files);
    
    // Filtrer et traiter chaque fichier Markdown
    const events = files
      .filter(filename => filename.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(eventsDir, filename);
        console.log(`Lecture du fichier: ${filePath}`);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        return {
          id: filename.replace('.md', ''),
          title: data.title || 'Sans titre',
          date: data.date || 'À venir',
          description: data.description || '',
          image: data.image || null,
          link: data.link || '#contact',
          linkText: data.linkText || "Plus d'informations",
          order: data.order || 999,
          content: marked(content) // Convertit le markdown en HTML
        };
      });
    
    // Trier les événements par ordre
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
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  }
};
