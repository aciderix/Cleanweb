module.exports = {
  onPostBuild: async ({ utils }) => {
    const fs = require('fs');
    const path = require('path');
    
    // Chemin vers le fichier callback.html
    const callbackPath = path.join(__dirname, '../../admin/callback.html');
    
    if (fs.existsSync(callbackPath)) {
      console.log('Injection des variables d\'environnement dans callback.html...');
      
      // Vérifier que les variables d'environnement sont définies
      if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
        utils.build.failBuild('Les variables d\'environnement AUTH0_DOMAIN et AUTH0_CLIENT_ID doivent être définies pour le build');
        return;
      }
      
      let content = fs.readFileSync(callbackPath, 'utf8');
      
      // Remplacer les placeholders par les valeurs des variables d'environnement
      content = content.replace(/%%AUTH0_DOMAIN%%/g, process.env.AUTH0_DOMAIN);
      content = content.replace(/%%AUTH0_CLIENT_ID%%/g, process.env.AUTH0_CLIENT_ID);
      
      fs.writeFileSync(callbackPath, content);
      console.log('Variables d\'environnement injectées avec succès');
    } else {
      console.warn('Le fichier callback.html n\'a pas été trouvé');
    }
  }
};
