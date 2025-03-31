const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Fonction qui sera exécutée au déploiement pour préparer les partenaires
function prepareBuild() {
  try {
    console.log('Préparation des partenaires pour le build...');
    
    // Lire tous les fichiers du dossier _partners
    const partnersDir = path.join(__dirname, '..', '..', '_partners');
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
    const apiDir = path.join(__dirname, '..', '..');
    const apiPath = path.join(apiDir, 'api');
    if (!fs.existsSync(apiPath)) {
      fs.mkdirSync(apiPath, { recursive: true });
    }
    
    // Écrire le fichier JSON
    fs.writeFileSync(
      path.join(apiPath, 'partners.json'),
      JSON.stringify(partners, null, 2)
    );
    
    console.log(`Fichier partners.json généré avec ${partners.length} partenaires.`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la préparation des partenaires:', error);
    return false;
  }
}

// Exécuter la fonction au déploiement
prepareBuild(); 