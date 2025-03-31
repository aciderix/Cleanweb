/**
 * Fonction pour copier les fichiers d'événements dans l'environnement de fonctions Netlify
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

exports.handler = async function(event, context) {
  try {
    // Chemins source et destination
    const sourceDir = path.join(process.cwd(), '_events');
    const targetDir = path.join(__dirname, '../../_events_copy');
    
    console.log('Source directory:', sourceDir);
    console.log('Target directory:', targetDir);
    
    // Vérifier si le dossier source existe
    if (!fs.existsSync(sourceDir)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Le dossier source ${sourceDir} n'existe pas` })
      };
    }
    
    // Créer le dossier cible s'il n'existe pas
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Lire les fichiers du dossier source
    const files = fs.readdirSync(sourceDir);
    console.log('Files found:', files);
    
    // Copier chaque fichier
    const copiedFiles = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        fs.copyFileSync(sourcePath, targetPath);
        copiedFiles.push(file);
      }
    }
    
    console.log('Files copied:', copiedFiles);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `${copiedFiles.length} fichiers copiés`,
        files: copiedFiles
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  }
};

// Fonction qui sera exécutée au déploiement pour préparer les événements
function prepareBuild() {
  try {
    console.log('Préparation des événements pour le build...');
    
    // Lire tous les fichiers du dossier _events
    const eventsDir = path.join(__dirname, '..', '..', '_events');
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
    const apiDir = path.join(__dirname, '..', '..');
    
    // Écrire le fichier JSON
    fs.writeFileSync(
      path.join(apiDir, 'api', 'events.json'),
      JSON.stringify(events, null, 2)
    );
    
    console.log(`Fichier events.json généré avec ${events.length} événements.`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la préparation des événements:', error);
    return false;
  }
}

// Exécuter la fonction au déploiement
prepareBuild(); 