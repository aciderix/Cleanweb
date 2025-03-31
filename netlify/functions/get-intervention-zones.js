const matter = require('gray-matter');
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log("Fonction get-intervention-zones démarrée");
  
  try {
    console.log("Tentative de récupération des zones d'intervention depuis GitHub");
    
    // Configuration GitHub
    const repoOwner = 'aciderix';
    const repoName = 'Cleanweb';
    const branch = 'main';
    const zonesPath = '_intervention_zones'; // Chemin du dossier zones d'intervention dans le repo
    
    // Récupérer la liste des fichiers dans le dossier _intervention_zones
    const contentsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${zonesPath}?ref=${branch}`;
    console.log(`Récupération de la liste des fichiers depuis: ${contentsUrl}`);
    
    const contentsResponse = await fetch(contentsUrl);
    
    if (!contentsResponse.ok) {
      console.error(`Erreur lors de la récupération des fichiers: ${contentsResponse.status} ${contentsResponse.statusText}`);
      throw new Error(`Erreur API GitHub: ${contentsResponse.status} ${contentsResponse.statusText}`);
    }
    
    const contents = await contentsResponse.json();
    console.log(`${contents.length} fichiers trouvés dans le dossier _intervention_zones`);
    
    // Filtrer pour ne garder que les fichiers markdown
    const markdownFiles = contents.filter(file => file.name.endsWith('.md'));
    console.log(`${markdownFiles.length} fichiers markdown trouvés`);
    
    // Récupérer le contenu de chaque fichier markdown
    const zonesPromises = markdownFiles.map(async file => {
      console.log(`Récupération du contenu du fichier: ${file.name}`);
      
      const fileResponse = await fetch(file.download_url);
      
      if (!fileResponse.ok) {
        console.error(`Erreur lors de la récupération du fichier ${file.name}: ${fileResponse.status}`);
        return null;
      }
      
      const fileContent = await fileResponse.text();
      console.log(`Contenu récupéré pour ${file.name} (${fileContent.length} caractères)`);
      
      try {
        // Parser le frontmatter avec gray-matter
        const { data } = matter(fileContent);
        
        return {
          id: file.name.replace('.md', ''),
          title: data.title || 'Sans titre',
          icon: data.icon || '🌍',
          description: data.description || '',
          order: data.order || 999
        };
      } catch (error) {
        console.error(`Erreur lors du parsing de ${file.name}:`, error);
        return null;
      }
    });
    
    // Attendre que toutes les requêtes soient terminées
    const zonesResults = await Promise.all(zonesPromises);
    
    // Filtrer les zones null (en cas d'erreur)
    const zones = zonesResults.filter(zone => zone !== null);
    
    if (zones.length === 0) {
      console.log("Aucune zone d'intervention valide trouvée, utilisation des zones de secours");
      
      // Données de secours pour les zones d'intervention
      const fallbackZones = [
        {
          id: 'erdre',
          title: "L'Erdre : Notre Zone d'Action Principale",
          icon: '🌍',
          description: "Actuellement, nos actions se concentrent sur l'Erdre et ses rives. C'est ici que nous développons et testons nos solutions, comme les bacs à déchets flottants, et que nous organisons régulièrement des collectes. Cette rivière est notre terrain d'apprentissage et d'innovation.",
          order: 1
        },
        {
          id: 'loire',
          title: "La Loire : Des Actions Ponctuelles",
          icon: '🏞️',
          description: "Nous menons également des actions ponctuelles sur la Loire. Ces interventions nous permettent d'appréhender des défis différents et d'étendre progressivement notre impact. À terme, nous aimerions renforcer notre présence sur ce fleuve emblématique.",
          order: 2
        }
      ];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(fallbackZones)
      };
    }
    
    // Trier les zones par ordre
    zones.sort((a, b) => a.order - b.order);
    
    console.log(`${zones.length} zones d'intervention traitées avec succès`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(zones)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des zones d\'intervention:', error);
    
    // Retourner des zones de secours en cas d'erreur
    const fallbackZones = [
      {
        id: 'erdre-fallback',
        title: "L'Erdre : Notre Zone d'Action Principale",
        icon: '🌍',
        description: "Actuellement, nos actions se concentrent sur l'Erdre et ses rives. C'est ici que nous développons et testons nos solutions.",
        order: 1
      },
      {
        id: 'loire-fallback',
        title: "La Loire : Des Actions Ponctuelles",
        icon: '🏞️',
        description: "Nous menons également des actions ponctuelles sur la Loire.",
        order: 2
      }
    ];
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(fallbackZones)
    };
  }
}; 