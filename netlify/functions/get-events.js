const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

exports.handler = async function(event, context) {
  console.log("Fonction get-events démarrée");
  console.log("Répertoire courant:", process.cwd());
  console.log("__dirname:", __dirname);
  
  try {
    // Définir les chemins possibles pour le dossier _events
    const sitePath = path.resolve(__dirname, '../..');
    console.log("Chemin du site:", sitePath);
    
    const possiblePaths = [
      path.join(sitePath, '_events'),             // Chemin relatif à la racine
      path.join(__dirname, '../../_events'),      // Alternative
      path.join(process.cwd(), '_events'),        // Répertoire de travail
      path.join(sitePath, '_events_copy'),        // Dossier copié lors du build
      '/_events'                                  // Chemin absolu dans certains cas
    ];
    
    // Afficher tous les chemins possibles pour le débogage
    console.log("Chemins possibles:", possiblePaths);
    
    // Trouver le premier chemin qui existe
    let eventsDir = null;
    for (const testPath of possiblePaths) {
      try {
        console.log(`Vérification du chemin: ${testPath}`);
        if (fs.existsSync(testPath)) {
          eventsDir = testPath;
          console.log(`✅ Dossier _events trouvé à: ${eventsDir}`);
          
          // Afficher le contenu du dossier
          const dirContents = fs.readdirSync(testPath);
          console.log(`Contenu du dossier (${dirContents.length} fichiers):`, dirContents);
          break;
        }
      } catch (err) {
        console.log(`❌ Erreur pour le chemin ${testPath}:`, err.message);
      }
    }
    
    // Si aucun chemin n'est trouvé, essayer une méthode alternative
    if (!eventsDir) {
      console.log("Aucun dossier _events trouvé, essai de méthode alternative...");
      try {
        // Lister les fichiers à la racine pour voir ce qui est disponible
        const rootContents = fs.readdirSync(sitePath);
        console.log("Contenu de la racine:", rootContents);
        
        // Vérifier si _events est dans la liste
        if (rootContents.includes('_events')) {
          eventsDir = path.join(sitePath, '_events');
          console.log(`✅ Dossier _events trouvé dans la liste à: ${eventsDir}`);
        }
      } catch (err) {
        console.log("❌ Erreur lors de la liste des fichiers à la racine:", err.message);
      }
    }
    
    if (!eventsDir) {
      // Si aucun chemin n'est trouvé, retourner des événements de secours
      console.log("⚠️ Aucun dossier _events trouvé. Utilisation des événements de secours.");
      
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
    console.log(`📁 Fichiers dans ${eventsDir}:`, files);
    
    // Filtrer et traiter chaque fichier Markdown
    const events = files
      .filter(filename => filename.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(eventsDir, filename);
        console.log(`📄 Lecture du fichier: ${filePath}`);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log(`Contenu du fichier ${filename} (extrait): ${fileContent.substring(0, 50)}...`);
        
        const { data, content } = matter(fileContent);
        console.log(`Données extraites de ${filename}:`, data);
        
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
    
    console.log(`✅ ${events.length} événements traités avec succès`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(events)
    };
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des fichiers markdown:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  }
};
