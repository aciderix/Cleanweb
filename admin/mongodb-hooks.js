// Hooks pour l'intégration de Netlify CMS avec MongoDB
(function() {
  // Logs améliorés
  const log = (message, data) => {
    console.log(`[MongoDB Hook] ${message}`, data || '');
  };

  // Hook exécuté avant la soumission du formulaire
  window.mongodbBeforeSubmit = function(entry) {
    log('BeforeSubmit appelé avec:', entry);
    
    // Vérifier si l'entrée contient toutes les informations nécessaires
    const data = entry.get('data').toJS();
    
    if (!data.title) {
      alert('Le titre est obligatoire');
      throw new Error('Titre manquant');
    }
    
    if (!data.date) {
      alert('La date est obligatoire');
      throw new Error('Date manquante');
    }
    
    // S'assurer que l'ordre est un nombre
    if (data.order && isNaN(parseInt(data.order))) {
      entry.get('data').set('order', 1);
    }
    
    log('Entry validée:', data);
    return entry;
  };

  // Hook exécuté après la soumission du formulaire
  window.mongodbAfterSubmit = async function(entry, data) {
    log('AfterSubmit appelé avec:', { entry, data });
    
    try {
      const eventData = entry.get('data').toJS();
      log('Données de l\'événement:', eventData);
      
      // Déterminer si c'est une création ou une mise à jour
      const isNewEntry = !data.id;
      log(isNewEntry ? 'Création d\'un nouvel événement' : `Mise à jour de l'événement ${data.id}`);
      
      let response;
      
      if (isNewEntry) {
        // Créer un nouvel événement
        log('Envoi de la requête de création');
        response = await fetch('/.netlify/functions/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
      } else {
        // Mettre à jour un événement existant
        log(`Envoi de la requête de mise à jour pour l'ID ${data.id}`);
        response = await fetch(`/.netlify/functions/update-event/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      log('Réponse reçue:', result);
      
      // En cas de succès, rafraîchir la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      return result;
    } catch (error) {
      log('Erreur dans le hook afterSubmit:', error);
      alert(`Erreur lors de l'enregistrement dans MongoDB: ${error.message}`);
      throw error;
    }
  };
  
  // Hook pour la suppression d'un événement
  window.mongodbOnDelete = async function(entry, slug) {
    log('OnDelete appelé avec:', { entry, slug });
    
    try {
      const id = entry.get('id');
      log(`Suppression de l'événement avec l'ID: ${id}`);
      
      const response = await fetch(`/.netlify/functions/delete-event/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      log('Événement supprimé avec succès:', result);
      
      // En cas de succès, rafraîchir la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      return true;
    } catch (error) {
      log('Erreur dans le hook onDelete:', error);
      alert(`Erreur lors de la suppression dans MongoDB: ${error.message}`);
      throw error;
    }
  };
  
  // Initialisation - s'exécute au chargement de la page
  log('Hooks MongoDB initialisés avec succès');
})(); 