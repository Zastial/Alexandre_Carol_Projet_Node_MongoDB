const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Nom d'utilisateur
 *           minLength: 3
 *           maxLength: 30
 *         password:
 *           type: string
 *           description: Mot de passe de l'utilisateur
 *           minLength: 6
 *           format: password
 */

function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  // Vérification de présence et format du token
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return res.status(401).json({ error: 'Token d’authentification manquant ou invalide' });
  }

  // Vérification du token JWT
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Jeton non valide.' });
    }
    return res.status(500).json({ error: 'Erreur d’authentification' });
  }
}

// POST /auth/register  toujours passer les inputs user au sanitize()
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *        description: Erreur de validation
 *       500:
 *        description: Erreur système
 */
router.post('/register', [
    body('username').trim().escape()
        .notEmpty().withMessage('Le nom d’utilisateur est requis.')
        .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
        .notEmpty().withMessage('Le mot de passe est requis.')
        .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
    ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json({ message: 'Utilisateur créé' });
    } catch (err) {
      if (err.code === 11000) return res.status(500).json({ error: 'Erreur système' });
      res.status(400).json({ error: err.message });
    }
});

// POST /auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur connecté avec succès
 *       400:
 *        description: Erreur de validation
 *       500:
 *        description: Erreur système
 */
router.post('/login', async (req, res) => {
  // Extraction correcte des champs du body
  const { username, password } = req.body;
  
  // Recherche de l'utilisateur
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false, // à mettre sur true en prod (https)
    maxAge: 24 * 60 * 60 * 1000 // durée de vie 24h
  });

  res.json({ message: 'Connecté avec succès', token: token });
});

// GET /auth/logout
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Déconnecte un utilisateur
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Utilisateur déconnecté avec succès
 */
router.get('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Déconnecté' });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;