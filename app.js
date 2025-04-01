require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const potionsRoutes = require('./router/potions');
const analyticsRoutes = require('./router/analytics');
const authRoutes = require('./router/auth');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Options de configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Potions',
      version: '1.0.0',
      description: 'Une API pour gérer des potions magiques',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
    ],
  },
  // Chemin vers les fichiers contenant les annotations swagger
  apis: ['./router/*.js']
};

const app = express();
app.use(express.json());
app.use(cors())
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use('/potions', potionsRoutes);
app.use('/auth', authRoutes);
app.use('/analytics', analyticsRoutes);

module.exports = app;