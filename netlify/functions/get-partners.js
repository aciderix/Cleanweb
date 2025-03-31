const matter = require('gray-matter');
const fetch = require('node-fetch'); // Cette dépendance est disponible dans l'environnement Netlify

exports.handler = async function(event, context) {
  console.log("Fonction get-partners démarrée");
  
  try {
    console.log("Tentative de récupération des partenaires depuis GitHub");
    
    // Configuration GitHub
    const repoOwner = 'aciderix'; // Nom d'utilisateur GitHub
    const repoName = 'Cleanweb'; // Nom du dépôt
    const branch = 'main'; // Branch principale
    const partnersPath = '_partners'; // Chemin du dossier partners dans le repo
    
    // Récupérer la liste des fichiers dans le dossier _partners
    const contentsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${partnersPath}?ref=${branch}`;
    console.log(`Récupération de la liste des fichiers depuis: ${contentsUrl}`);
    
    const contentsResponse = await fetch(contentsUrl);
    
    if (!contentsResponse.ok) {
      console.error(`Erreur lors de la récupération des fichiers: ${contentsResponse.status} ${contentsResponse.statusText}`);
      throw new Error(`Erreur API GitHub: ${contentsResponse.status} ${contentsResponse.statusText}`);
    }
    
    const contents = await contentsResponse.json();
    console.log(`${contents.length} fichiers trouvés dans le dossier _partners`);
    
    // Filtrer pour ne garder que les fichiers markdown
    const markdownFiles = contents.filter(file => file.name.endsWith('.md'));
    console.log(`${markdownFiles.length} fichiers markdown trouvés`);
    
    // Récupérer le contenu de chaque fichier markdown
    const partnersPromises = markdownFiles.map(async file => {
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
          name: data.name || 'Sans nom',
          logo: data.logo || null,
          url: data.url || '#',
          order: data.order || 999
        };
      } catch (error) {
        console.error(`Erreur lors du parsing de ${file.name}:`, error);
        return null;
      }
    });
    
    // Attendre que toutes les requêtes soient terminées
    const partnersResults = await Promise.all(partnersPromises);
    
    // Filtrer les partenaires null (en cas d'erreur)
    const partners = partnersResults.filter(partner => partner !== null);
    
    if (partners.length === 0) {
      console.log("Aucun partenaire valide trouvé, utilisation des partenaires de secours");
      
      // Récupérer le contenu de partners.json comme fallback
      const apiUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/api/partners.json`;
      const apiResponse = await fetch(apiUrl);
      
      if (apiResponse.ok) {
        const fallbackPartners = await apiResponse.json();
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(fallbackPartners)
        };
      }
      
      // Si même le fallback échoue, retourner un partenaire de test
      const testPartner = [
        {
          id: 'fallback-1',
          name: 'Partenaire test',
          logo: '/Clean-logo.png',
          url: '#',
          order: 1
        }
      ];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(testPartner)
      };
    }
    
    // Trier les partenaires par ordre
    partners.sort((a, b) => a.order - b.order);
    
    console.log(`${partners.length} partenaires traités avec succès`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(partners)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    
    // Retourner un partenaire de secours en cas d'erreur
    const fallbackPartners = [
      {
        id: 'error-1',
        name: 'Erreur de chargement',
        logo: '/Clean-logo.png',
        url: '#contact',
        order: 1
      }
    ];
    
    return {
      statusCode: 200, // Retourne 200 même en cas d'erreur pour éviter les erreurs côté client
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(fallbackPartners)
    };
  }
}; 