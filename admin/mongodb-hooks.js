// Hooks pour l'intégration de Netlify CMS avec MongoDB
(function() {
  // Hook exécuté avant la soumission du formulaire
  window.mongodbBeforeSubmit = function(entry) {
    console.log('Hook beforeSubmit appelé', entry);
    return entry;
  };

  // Hook exécuté après la soumission du formulaire
  window.mongodbAfterSubmit = async function(entry, data) {
    console.log('Hook afterSubmit appelé', entry, data);
    
    try {
      const eventData = entry.get('data').toJS();
      
      // Déterminer si c'est une création ou une mise à jour
      const isNewEntry = !data.id;
      
      if (isNewEntry) {
        // Créer un nouvel événement
        const response = await fetch('/.netlify/functions/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la création de l\'événement dans MongoDB');
        }
        
        const result = await response.json();
        console.log('Événement créé avec succès dans MongoDB:', result);
      } else {
        // Mettre à jour un événement existant
        const response = await fetch(`/.netlify/functions/update-event/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour de l\'événement dans MongoDB');
        }
        
        const result = await response.json();
        console.log('Événement mis à jour avec succès dans MongoDB:', result);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur dans le hook afterSubmit:', error);
      alert(`Erreur lors de l'enregistrement dans MongoDB: ${error.message}`);
      throw error;
    }
  };
  
  // Hook pour la suppression d'un événement
  window.mongodbOnDelete = async function(entry, slug) {
    console.log('Hook onDelete appelé', entry, slug);
    
    try {
      const response = await fetch(`/.netlify/functions/delete-event/${entry.get('id')}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'événement dans MongoDB');
      }
      
      const result = await response.json();
      console.log('Événement supprimé avec succès de MongoDB:', result);
      
      return true;
    } catch (error) {
      console.error('Erreur dans le hook onDelete:', error);
      alert(`Erreur lors de la suppression dans MongoDB: ${error.message}`);
      throw error;
    }
  };
})(); 