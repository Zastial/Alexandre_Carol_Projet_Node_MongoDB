const express = require('express');
const router = express.Router();
const Potion = require('../model/potion');

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

// GET /analytics/average-score-by-vendor aggregat du score moyen des vendeurs
/**
 * @swagger
 * /analytics/average_score_by_vendor:
 *   get:
 *     summary: Récupère le score moyen par vendeur
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Score moyen par vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID du vendeur
 *                   averageScore:
 *                     type: number
 *                     description: Score moyen
 *     500:
 *       description: Erreur serveur
 */
router.get('/average_score_by_vendor', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $group: { _id: "$vendor_id", averageScore: { $avg: "$score" } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/average-score-by-category aggregat du score moyen des categories
/**
 * @swagger
 * /analytics/average_score_by_category:
 *   get:
 *     summary: Récupère le score moyen par catégorie
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Score moyen par catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID de la catégorie
 *                   averageScore:
 *                     type: number
 *                     description: Score moyen
 */
router.get('/average_score_by_category', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $group: { _id: "$categories", averageScore: { $avg: "$score" } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/strength-flavor-ratio ratio entre force et parfum des potions
/**
 * @swagger
 * /analytics/strength_flavor_ratio:
 *   get:
 *     summary: Récupère le ratio force/parfum des potions
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Ratio force/parfum
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   strengthFlavorRatio:
 *                     type: number
 */
router.get('/strength_flavor_ratio', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $project: { strengthFlavorRatio: { $divide: ["$ratings.strength", "$ratings.flavor"] } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/search fonction de recherche avec 3 paramètres : 
// grouper par vendeur ou catégorie, metrique au choix (avg, sum, count), champ au choix (score, price, ratings).
/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Récupère les statistiques de recherche
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         required: true
 *         description: Champ pour grouper les résultats
 *         schema:
 *           type: string
 *           enum: [vendor_id, categories]
 *       - in: query
 *         name: metric
 *         required: true
 *         description: Métrique à calculer
 *         schema:
 *           type: string
 *           enum: [avg, sum, count]
 *       - in: query
 *         name: field
 *         required: true
 *         description: Champ à analyser
 *         schema:
 *           type: string
 *           enum: [score, price, ratings]
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 *       400:
 *         description: Erreur de validation des paramètres
 *       500:
 *        description: Erreur serveur
 */
router.get('/search', async (req, res) => {
    const { groupBy, metric, field } = req.query;

    if (!groupBy || !metric || !field) {
        return res.status(400).json({ error: 'Tous les paramètres sont requis.' });
    }

    const validMetrics = ['avg', 'sum', 'count'];
    if (!validMetrics.includes(metric)) {
        return res.status(400).json({ error: 'Métrique invalide. Utilisez avg, sum ou count.' });
    }

    try {
        const result = await Potion.aggregate([
            { $group: { _id: `$${groupBy}`, [metric]: { [`$${metric}`]: `$${field}` } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// grouper par vendeur (avg, sum, count), avec price
/**
 * @swagger
 * /analytics/group:
 *   get:
 *     summary: Récupère les statistiques de prix par vendeur
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Statistiques de prix par vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID du vendeur
 *                   averagePrice:
 *                     type: number
 *                     description: Prix moyen
 *                   totalCount:
 *                     type: number
 */
router.get('/group', async (req, res) => {
    try {
        const result = await Potion.aggregate([
            { $group: { _id: "$vendor_id", averagePrice: { $avg: "$price" }, totalCount: { $sum: 1 } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;