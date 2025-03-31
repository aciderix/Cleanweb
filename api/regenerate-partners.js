/**
 * Fonction Netlify pour régénérer le fichier partners.json à partir des fichiers markdown dans _partners
 * Cette fonction est déclenchée après chaque modification dans Netlify CMS
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

exports.handler = async function(event, context) {
  // Vérifier si c'est un appel webhook de Netlify CMS
  console.log('Fonction regenerate-partners déclenchée');
  console.log('Méthode HTTP:', event.httpMethod);
  console.log('Chemin:', event.path);

  try {
    // Lire tous les fichiers du dossier _partners
    const partnersDir = path.join(__dirname, '..', '_partners');
    const files = fs.readdirSync(partnersDir);
    
    // Traiter chaque fichier Markdown
    const partners = files
      .filter(filename => filename.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(partnersDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);
        
        return {
          name: data.name,
          logo: data.logo,
          url: data.url || '#',
          order: data.order || 999
        };
      });
    
    // Trier les partenaires par ordre
    partners.sort((a, b) => a.order - b.order);
    
    // Créer le répertoire api s'il n'existe pas
    const apiDir = path.join(__dirname, '..');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Écrire le fichier JSON
    fs.writeFileSync(
      path.join(apiDir, 'partners.json'),
      JSON.stringify(partners, null, 2)
    );
    
    console.log('Fichier partners.json généré avec succès');
    
    // Ajouter un timestamp aléatoire pour éviter la mise en cache du navigateur
    const timestamp = Date.now();
    
    // Ajouter un code JavaScript pour forcer le rechargement de la page d'accueil
    fs.writeFileSync(
      path.join(__dirname, '..', 'refresh.js'),
      `// Timestamp: ${timestamp}
// Ce fichier est généré automatiquement pour forcer le rechargement des événements et partenaires
console.log("Contenu mis à jour le ${new Date().toLocaleString()}");`
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
        message: 'Partenaires générés avec succès',
        count: partners.length
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