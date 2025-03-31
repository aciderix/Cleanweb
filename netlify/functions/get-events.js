const matter = require('gray-matter');
const { marked } = require('marked');
const fetch = require('node-fetch'); // Cette dépendance est disponible dans l'environnement Netlify

exports.handler = async function(event, context) {
  console.log("Fonction get-events démarrée");
  
  try {
    console.log("Tentative de récupération des événements depuis GitHub");
    
    // Configuration GitHub
    const repoOwner = 'aciderix'; // Nom d'utilisateur GitHub
    const repoName = 'Cleanweb'; // Nom du dépôt
    const branch = 'main'; // Branch principale
    const eventsPath = '_events'; // Chemin du dossier events dans le repo
    
    // Récupérer la liste des fichiers dans le dossier _events
    const contentsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${eventsPath}?ref=${branch}`;
    console.log(`Récupération de la liste des fichiers depuis: ${contentsUrl}`);
    
    const contentsResponse = await fetch(contentsUrl);
    
    if (!contentsResponse.ok) {
      console.error(`Erreur lors de la récupération des fichiers: ${contentsResponse.status} ${contentsResponse.statusText}`);
      throw new Error(`Erreur API GitHub: ${contentsResponse.status} ${contentsResponse.statusText}`);
    }
    
    const contents = await contentsResponse.json();
    console.log(`${contents.length} fichiers trouvés dans le dossier _events`);
    
    // Filtrer pour ne garder que les fichiers markdown
    const markdownFiles = contents.filter(file => file.name.endsWith('.md'));
    console.log(`${markdownFiles.length} fichiers markdown trouvés`);
    
    // Récupérer le contenu de chaque fichier markdown
    const eventsPromises = markdownFiles.map(async file => {
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
        const { data, content } = matter(fileContent);
        
        return {
          id: file.name.replace('.md', ''),
          title: data.title || 'Sans titre',
          date: data.date || 'À venir',
          description: data.description || '',
          image: data.image || null,
          link: data.link || '#contact',
          linkText: data.linkText || "Plus d'informations",
          order: data.order || 999,
          content: marked(content) // Convertit le markdown en HTML
        };
      } catch (error) {
        console.error(`Erreur lors du parsing de ${file.name}:`, error);
        return null;
      }
    });
    
    // Attendre que toutes les requêtes soient terminées
    const eventsResults = await Promise.all(eventsPromises);
    
    // Filtrer les événements null (en cas d'erreur)
    const events = eventsResults.filter(event => event !== null);
    
    if (events.length === 0) {
      console.log("Aucun événement valide trouvé, utilisation des événements de secours");
      
      const fallbackEvents = [
        {
          id: 'fallback-1',
          title: 'Événement de test',
          date: 'À venir',
          description: 'Aucun événement n\'a pu être chargé depuis GitHub. Veuillez vérifier la configuration.',
          image: null,
          link: '#contact',
          linkText: "Plus d'informations",
          order: 1
        }
      ];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(fallbackEvents)
      };
    }
    
    // Trier les événements par ordre
    events.sort((a, b) => a.order - b.order);
    
    console.log(`${events.length} événements traités avec succès`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(events)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    
    // Retourner un événement de secours en cas d'erreur
    const fallbackEvents = [
      {
        id: 'error-1',
        title: 'Erreur de chargement',
        date: 'À venir',
        description: `Une erreur est survenue lors du chargement des événements: ${error.message}`,
        image: null,
        link: '#contact',
        linkText: "Contactez-nous",
        order: 1
      }
    ];
    
    return {
      statusCode: 200, // Retourne 200 même en cas d'erreur pour éviter les erreurs côté client
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(fallbackEvents)
    };
  }
};
