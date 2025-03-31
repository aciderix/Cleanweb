/**
 * Fonction pour copier les fichiers d'événements dans l'environnement de fonctions Netlify
 */

const fs = require('fs');
const path = require('path');

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