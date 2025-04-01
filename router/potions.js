const express = require('express');
const router = express.Router();
const Potion = require('../model/potion');
const { authMiddleware } = require('./auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Potion:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nom de la potion
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des ingrédients
 *         ratings:
 *           type: object
 *           properties:
 *             strength:
 *               type: number
 *             duration:
 *               type: number
 *             sideEffects:
 *               type: number
 */

// GET /potions : lire toutes les potions
/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupère la liste des potions
 *     tags: [Potions]
 *     responses:
 *       200:
 *         description: Liste des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */
router.get('/', async (req, res) => {
    try {
      const potions = await Potion.find();
      res.json(potions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// POST /potions : créer une nouvelle potion
/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Crée une nouvelle potion
 *     tags: [Potions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Potion'
 *     responses:
 *       201:
 *         description: Potion créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
      const newPotion = new Potion(req.body);
      const savedPotion = await newPotion.save();
      res.status(201).json(savedPotion);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

// PUT /potions/:id : mettre à jour une potion
/**
 * @swagger
 * /potions/{id}:
 *   put:
 *     summary: Met à jour une potion par son ID
 *     tags: [Potions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la potion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Potion'
 *     responses:
 *       200:
 *         description: Potion mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 */
router.put('/:id', async (req, res) => {
    try {
      const potion = await Potion.findById(req.params.id);
    
      potion.overwrite(req.body);
      await potion.save();

      if (!potion) return res.status(404).json({ error: 'Potion not found' });
      res.json(potion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
    
// DELETE /potions/:id : supprimer une potion
/**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     summary: Supprime une potion par son ID
 *     tags: [Potions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la potion
 *     responses:
 *       200:
 *         description: Potion supprimée avec succès
 */
router.delete('/:id', async (req, res) => {
    try {
      const deletedPotion = await Potion.findByIdAndDelete(req.params.id);
      if (!deletedPotion) return res.status(404).json({ error: 'Potion not found' });
      res.json(deletedPotion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// GET /potions/vendor/:vendor_id : toutes les potions d’un vendeur
/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     summary: Récupère toutes les potions d'un vendeur par son ID
 *     tags: [Potions]
 *     parameters:
 *       - name: vendor_id
 *         in: path
 *         required: true
 *         description: ID du vendeur
 *     responses:
 *       200:
 *         description: Liste des potions du vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */
router.get('/vendor/:vendor_id', async (req, res) => {
    try {
      const potions = await Potion.find({ vendor_id: req.params.vendor_id });
      res.json(potions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// GET /potions/price-range?min=X&max=Y : potions entre min et max
/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupère les potions dans une plage de prix donnée
 *     tags: [Potions]
 *     parameters:
 *       - name: min
 *         in: query
 *         required: true
 *         description: Prix minimum
 *       - name: max
 *         in: query
 *         required: true
 *         description: Prix maximum
 *     responses:
 *       200:
 *         description: Liste des potions dans la plage de prix
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */
router.get('/price-range', async (req, res) => {
    const min = parseFloat(req.query.min);
    const max = parseFloat(req.query.max);
  
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({ error: 'Invalid price range' });
    }
  
    try {
      const potions = await Potion.find({ price: { $gte: min, $lte: max } });
      res.json(potions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// GET /potions/:id : lire une potion par ID
/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupère une potion par son ID
 *     tags: [Potions]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la potion
 *     responses:
 *       200:
 *         description: Détails de la potion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 */
router.get('/:id', async (req, res) => {
  try {
    const potion = await Potion.findById(req.params.id);
    if (!potion) return res.status(404).json({ error: 'Potion not found' });
    res.json(potion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;