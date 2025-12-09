'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Offer {
    id: number;
    name: string;
    offer_type: string;
    bonus_percentage: number;
    min_deposit_eur: number;
    wagering_multiplier: number;
}

export default function OptimizationTeam() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [selectedOfferId, setSelectedOfferId] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
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

    const generateJSON = async () => {
        if (!selectedOfferId) {
            setMessage('❌ Please select an offer');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/offers/${selectedOfferId}/json`);
            setJsonOutput(JSON.stringify(response.data, null, 2));
            setMessage('✅ JSON generated successfully!');
        } catch (error) {
            setMessage('❌ Error generating JSON');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonOutput);
        setMessage('✅ Copied to clipboard!');
    };

    const downloadJSON = () => {
        const element = document.createElement('a');
        const file = new Blob([jsonOutput], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `offer_${selectedOfferId}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded p-4">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Generate JSON</h2>
                <p className="text-slate-300 text-sm">Select an offer to generate its complete JSON with all translations and currency conversions.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Offer</label>
                <select
                    value={selectedOfferId}
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
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
                <>
                    <button
                        onClick={generateJSON}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors"
                    >
                        {loading ? 'Generating...' : 'Generate JSON'}
                    </button>

                    {jsonOutput && (
                        <div className="space-y-3">
                            <div className="bg-slate-700 border border-slate-600 rounded p-4">
                                <h3 className="font-semibold text-slate-300 mb-3">Generated JSON Output</h3>
                                <pre className="bg-slate-800 p-4 rounded text-sm text-slate-300 overflow-auto max-h-96">
                                    {jsonOutput}
                                </pre>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-semibold transition-colors"
                                >
                                    📋 Copy to Clipboard
                                </button>
                                <button
                                    onClick={downloadJSON}
                                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-semibold transition-colors"
                                >
                                    ⬇️ Download JSON
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {message && (
                <div className="p-4 bg-slate-700 border border-slate-600 rounded text-center">
                    {message}
                </div>
            )}
        </div>
    );
}
