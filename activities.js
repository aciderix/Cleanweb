/**
 * Script pour générer le fichier activities.json à partir des fichiers markdown dans _activities
 * Ce script est similaire à events.js et partners.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Lire tous les fichiers du dossier _activities
const activitiesDir = path.join(__dirname, '_activities');
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

// Écrire le fichier JSON
fs.writeFileSync(
  path.join(__dirname, 'activities.json'),
  JSON.stringify(activities, null, 2)
);

console.log('Fichier activities.json généré avec succès');

// Ajouter un timestamp aléatoire pour éviter la mise en cache du navigateur
const timestamp = Date.now();
fs.writeFileSync(
  path.join(__dirname, 'refresh.js'),
  `// Fichier généré automatiquement pour forcer le rafraîchissement du navigateur\n// Dernière mise à jour: ${new Date().toISOString()}\nconsole.log('Rafraîchissement des données: ${timestamp}');`
); 