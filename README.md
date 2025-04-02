# Projet MongoDB - API Potions

NOM : ALEXANDRE CAROL \
CLASSE: IW 4e année

Une API pour gérer des potions magiques avec Node.js et MongoDB.

## Prérequis
Avant d'exécuter ce projet, assurez-vous d'avoir installé les éléments suivants :

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- npm (installé avec Node.js)

## Installation

1. Clonez le dépôt :
   ```sh
   git clone https://github.com/Zastial/Projet_Node_MongoDB.git
   cd Projet_Node_MongoDB
   ```
2. Installez les dépendances :
   ```sh
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/potions
   ```

## Lancement de MongoDB

Pour démarrer MongoDB localement :

1. Démarrez le service MongoDB :
   ```sh
   mongod
   ```
2. Dans le shell MongoDB, créez la base de données :
   ```sh
   mongosh
   use esgi
   ```

## Lancement du serveur

### Mode développement (avec nodemon) :
```sh
npm run dev
```

### Mode production :
```sh
npm start
```

Le serveur sera accessible à l'adresse : [http://localhost:3000](http://localhost:3000)

## Documentation API
La documentation Swagger de l'API est disponible à l'adresse :
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Fonctionnalités
- Gestion des potions (CRUD)
- Authentification (login/register/logout)
- Statistiques et analyses
- Recherche et filtrage des potions

