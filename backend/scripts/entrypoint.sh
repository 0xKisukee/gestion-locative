#!/bin/bash

# Écrire les variables d'environnement dans /etc/environment
env >> /etc/environment

# Démarrage du service cron
service cron start

# Afficher la crontab configurée (pour vérification)
echo "Crontab configurée:"
crontab -l

# Démarrage de l'application Node.js
echo "Démarrage de l'application..."
exec npm start