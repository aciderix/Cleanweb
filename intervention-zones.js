// Fonction pour charger et afficher les zones d'intervention
async function loadInterventionZones() {
  try {
    const response = await fetch('/get-intervention-zones');
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des zones d'intervention: ${response.status}`);
    }

    const zones = await response.json();
    const areasContainer = document.querySelector('.areas-container');
    
    // Vider le conteneur avant d'ajouter les nouvelles zones
    areasContainer.innerHTML = '';
    
    // Ajouter chaque zone d'intervention au conteneur
    zones.forEach(zone => {
      const zoneCard = document.createElement('div');
      zoneCard.className = 'area-card hidden';
      
      zoneCard.innerHTML = `
        <div class="area-header">
          <div class="area-icon">${zone.icon}</div>
          <h3>${zone.title}</h3>
        </div>
        <p>${zone.description}</p>
      `;
      
      areasContainer.appendChild(zoneCard);
    });
    
    // Ajouter l'animation pour révéler les cartes au défilement
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.area-card.hidden').forEach(card => {
      observer.observe(card);
    });
    
  } catch (error) {
    console.error("Erreur lors du chargement des zones d'intervention:", error);
    
    // En cas d'erreur, afficher un message d'erreur discret
    const areasContainer = document.querySelector('.areas-container');
    if (areasContainer.children.length === 0) {
      areasContainer.innerHTML = `
        <div class="area-card">
          <div class="area-header">
            <div class="area-icon">⚠️</div>
            <h3>Impossible de charger les zones d'intervention</h3>
          </div>
          <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
        </div>
      `;
    }
  }
}

// Charger les zones d'intervention quand le document est prêt
document.addEventListener('DOMContentLoaded', loadInterventionZones); 