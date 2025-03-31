/**
 * Fonction Netlify pour régénérer le fichier activities.json à partir des fichiers markdown dans _activities
 * Cette fonction est déclenchée après chaque modification dans Netlify CMS
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

exports.handler = async function(event, context) {
  // Vérifier si c'est un appel webhook de Netlify CMS
  console.log('Fonction regenerate-activities déclenchée');
  console.log('Méthode HTTP:', event.httpMethod);
  console.log('Chemin:', event.path);

  try {
    // Lire tous les fichiers du dossier _activities
    const activitiesDir = path.join(__dirname, '..', '_activities');
    const files = fs.readdirSync(activitiesDir);
    
    // Traiter chaque fichier Markdown
    const activities = files
      .filter(filename => filename.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(activitiesDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);
        
        return {
          title: data.title,
          description: data.description,
          image: data.image,
          link: data.link || '#contact',
          linkText: data.linkText || 'En savoir plus',
          order: data.order || 999
        };
      });
    
    // Trier les activités par ordre
    activities.sort((a, b) => a.order - b.order);
    
    // Créer le répertoire api s'il n'existe pas
    const apiDir = path.join(__dirname, '..');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Écrire le fichier JSON
    fs.writeFileSync(
      path.join(apiDir, 'activities.json'),
      JSON.stringify(activities, null, 2)
    );
    
    console.log('Fichier activities.json généré avec succès');
    
    // Ajouter un timestamp aléatoire pour éviter la mise en cache du navigateur
    const timestamp = Date.now();
    fs.writeFileSync(
      path.join(apiDir, 'refresh.js'),
      `// Fichier généré automatiquement pour forcer le rafraîchissement du navigateur\n// Dernière mise à jour: ${new Date().toISOString()}\nconsole.log('Rafraîchissement des données: ${timestamp}');`
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Fichier activities.json généré avec succès' })
    };
  } catch (error) {
    console.error('Erreur lors de la génération du fichier activities.json:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message })
    };
  }
}; 