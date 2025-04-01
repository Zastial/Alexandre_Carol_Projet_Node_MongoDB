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
            { $group: { _id: "$category", averageScore: { $avg: "$score" } } }
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
            { $project: { strengthFlavorRatio: { $divide: ["$strength", "$flavor"] } } }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /analytics/search fonction de recherche avec 3 paramètres :
/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Recherche de potions par nom, ID de vendeur ou catégorie
 *     tags: [Analytics]
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Nom de la potion
 *         schema:
 *          type: string
 *         example: "Potion de force"
 *       - name: vendor_id
 *         in: query
 *         required: false
 *         description: ID du vendeur
 *         schema:
 *           type: string
 *           example: "12345"
 *       - name: category
 *         in: query
 *         required: false
 *         description: Catégorie de la potion
 *         schema:
 *           type: string
 *           example: "Soin"
 */
router.get('/search', async (req, res) => {
    const { name, vendor_id, category } = req.query;
    const query = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (vendor_id) query.vendor_id = vendor_id;
    if (category) query.category = category;

    try {
        const potions = await Potion.find(query);
        res.json(potions);
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