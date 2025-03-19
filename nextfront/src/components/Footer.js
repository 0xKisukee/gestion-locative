import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1C] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Section Gestion Locative */}
          <div>
            <h5 className="text-lg font-medium mb-4">Gestion Locative</h5>
            <p className="text-gray-300">
              La solution complète pour la gestion de vos biens immobiliers et de vos locataires.
            </p>
          </div>

          {/* Section Liens rapides */}
          <div>
            <h6 className="text-lg font-medium mb-4">Liens rapides</h6>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link>
              <Link href="/fonctionnalites" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</Link>
              <Link href="/tarifs" className="text-gray-300 hover:text-white transition-colors">Tarifs</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Section Contact */}
          <div>
            <h6 className="text-lg font-medium mb-4">Contact</h6>
            <div className="flex flex-col space-y-2 text-gray-300">
              <span>contact@gestion-locative.fr</span>
              <span>01 23 45 67 89</span>
              <span>123 Rue de Paris, 75000 Paris</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t border-gray-800 text-center">
          <small className="text-gray-400">© {new Date().getFullYear()} Gestion Locative - Tous droits réservés</small>
        </div>
      </div>
    </footer>
  );
}