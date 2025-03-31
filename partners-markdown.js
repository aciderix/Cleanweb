document.addEventListener('DOMContentLoaded', async () => {
  const partnersContainer = document.querySelector('.partners-grid');
  
  if (!partnersContainer) return;
  
  try {
    // Ajouter un paramètre timestamp pour éviter la mise en cache
    const timestamp = new Date().getTime();
    const response = await fetch(`/get-partners?t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des partenaires depuis Markdown');
    }
    
    const partners = await response.json();
    
    // Vider le contenu actuel
    partnersContainer.innerHTML = '';
    
    if (partners.length === 0) {
      // Afficher un message si aucun partenaire n'est disponible
      partnersContainer.innerHTML = '<div class="partner-card show"><p>Aucun partenaire disponible pour le moment.</p></div>';
      return;
    }
    
    // Trier les partenaires par ordre
    partners.sort((a, b) => a.order - b.order);
    
    // Ajouter chaque partenaire au conteneur
    partners.forEach(partner => {
      const partnerElement = document.createElement('a');
      partnerElement.className = 'partner-link hidden';
      partnerElement.href = partner.url;
      partnerElement.target = "_blank";
      
      partnerElement.innerHTML = `
        <img src="${partner.logo}" alt="Logo ${partner.name}" class="partner-logo">
      `;
      
      partnersContainer.appendChild(partnerElement);
    });
    
    // Afficher un message de débogage dans la console
    console.log(`${partners.length} partenaires chargés à ${new Date().toLocaleTimeString()}`);
    
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
    
    const hiddenElements = document.querySelectorAll('.partner-link.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
    
  } catch (error) {
    console.error('Erreur:', error);
    // Afficher un message d'erreur dans le conteneur
    partnersContainer.innerHTML = `<div class="partner-card show"><p>Erreur lors du chargement des partenaires. Veuillez actualiser la page et réessayer. Message d'erreur: ${error.message}</p></div>`;
  }
}); 