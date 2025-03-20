FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y cron

RUN mkdir -p /app/logs

# Positionnement des droits
RUN chmod +x ./scripts/launchRentsLoop.js
RUN chmod +x ./scripts/entrypoint.sh

# Copie du fichier crontab dans le conteneur
COPY crontab /etc/cron.d/app-crontab

# Configuration des permissions du fichier crontab
RUN chmod 0644 /etc/cron.d/app-crontab

# Installation de la crontab, sinon le crontab ne tourne pas (à analyser)
RUN crontab /etc/cron.d/app-crontab

EXPOSE 3000

# Utilisation de l'entrypoint pour démarrer cron et l'application
ENTRYPOINT ["./scripts/entrypoint.sh"]