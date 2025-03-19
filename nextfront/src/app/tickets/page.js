'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import AuthCheck from '@/components/AuthCheck';
import { getCurrentUser } from '@/lib/auth';
import { apiCall } from '@/lib/api';

export default function TicketsPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [properties, setProperties] = useState([]);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [ticketMessages, setTicketMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [showTicketDetailsModal, setShowTicketDetailsModal] = useState(false);
    const [newTicketData, setNewTicketData] = useState({
        propertyId: '',
        category: 'repair',
        description: ''
    });

    const messagesContainerRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const initTicketsPage = async () => {
            try {
                setIsLoading(true);
                const currentUser = getCurrentUser();

                if (!currentUser) {
                    router.push('/connexion');
                    return;
                }

                setUser(currentUser);
                await loadTickets();
            } catch (error) {
                console.error('Erreur lors du chargement de la page tickets:', error);
                setError(error.message || 'Une erreur est survenue lors du chargement des tickets.');
            } finally {
                setIsLoading(false);
            }
        };

        initTicketsPage();
    }, [router]);



    // Effet secondaire pour charger les propriétés une fois que l'utilisateur est défini
    useEffect(() => {
        // Si l'utilisateur est défini
        if (user) {
            // Fonction asynchrone définie à l'intérieur du useEffect
            const fetchProperties = async () => {
                try {
                    await loadProperties();
                } catch (error) {
                    console.error('Erreur dans fetchProperties:', error);
                }
            };

            // Appel de la fonction asynchrone
            fetchProperties();
        }
    }, [user]); // Dépendance: user

    // Scroll to bottom of messages when new messages are loaded
    useEffect(() => {
        if (messagesContainerRef.current && ticketMessages.length > 0) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [ticketMessages]);

    const loadTickets = async () => {
        try {
            const tickets = await apiCall('/api/ticket/myTickets');
            setTickets(tickets);
        } catch (error) {
            console.error('Erreur lors du chargement des tickets:', error);
            setError(error.message || 'Impossible de charger vos tickets.');
        }
    };

    const loadProperties = async () => {
        try {
            let properties;
            if (user?.role === 'owner') {
                properties = await apiCall('/api/property/getMyProperties');
            } else if (user?.role === 'tenant') {
                const property = await apiCall('/api/user/myProperty');
                properties = [property];
            } else {
                throw new Error('Rôle utilisateur non reconnu');
            }
            setProperties(properties);

            // Set default property for new ticket if available
            if (properties.length > 0) {
                setNewTicketData(prevState => ({
                    ...prevState,
                    propertyId: properties[0].id
                }));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des propriétés:', error);
        }
    };

    const showTicketDetails = async (ticketId) => {
        try {
            const ticket = await apiCall(`/api/ticket/${ticketId}`);
            const messages = await apiCall(`/api/ticket/${ticketId}/messages`);

            setCurrentTicket(ticket);
            setTicketMessages(messages);
            setShowTicketDetailsModal(true);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de charger les détails du ticket : ' + (error.message || 'Erreur inconnue'));
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await apiCall(`/api/ticket/${currentTicket.id}/sendMessage`, 'POST', {
                content: newMessage
            });

            // Reload messages
            const messages = await apiCall(`/api/ticket/${currentTicket.id}/messages`);
            setTicketMessages(messages);
            setNewMessage('');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            alert('Erreur lors de l\'envoi du message: ' + (error.message || 'Erreur inconnue'));
        }
    };

    const createTicket = async (e) => {
        e.preventDefault();

        const { propertyId, category, description } = newTicketData;

        if (!propertyId || !category || !description.trim()) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            await apiCall('/api/ticket/create', 'POST', {
                propertyId: parseInt(propertyId),
                category,
                description
            });

            // Reset form and close modal
            setNewTicketData({
                propertyId: properties.length > 0 ? properties[0].id : '',
                category: 'repair',
                description: ''
            });
            setShowNewTicketModal(false);

            // Reload tickets
            await loadTickets();
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            alert('Erreur lors de la création du ticket: ' + (error.message || 'Erreur inconnue'));
        }
    };

    const updateTicketStatus = async (ticketId, status) => {
        try {
            await apiCall(`/api/ticket/${ticketId}/status`, 'PATCH', { status });

            if (showTicketDetailsModal) {
                setShowTicketDetailsModal(false);
            }

            await loadTickets();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            alert('Erreur lors de la mise à jour du statut: ' + (error.message || 'Erreur inconnue'));
        }
    };

    const handleCloseTicket = (ticketId) => {
        if (confirm('Êtes-vous sûr de vouloir clôturer ce ticket ?')) {
            updateTicketStatus(ticketId, 'closed');
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            repair: 'Réparation',
            payment: 'Paiement',
            other: 'Autre'
        };
        return labels[category] || category;
    };

    const getStatusLabel = (status) => {
        const labels = {
            opened: 'Ouvert',
            closed: 'Clôturé'
        };
        return labels[status] || status;
    };

    const getStatusBadge = (status) => {
        if (status === 'opened') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Ouvert
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Clôturé
                </span>
            );
        }
    };

    // Modal for new ticket
    const NewTicketModal = () => {
        if (!showNewTicketModal) return null;

        return (
            <div
                className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center p-4"
                onClick={() => setShowNewTicketModal(false)}
            >
                <div
                    className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-blue-50 p-4 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-blue-600 flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Nouveau Ticket
                        </h3>
                        <button
                            onClick={() => setShowNewTicketModal(false)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={createTicket} className="p-4">
                        <div className="mb-4">
                            <label htmlFor="propertySelect" className="block text-sm font-medium text-gray-700 mb-1">
                                Propriété
                            </label>
                            <select
                                id="propertySelect"
                                value={newTicketData.propertyId}
                                onChange={(e) => setNewTicketData({ ...newTicketData, propertyId: e.target.value })}
                                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                {properties.length === 0 ? (
                                    <option value="">Chargement des propriétés...</option>
                                ) : (
                                    properties.map(property => (
                                        <option key={property.id} value={property.id}>
                                            {property.address}, {property.city}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-1">
                                Catégorie
                            </label>
                            <select
                                id="categorySelect"
                                value={newTicketData.category}
                                onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="repair">Réparation</option>
                                <option value="payment">Paiement</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={newTicketData.description}
                                onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                                rows="3"
                                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            ></textarea>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 -mx-4 -mb-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowNewTicketModal(false)}
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Créer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Modal for ticket details
    const TicketDetailsModal = () => {
        if (!showTicketDetailsModal || !currentTicket) return null;
        
        // Fermer la modale avec la touche Escape
        return (
            <div
                className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowTicketDetailsModal(false)}
            >
                <div
                    className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-blue-50 p-4 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-blue-600 flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                            </svg>
                            Détails du Ticket
                        </h3>
                        <button
                            onClick={() => setShowTicketDetailsModal(false)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Section Informations */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-blue-600 font-medium flex items-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Informations
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="flex"><span className="font-semibold w-24">ID:</span> {currentTicket.id}</p>
                                    <p className="flex"><span className="font-semibold w-24">Propriété:</span> {currentTicket.Property?.address || 'N/A'}</p>
                                    <p className="flex"><span className="font-semibold w-24">Catégorie:</span> {getCategoryLabel(currentTicket.category)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="flex"><span className="font-semibold w-36">Statut:</span> {getStatusLabel(currentTicket.status)}</p>
                                    <p className="flex"><span className="font-semibold w-36">Date de création:</span> {new Date(currentTicket.createdAt).toLocaleString()}</p>
                                    <p className="flex"><span className="font-semibold w-36">Date de mise à jour:</span> {new Date(currentTicket.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section Description */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-blue-600 font-medium flex items-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Description
                            </h4>
                            <p className="text-gray-700">{currentTicket.description}</p>
                        </div>

                        {/* Section Messages */}
                        <div>
                            <h4 className="text-blue-600 font-medium flex items-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                    />
                                </svg>
                                Messages
                            </h4>

                            <div
                                ref={messagesContainerRef}
                                className="space-y-3 mb-5 max-h-60 overflow-y-auto"
                            >

                                {/* Liste des messages */}
                                {ticketMessages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4">Aucun message pour le moment</div>
                                ) : (
                                    ticketMessages.map((message, index) => (
                                        <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                                            {message.isSystem ? (
                                                <div className="bg-blue-50 p-3 text-blue-700">
                                                    {message.content}
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                                                        <span className="font-medium">{message.User?.username}</span>
                                                        <span className="text-sm text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="p-4 bg-white">
                                                        {message.content}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Formulaire de message */}
                            {currentTicket.status === 'opened' && (
                                <div className="mt-4">
                                    <form onSubmit={sendMessage} className="flex">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Votre message..."
                                            className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 flex items-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                            Envoyer
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowTicketDetailsModal(false)}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Fermer
                        </button>

                        {currentTicket.status === 'opened' && (
                            <button
                                type="button"
                                onClick={() => handleCloseTicket(currentTicket.id)}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Clôturer le ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthCheck>
            <PageContainer>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-blue-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Gestion des Tickets
                        </h1>
                        <button
                            onClick={() => setShowNewTicketModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Nouveau Ticket
                        </button>
                    </div>

                    {/* Loading spinner */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                            <p className="mt-3 text-gray-600">Chargement des tickets...</p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && !isLoading && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* No tickets message */}
                    {!isLoading && !error && tickets.length === 0 && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-blue-800">Vous n'avez encore aucun ticket.</span>
                            </div>
                        </div>
                    )}

                    {/* Tickets table */}
                    {!isLoading && !error && tickets.length > 0 && (
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-medium text-blue-600">Liste des tickets</h2>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {tickets.length}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Propriété
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Catégorie
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tickets.map((ticket, index) => (
                                            <tr
                                                key={ticket.id}
                                                className="hover:bg-gray-50 transition-all duration-200 group hover:-translate-y-1 hover:shadow-md"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{ticket.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{ticket.Property?.address || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{getCategoryLabel(ticket.category)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(ticket.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{new Date(ticket.updatedAt).toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => showTicketDetails(ticket.id)}
                                                            className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                                            title="Voir détails"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        {ticket.status === 'opened' && (
                                                            <button
                                                                onClick={() => handleCloseTicket(ticket.id)}
                                                                className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                                                                title="Clôturer ticket"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Modals */}
                    <NewTicketModal />
                    <TicketDetailsModal />
                </div>
            </PageContainer>
        </AuthCheck>
    );
}