document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.querySelector('.events-list');
  
  if (!eventsContainer) return;
  
  try {
    // Ajouter un paramètre timestamp pour éviter la mise en cache
    const timestamp = new Date().getTime();
    const response = await fetch(`/get-events?t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des événements depuis Markdown');
    }
    
    const events = await response.json();
    
    // Vider le contenu actuel
    eventsContainer.innerHTML = '';
    
    if (events.length === 0) {
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
        <a href="${event.link}" class="read-more">${event.linkText}</a>
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
    
  } catch (error) {
    console.error('Erreur:', error);
    // Afficher un message d'erreur dans le conteneur
    eventsContainer.innerHTML = `<div class="event-card show"><h3>Erreur lors du chargement des événements</h3><p>Veuillez actualiser la page et réessayer. Message d'erreur: ${error.message}</p></div>`;
  }
}); 