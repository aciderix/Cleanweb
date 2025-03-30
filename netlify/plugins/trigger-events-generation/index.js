const { execSync } = require('child_process');

module.exports = {
  onSuccess: async ({ utils }) => {
    try {
      // Exécute notre fonction de génération des événements après chaque déploiement
      console.log('Génération des événements...');
      const netlifyFunctionPath = 'netlify/functions/generate-events.js';
      const nodeProcess = execSync(`node ${netlifyFunctionPath}`);
      console.log('Événements générés avec succès');
      console.log(nodeProcess.toString());
    } catch (error) {
      console.error('Erreur lors de la génération des événements:', error);
      utils.build.failBuild('Échec de la génération des événements');
    }
  }
}; 