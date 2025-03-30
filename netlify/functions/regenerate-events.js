/**
 * Fonction Netlify pour régénérer le fichier events.json
 * Peut être appelée manuellement via /.netlify/functions/regenerate-events
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

exports.handler = async function(event, context) {
  console.log('====== DÉBUT FONCTION REGENERATE-EVENTS ======');
  console.log('Date et heure:', new Date().toISOString());
  console.log('Méthode HTTP:', event.httpMethod);
  console.log('Chemin:', event.path);
  console.log('Corps de la requête:', event.body);
  console.log('En-têtes:', JSON.stringify(event.headers));
  
  try {
    // Obtenir le chemin du répertoire de travail actuel
    const cwd = process.cwd();
    console.log('Répertoire de travail actuel:', cwd);
    
    // Chemin absolu du dossier racine du projet
    const rootDir = path.join(__dirname, '../..');
    console.log('Dossier racine du projet:', rootDir);
    
    // Vérifier que le dossier racine existe
    if (!fs.existsSync(rootDir)) {
      throw new Error(`Le dossier racine ${rootDir} n'existe pas`);
    }
    
    // Liste des fichiers dans le dossier racine
    console.log('Contenu du dossier racine:', fs.readdirSync(rootDir));
    
    // Lire tous les fichiers du dossier _events
    const eventsDir = path.join(rootDir, '_events');
    console.log('Dossier des événements:', eventsDir);
    
    // Vérifier que le dossier _events existe
    if (!fs.existsSync(eventsDir)) {
      throw new Error(`Le dossier _events ${eventsDir} n'existe pas`);
    }
    
    const files = fs.readdirSync(eventsDir);
    console.log('Fichiers trouvés dans _events:', files);
    
    // Filtrer et traiter chaque fichier Markdown
    const markdownFiles = files.filter(filename => filename.endsWith('.md'));
    console.log('Fichiers Markdown trouvés:', markdownFiles);
    
    // Traiter chaque fichier Markdown
    const events = markdownFiles.map(filename => {
      const filePath = path.join(eventsDir, filename);
      console.log('Lecture du fichier:', filePath);
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log('Contenu du fichier:', fileContent.substring(0, 100) + '...');
      
      const { data } = matter(fileContent);
      console.log('Données extraites:', JSON.stringify(data));
      
      return {
        title: data.title || 'Sans titre',
        date: data.date || 'À venir',
        description: data.description || '',
        image: data.image || null,
        link: data.link || '#contact',
        linkText: data.linkText || "Plus d'informations",
        order: data.order || 999
      };
    });
    
    console.log('Événements extraits:', JSON.stringify(events));
    
    // Trier les événements par ordre
    events.sort((a, b) => a.order - b.order);
    console.log('Événements triés:', JSON.stringify(events));
    
    // Chemin du fichier JSON de sortie
    const apiDir = path.join(rootDir, 'api');
    const eventsJsonPath = path.join(apiDir, 'events.json');
    
    console.log('Dossier API:', apiDir);
    console.log('Chemin du fichier events.json:', eventsJsonPath);
    
    // Créer le répertoire api s'il n'existe pas
    if (!fs.existsSync(apiDir)) {
      console.log('Création du dossier api');
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Écrire le fichier JSON
    console.log('Écriture du fichier events.json');
    fs.writeFileSync(
      eventsJsonPath,
      JSON.stringify(events, null, 2)
    );
    
    // Ajouter un timestamp aléatoire pour éviter la mise en cache du navigateur
    const timestamp = Date.now();
    
    // Ajouter un code JavaScript pour forcer le rechargement de la page d'accueil
    const refreshPath = path.join(rootDir, 'refresh.js');
    console.log('Création du fichier refresh.js:', refreshPath);
    
    fs.writeFileSync(
      refreshPath,
      `// Timestamp: ${timestamp}
// Ce fichier est généré automatiquement pour forcer le rechargement des événements
console.log("Événements mis à jour le ${new Date().toLocaleString()}");`
    );
    
    console.log('====== SUCCÈS - FONCTION TERMINÉE ======');
    
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
        count: events.length,
        events: events
      })
    };
  } catch (error) {
    console.error('====== ERREUR ======');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
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