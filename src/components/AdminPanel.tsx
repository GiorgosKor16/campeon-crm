'use client';

import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';

const CURRENCIES = ['EUR', 'USD', 'CAD', 'AUD', 'NZD', 'GBP', 'BRL', 'NOK', 'PEN', 'CLP', 'MXN', 'CHF', 'ZAR', 'PLN', 'AZN', 'TRY', 'JPY', 'KZT', 'RUB', 'HUF', 'UZS'];
const PROVIDERS = ['PRAGMATIC', 'BETSOFT'];

interface CurrencyTable {
    id: string;
    name: string;
    values: Record<string, number>;
}

interface StableConfigWithVariations {
    provider: string;
    cost: CurrencyTable[];
    maximum_amount: CurrencyTable[];
    minimum_amount: CurrencyTable[];
    minimum_stake_to_wager: CurrencyTable[];
    maximum_stake_to_wager: CurrencyTable[];
    maximum_withdraw: CurrencyTable[];
}

export default function AdminPanel() {
    const [selectedProvider, setSelectedProvider] = useState('PRAGMATIC');
    const [activeTab, setActiveTab] = useState<'cost' | 'amounts' | 'stakes' | 'withdrawals'>('cost');

    const defaultTable: CurrencyTable = {
        id: '1',
        name: 'Table 1',
        values: Object.fromEntries(CURRENCIES.map(c => [c, 0.2]))
    };

    const [pragmaticConfig, setPragmaticConfig] = useState<StableConfigWithVariations>({
        provider: 'PRAGMATIC',
        cost: [defaultTable],
        maximum_amount: [defaultTable],
        minimum_amount: [defaultTable],
        minimum_stake_to_wager: [defaultTable],
        maximum_stake_to_wager: [defaultTable],
        maximum_withdraw: [defaultTable],
    });

    const [betsoftConfig, setBetsoftConfig] = useState<StableConfigWithVariations>({
        provider: 'BETSOFT',
        cost: [defaultTable],
        maximum_amount: [defaultTable],
        minimum_amount: [defaultTable],
        minimum_stake_to_wager: [defaultTable],
        maximum_stake_to_wager: [defaultTable],
        maximum_withdraw: [defaultTable],
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const config = selectedProvider === 'PRAGMATIC' ? pragmaticConfig : betsoftConfig;
    const setConfig = selectedProvider === 'PRAGMATIC' ? setPragmaticConfig : setBetsoftConfig;

    const handleCurrencyChange = (field: string, tableId: string, currency: string, value: number) => {
        setConfig(prev => ({
            ...prev,
            [field]: (prev[field as keyof StableConfigWithVariations] as CurrencyTable[]).map(table =>
                table.id === tableId
                    ? { ...table, values: { ...table.values, [currency]: value } }
                    : table
            )
        }));
    };

    const handleRemoveCurrency = (field: string, tableId: string, currency: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: (prev[field as keyof StableConfigWithVariations] as CurrencyTable[]).map(table =>
                table.id === tableId
                    ? { ...table, values: Object.fromEntries(Object.entries(table.values).filter(([k]) => k !== currency)) }
                    : table
            )
        }));
    };

    const handleAddCurrency = (field: string, tableId: string) => {
        const tables = (config[field as keyof StableConfigWithVariations] as CurrencyTable[]);
        const currentTable = tables.find(t => t.id === tableId);
        if (!currentTable) return;

        const unusedCurrencies = CURRENCIES.filter(c => !(c in currentTable.values));
        if (unusedCurrencies.length > 0) {
            setConfig(prev => ({
                ...prev,
                [field]: (prev[field as keyof StableConfigWithVariations] as CurrencyTable[]).map(table =>
                    table.id === tableId
                        ? { ...table, values: { ...table.values, [unusedCurrencies[0]]: 0 } }
                        : table
                )
            }));
        }
    };

    const handleAddTable = (field: string) => {
        const tables = (config[field as keyof StableConfigWithVariations] as CurrencyTable[]);
        const newId = String(Math.max(0, ...tables.map(t => parseInt(t.id))) + 1);
        const newTable: CurrencyTable = {
            id: newId,
            name: `Table ${newId}`,
            values: { 'EUR': 0.25 }
        };
        setConfig(prev => ({
            ...prev,
            [field]: [...(prev[field as keyof StableConfigWithVariations] as CurrencyTable[]), newTable]
        }));
    };

    const handleRemoveTable = (field: string, tableId: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: (prev[field as keyof StableConfigWithVariations] as CurrencyTable[]).filter(t => t.id !== tableId)
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_ENDPOINTS.BASE_URL}/api/stable-config`, config);
            setMessage(`✅ ${selectedProvider} stable values saved successfully!`);
            setTimeout(() => setMessage(''), 4000);
        } catch (error: any) {
            setMessage(`❌ Error: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderSettingTable = (field: string, title: string, description: string) => {
        let tables = (config[field as keyof StableConfigWithVariations] as CurrencyTable[]);

        // Sort tables by EUR value (ascending)
        tables = [...tables].sort((a, b) => (a.values['EUR'] || 0) - (b.values['EUR'] || 0));

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 p-6 rounded-xl">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-100 mb-1">{title}</h3>
                            <p className="text-sm text-slate-400">{description}</p>
                        </div>
                        <button
                            onClick={() => handleAddTable(field)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
                        >
                            ➕ Add Table
                        </button>
                    </div>
                </div>

                {/* Tables displayed side-by-side - flex-row with flex-nowrap */}
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem', width: '100%' }}>
                    {tables.map((table, tableIdx) => {
                        const usedCurrencies = Object.keys(table.values).sort();
                        const unusedCurrencies = CURRENCIES.filter(c => !(c in table.values));

                        return (
                            <div key={table.id} style={{ flexShrink: 0 }} className="bg-gradient-to-br from-slate-800 to-slate-900 border-l-4 border-cyan-500 rounded-xl p-5 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                                <div className="flex justify-between items-center mb-4 gap-3 whitespace-nowrap">
                                    <div>
                                        <h4 className="font-bold text-slate-100">{table.name}</h4>
                                        <p className="text-xs text-cyan-400 font-semibold">EUR: {table.values['EUR']?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    {tables.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveTable(field, table.id)}
                                            className="px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg flex-shrink-0 transition-all duration-200 transform hover:scale-110"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <table className="border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-700/50 border-b border-slate-600">
                                            <th className="px-4 py-2 text-left font-bold text-cyan-300 border-r border-slate-600">Currency</th>
                                            <th className="px-4 py-2 text-center font-bold text-green-300">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usedCurrencies.map((currency, idx) => (
                                            <tr key={currency} className={`border-b border-slate-700 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'hover:bg-slate-700/30'}`}>
                                                <td className="px-4 py-2 font-bold text-cyan-300 border-r border-slate-700 bg-slate-800">
                                                    {currency}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={table.values[currency] || ''}
                                                        onChange={(e) => handleCurrencyChange(field, table.id, currency, parseFloat(e.target.value) || 0)}
                                                        className="w-20 bg-slate-600 text-white text-center px-3 py-2 rounded-lg text-xs border-2 border-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleAddCurrency(field, table.id)}
                                        disabled={unusedCurrencies.length === 0}
                                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100"
                                    >
                                        ➕ Add Currency
                                    </button>
                                    {usedCurrencies.length > 0 && (
                                        <button
                                            onClick={() => handleRemoveCurrency(field, table.id, usedCurrencies[usedCurrencies.length - 1])}
                                            className="px-3 py-2 bg-red-600/70 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all transform hover:scale-105"
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>

                                {usedCurrencies.length === 0 && (
                                    <div className="text-center py-4 text-slate-500 text-xs italic">
                                        No currencies added
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    ⚙️ Configuration Center
                </h2>
                <p className="text-slate-400">Manage multiple pricing tables with currency-specific values</p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Select Provider</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setSelectedProvider('PRAGMATIC')}
                        className={`relative group overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 ${selectedProvider === 'PRAGMATIC'
                                ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900'
                                : ''
                            }`}
                    >
                        <div className={`absolute inset-0 transition-all duration-500 ${selectedProvider === 'PRAGMATIC'
                                ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500'
                                : 'bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-slate-600 group-hover:to-slate-500'
                            }`} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="relative z-10 py-6 px-6 flex flex-col items-center gap-3">
                            <span className="text-4xl">🎰</span>
                            <div>
                                <div className={`font-black text-xl ${selectedProvider === 'PRAGMATIC' ? 'text-white' : 'text-slate-300 group-hover:text-white'} transition-colors`}>
                                    PRAGMATIC
                                </div>
                                <div className={`text-xs ${selectedProvider === 'PRAGMATIC' ? 'text-blue-100' : 'text-slate-400'} transition-colors`}>
                                    {selectedProvider === 'PRAGMATIC' ? '✓ Active' : 'Click to select'}
                                </div>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setSelectedProvider('BETSOFT')}
                        className={`relative group overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 ${selectedProvider === 'BETSOFT'
                                ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900'
                                : ''
                            }`}
                    >
                        <div className={`absolute inset-0 transition-all duration-500 ${selectedProvider === 'BETSOFT'
                                ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500'
                                : 'bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-slate-600 group-hover:to-slate-500'
                            }`} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="relative z-10 py-6 px-6 flex flex-col items-center gap-3">
                            <span className="text-4xl">🎲</span>
                            <div>
                                <div className={`font-black text-xl ${selectedProvider === 'BETSOFT' ? 'text-white' : 'text-slate-300 group-hover:text-white'} transition-colors`}>
                                    BETSOFT
                                </div>
                                <div className={`text-xs ${selectedProvider === 'BETSOFT' ? 'text-purple-100' : 'text-slate-400'} transition-colors`}>
                                    {selectedProvider === 'BETSOFT' ? '✓ Active' : 'Click to select'}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Configuration Section</h3>
                <div className="grid grid-cols-4 gap-3">
                    <button
                        onClick={() => setActiveTab('cost')}
                        className={`relative group rounded-xl overflow-hidden transition-all duration-400 transform ${activeTab === 'cost' ? 'scale-105' : 'hover:scale-102'
                            }`}
                    >
                        <div className={`absolute inset-0 transition-all duration-400 ${activeTab === 'cost'
                                ? 'bg-gradient-to-br from-blue-600 to-cyan-500'
                                : 'bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-slate-600 group-hover:to-slate-500'
                            }`} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                        <div className={`relative z-10 py-4 px-4 flex flex-col items-center gap-2 border-2 transition-all ${activeTab === 'cost'
                                ? 'border-blue-300 shadow-2xl shadow-blue-500/30'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}>
                            <span className="text-2xl">💰</span>
                            <div className={`font-bold text-sm ${activeTab === 'cost' ? 'text-white' : 'text-slate-300'} transition-colors text-center`}>
                                Cost
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('amounts')}
                        className={`relative group rounded-xl overflow-hidden transition-all duration-400 transform ${activeTab === 'amounts' ? 'scale-105' : 'hover:scale-102'
                            }`}
                    >
                        <div className={`absolute inset-0 transition-all duration-400 ${activeTab === 'amounts'
                                ? 'bg-gradient-to-br from-green-600 to-emerald-500'
                                : 'bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-slate-600 group-hover:to-slate-500'
                            }`} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                        <div className={`relative z-10 py-4 px-4 flex flex-col items-center gap-2 border-2 transition-all ${activeTab === 'amounts'
                                ? 'border-green-300 shadow-2xl shadow-green-500/30'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}>
                            <span className="text-2xl">💵</span>
                            <div className={`font-bold text-sm ${activeTab === 'amounts' ? 'text-white' : 'text-slate-300'} transition-colors text-center`}>
                                Amounts
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('stakes')}
                        className={`relative group rounded-xl overflow-hidden transition-all duration-400 transform ${activeTab === 'stakes' ? 'scale-105' : 'hover:scale-102'
                            }`}
                    >
                        <div className={`absolute inset-0 transition-all duration-400 ${activeTab === 'stakes'
                                ? 'bg-gradient-to-br from-yellow-600 to-orange-500'
                                : 'bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-slate-600 group-hover:to-slate-500'
                            }`} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                        <div className={`relative z-10 py-4 px-4 flex flex-col items-center gap-2 border-2 transition-all ${activeTab === 'stakes'
                                ? 'border-yellow-300 shadow-2xl shadow-yellow-500/30'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}>
                            <span className="text-2xl">🎯</span>
                            <div className={`font-bold text-sm ${activeTab === 'stakes' ? 'text-white' : 'text-slate-300'} transition-colors text-center`}>
                                Stakes
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('withdrawals')}
                        className={`relative group rounded-xl overflow-hidden transition-all duration-400 transform ${activeTab === 'withdrawals' ? 'scale-105' : 'hover:scale-102'
                            }`}
                    >
                        <div className={`absolute inset-0 transition-all duration-400 ${activeTab === 'withdrawals'
                                ? 'bg-gradient-to-br from-red-600 to-pink-500'
                                : 'bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-slate-600 group-hover:to-slate-500'
                            }`} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                        <div className={`relative z-10 py-4 px-4 flex flex-col items-center gap-2 border-2 transition-all ${activeTab === 'withdrawals'
                                ? 'border-red-300 shadow-2xl shadow-red-500/30'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}>
                            <span className="text-2xl">🏦</span>
                            <div className={`font-bold text-sm ${activeTab === 'withdrawals' ? 'text-white' : 'text-slate-300'} transition-colors text-center`}>
                                Withdrawals
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
                {activeTab === 'cost' && renderSettingTable('cost', '💰 Cost Per Player', 'How much you pay (in EUR) for each player receiving this bonus')}
                {activeTab === 'amounts' && (
                    <div className="space-y-8">
                        {renderSettingTable('minimum_amount', '💵 Minimum Bonus Amount', 'Smallest bonus value per currency')}
                        {renderSettingTable('maximum_amount', '💵 Maximum Bonus Amount', 'Largest bonus value per currency')}
                    </div>
                )}
                {activeTab === 'stakes' && (
                    <div className="space-y-8">
                        {renderSettingTable('minimum_stake_to_wager', '🎯 Minimum Stake', 'Smallest bet amount allowed')}
                        {renderSettingTable('maximum_stake_to_wager', '🎯 Maximum Stake', 'Largest bet amount allowed')}
                    </div>
                )}
                {activeTab === 'withdrawals' && renderSettingTable('maximum_withdraw', '🏦 Maximum Withdrawal Amount', 'Max amount player can withdraw from bonus winnings')}
            </div>

            {/* Status Message */}
            {message && (
                <div className={`p-6 rounded-xl font-semibold text-center backdrop-blur-sm border transition-all ${message.startsWith('✅')
                    ? 'bg-green-900/30 text-green-300 border-green-700'
                    : 'bg-red-900/30 text-red-300 border-red-700'
                    }`}>
                    {message}
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full relative overflow-hidden group py-4 px-6 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-emerald-500/50"
            >
                <span className="relative z-10">{loading ? '⏳ Saving...' : `✅ Save ${selectedProvider} Values`}</span>
            </button>
        </div>
    );
}