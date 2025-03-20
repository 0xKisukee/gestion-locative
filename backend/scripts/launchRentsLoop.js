// Chargement des variables d'environnement
require('dotenv').config();

const { createRentsLoop } = require('../services/payment.service.js');

// Exécution de la fonction
async function main() {
    try {
        console.log(`Démarrage de la création des nouveaux loyers : ${new Date()}`);
        const payments = await createRentsLoop();
        console.log(`Création des loyers terminée: ${payments.length} paiements créés`);
        process.exit(0);
    } catch (error) {
        console.error(`Erreur lors de la création des loyers: ${error.message}`);
        process.exit(1);
    }
}

main();
