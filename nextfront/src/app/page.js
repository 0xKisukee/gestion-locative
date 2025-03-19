'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { isLoggedIn, getCurrentUser } from '@/lib/auth';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getCurrentUser());
    }
    setIsLoading(false);
  }, []);

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-400 rounded-3xl mx-4 sm:mx-8 my-8">
        <div className="container py-16 sm:py-24 px-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Simplifiez la gestion de vos locations
          </h1>
          
          {!isLoading && (
            user ? (
              <div>
                <p className="mt-6 text-lg leading-8 text-white/90">
                  Bonjour <span className="font-semibold">{user.username}</span> ! Votre espace personnel vous attend.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/dashboard" className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Accéder à mon espace
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="mt-6 text-lg leading-8 text-white/90">
                  Gérez vos biens, locataires et paiements en toute simplicité. Connectez-vous ou inscrivez-vous dès maintenant !
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/connexion" className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm5.707 6.707a1 1 0 00-1.414-1.414L5 10.586V7a1 1 0 00-2 0v6a1 1 0 001 1h6a1 1 0 000-2H7.414l2.293-2.293z" clipRule="evenodd" />
                    </svg>
                    Se connecter
                  </Link>
                  <Link href="/inscription" className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium flex items-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    S'inscrire
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" id="fonctionnalites">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir Gestion Locative ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestion des biens</h3>
              <p className="text-gray-600">Suivez et organisez vos propriétés en un seul endroit. Accédez à toutes les informations en quelques clics.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Locataires</h3>
              <p className="text-gray-600">Communiquez et gérez vos locataires efficacement. Gardez un historique complet des interactions.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Paiements</h3>
              <p className="text-gray-600">Suivez les loyers et paiements en temps réel. Générez des rapports détaillés en un instant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Ce que disent nos utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">5.0</span>
              </div>
              <p className="mt-4 text-gray-600 italic">"Cet outil a complètement transformé ma façon de gérer mes biens locatifs. C'est intuitif et efficace !"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">ML</div>
                <div className="testimonial-info">
                  <div className="testimonial-name">Marie L.</div>
                  <div className="testimonial-role">Propriétaire, Paris</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">4.5</span>
              </div>
              <p className="mt-4 text-gray-600 italic">"Je gère 15 appartements et cette plateforme m'a fait gagner des heures chaque semaine. Un vrai gain de temps !"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">TD</div>
                <div className="testimonial-info">
                  <div className="testimonial-name">Thomas D.</div>
                  <div className="testimonial-role">Investisseur, Lyon</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">5.0</span>
              </div>
              <p className="mt-4 text-gray-600 italic">"En tant que locataire, c'est très pratique pour suivre mes paiements et communiquer avec mon propriétaire !"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SB</div>
                <div className="testimonial-info">
                  <div className="testimonial-name">Sophie B.</div>
                  <div className="testimonial-role">Locataire, Bordeaux</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}