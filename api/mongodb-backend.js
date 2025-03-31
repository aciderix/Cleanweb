const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Event = require('../api/models/Event');
const connectDB = require('../api/db/connection');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Connexion à MongoDB
connectDB();

// Endpoints pour Netlify CMS

// Récupérer tous les événements
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ order: 1 });
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un événement par ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouvel événement
app.post('/api/events', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un événement
app.put('/api/events/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(updatedEvent);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un événement
app.delete('/api/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json({ message: 'Événement supprimé avec succès', event: deletedEvent });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint spécifique pour Netlify CMS
app.get('/api/info', (req, res) => {
  res.json({
    name: 'mongodb-backend',
    version: '1.0.0',
    description: 'Backend MongoDB pour Netlify CMS'
  });
});

// Démarrer le serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur MongoDB Netlify CMS démarré sur le port ${PORT}`);
  });
}

module.exports = app; 