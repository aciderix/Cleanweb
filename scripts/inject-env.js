// Script pour injecter les variables d'environnement dans les fichiers HTML statiques
const fs = require('fs');
const path = require('path');

// Fonction principale
function injectEnvVariables() {
  console.log('Injection des variables d\'environnement dans les fichiers HTML...');
  
  // Chemin vers le fichier callback.html
  const callbackPath = path.join(__dirname, '../admin/callback.html');
  
  if (!fs.existsSync(callbackPath)) {
    console.warn('Le fichier callback.html n\'a pas été trouvé');
    return;
  }
  
  // Vérifier que les variables d'environnement sont définies
  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
    console.error('Les variables d\'environnement AUTH0_DOMAIN et AUTH0_CLIENT_ID doivent être définies');
    process.exit(1); // Sortir avec code d'erreur
  }
  
  try {
    let content = fs.readFileSync(callbackPath, 'utf8');
    
    // Remplacer les placeholders par les valeurs des variables d'environnement
    content = content.replace(/%%AUTH0_DOMAIN%%/g, process.env.AUTH0_DOMAIN);
    content = content.replace(/%%AUTH0_CLIENT_ID%%/g, process.env.AUTH0_CLIENT_ID);
    
    fs.writeFileSync(callbackPath, content);
    console.log('Variables d\'environnement injectées avec succès dans callback.html');
  } catch (error) {
    console.error('Erreur lors de l\'injection des variables d\'environnement:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
injectEnvVariables(); 