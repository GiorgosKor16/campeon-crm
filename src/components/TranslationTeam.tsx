'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Offer {
    id: number;
    name: string;
    offer_type: string;
}

interface Translation {
    language: string;
    offer_name: string;
    offer_description: string;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
];

export default function TranslationTeam() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [selectedOfferId, setSelectedOfferId] = useState('');
    const [translations, setTranslations] = useState<Translation[]>(
        LANGUAGES.map(lang => ({
            language: lang.code,
            offer_name: '',
            offer_description: '',
        }))
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/offers');
            setOffers(response.data);
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    const handleTranslationChange = (index: number, field: string, value: string) => {
        const updatedTranslations = [...translations];
        updatedTranslations[index] = {
            ...updatedTranslations[index],
            [field]: value,
        };
        setTranslations(updatedTranslations);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOfferId) {
            setMessage('❌ Please select an offer');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`http://localhost:8000/api/offers/${selectedOfferId}/translations`, {
                translations,
            });
            setMessage('✅ Translations saved successfully!');
        } catch (error) {
            setMessage('❌ Error saving translations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded p-4">
                <h2 className="text-xl font-bold text-green-400 mb-4">Add Translations</h2>
                <p className="text-slate-300 text-sm">Select an offer and provide translations in multiple languages.</p>
            </div>

            {/* Offer Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Offer</label>
                <select
                    value={selectedOfferId}
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-green-500"
                >
                    <option value="">Choose an offer...</option>
                    {offers.map(offer => (
                        <option key={offer.id} value={offer.id}>
                            {offer.name} ({offer.offer_type})
                        </option>
                    ))}
                </select>
            </div>

            {selectedOfferId && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Translations Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {translations.map((trans, index) => (
                            <div key={trans.language} className="bg-slate-700/30 border border-slate-600 rounded p-4">
                                <h3 className="font-semibold text-green-400 mb-4">
                                    {LANGUAGES.find(l => l.code === trans.language)?.name}
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Offer Name</label>
                                        <input
                                            type="text"
                                            value={trans.offer_name}
                                            onChange={(e) => handleTranslationChange(index, 'offer_name', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
                                            placeholder="Enter translated name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                                        <textarea
                                            value={trans.offer_description}
                                            onChange={(e) => handleTranslationChange(index, 'offer_description', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
                                            rows={2}
                                            placeholder="Enter translated description"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Translations'}
                    </button>

                    {message && (
                        <div className="p-4 bg-slate-700 border border-slate-600 rounded text-center">
                            {message}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}
