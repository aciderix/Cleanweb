/**
 * Script pour charger les activités à partir des fichiers markdown
 * Similaire à events-markdown.js et partners-markdown.js
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Récupérer la div où les activités seront ajoutées
  const activitiesGrid = document.querySelector('.activities-grid');
  
  if (!activitiesGrid) {
    console.error("Élément .activities-grid non trouvé");
    return;
  }
  
  try {
    // Effacer le contenu existant
    activitiesGrid.innerHTML = '';
    
    // Récupérer les données d'activités
    const response = await fetch('/activities.json');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const activities = await response.json();
    
    // Si aucune activité n'est trouvée
    if (!activities || activities.length === 0) {
      activitiesGrid.innerHTML = '<p>Aucune activité n\'est disponible pour le moment.</p>';
      return;
    }
    
    // Trier les activités par ordre
    activities.sort((a, b) => a.order - b.order);
    
    // Créer un élément pour chaque activité
    activities.forEach(activity => {
      const activityCard = document.createElement('div');
      activityCard.className = 'activity-card hidden';
      
      // Créer la structure de l'activité
      activityCard.innerHTML = `
        <div class="activity-image">
          <img src="${activity.image}" alt="${activity.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="activity-content">
          <h3>${activity.title}</h3>
          <p>${activity.description}</p>
          <a href="${activity.link}" class="read-more">${activity.linkText}</a>
        </div>
      `;
      
      // Ajouter l'activité à la grille
      activitiesGrid.appendChild(activityCard);
    });
    
    // Initialiser les animations pour les nouvelles activités
    initializeAnimations();
    
  } catch (error) {
    console.error("Erreur lors du chargement des activités:", error);
    activitiesGrid.innerHTML = '<p>Une erreur est survenue lors du chargement des activités.</p>';
  }
});

/**
 * Fonction pour initialiser les animations
 * Cette fonction est copiée du script.js pour assurer la compatibilité
 */
function initializeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.hidden').forEach(element => {
    observer.observe(element);
  });
} 