document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.querySelector('.events-list');
  
  if (!eventsContainer) return;
  
  // Fonction pour charger les événements depuis une source spécifique
  async function loadEvents(source) {
    try {
      // Ajouter un paramètre timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();
      console.log(`Tentative de chargement des événements depuis ${source}...`);
      
      const url = source === 'mongodb' 
        ? `/.netlify/functions/get-events-mongodb?t=${timestamp}`
        : source === 'markdown'
          ? `/get-events?t=${timestamp}`
          : `/api/events.json?t=${timestamp}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Échec du chargement depuis ${source}: ${response.status} ${response.statusText}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors du chargement depuis ${source}:`, error);
      return null;
    }
  }
  
  // Fonction pour afficher les événements
  function displayEvents(events) {
    // Vider le contenu actuel
    eventsContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
      // Afficher un message si aucun événement n'est disponible
      eventsContainer.innerHTML = '<div class="event-card show"><h3>Aucun événement à venir pour le moment</h3><p>Consultez cette page ultérieurement pour découvrir nos prochains événements.</p></div>';
      return;
    }
    
    // Ajouter chaque événement au conteneur
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card hidden';
      
      let imageHtml = '';
      if (event.image) {
        imageHtml = `
          <div class="event-image">
            <img src="${event.image}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `;
      }
      
      eventCard.innerHTML = `
        <h4 class="event-date">${event.date}</h4>
        <h3 class="event-title">${event.title}</h3>
        ${imageHtml}
        <p class="event-description">${event.description}</p>
        <a href="${event.link}" class="read-more">${event.linkText || "Plus d'informations"}</a>
      `;
      
      eventsContainer.appendChild(eventCard);
    });
    
    // Réinitialiser l'observateur pour les nouveaux éléments
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          entry.target.classList.remove('hidden');
          observer.unobserve(entry.target);
        }
      });
    });
    
    const hiddenElements = document.querySelectorAll('.event-card.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
  }
  
  // Événements de test au cas où toutes les sources échouent
  const fallbackEvents = [
    {
      id: 'fallback-1',
      title: 'Collecte sur l\'Erdre',
      date: 'Prochainement',
      description: 'Rejoignez-nous pour une collecte de déchets le long de l\'Erdre. Cette action permettra de nettoyer les berges et de sensibiliser le public à la pollution des cours d\'eau.',
      image: null,
      link: '#contact',
      linkText: "S'inscrire",
      order: 1
    }
  ];
  
  try {
    // Essayer de charger depuis MongoDB
    let events = await loadEvents('mongodb');
    
    // Si échec, essayer les fichiers markdown
    if (!events) {
      console.log('Tentative de chargement depuis les fichiers markdown...');
      events = await loadEvents('markdown');
    }
    
    // Si échec, essayer le JSON statique
    if (!events) {
      console.log('Tentative de chargement depuis le JSON statique...');
      events = await loadEvents('json');
    }
    
    // Si toutes les sources ont échoué, utiliser les événements de secours
    if (!events) {
      console.log('Utilisation des événements de secours.');
      events = fallbackEvents;
    }
    
    // Afficher les événements
    displayEvents(events);
    
  } catch (error) {
    console.error('Erreur globale:', error);
    // Afficher un message d'erreur dans le conteneur
    eventsContainer.innerHTML = `<div class="event-card show"><h3>Erreur lors du chargement des événements</h3><p>Veuillez actualiser la page et réessayer. Message d'erreur: ${error.message}</p></div>`;
  }
}); 