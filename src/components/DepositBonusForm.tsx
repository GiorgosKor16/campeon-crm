'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/api-config';

const CURRENCIES = ['EUR', 'USD', 'CAD', 'AUD', 'BRL', 'NOK', 'NZD', 'CLP', 'MXN', 'GBP', 'PLN', 'PEN', 'ZAR', 'CHF', 'NGN', 'JPY', 'AZN', 'TRY', 'KZT', 'RUB', 'UZS'];
const BONUS_TYPES_OPTIONS = ['cost', 'free_bet', 'cash'];

interface DepositBonusData {
    // Basic info
    id: string;
    name_en: string;
    description_en: string;
    provider: string;
    brand: string;
    category: string;
    triggerType: string;

    // Deposit specific
    depositCount: string; // 1, 2, 3, etc.
    minimumAmount: string;
    percentage: string;
    bonusType: string; // cost, free_bet, cash
    duration: string; // Default 7d
    gameName: string; // Game name (required)
    selectedCostTable: string; // EUR cost value to select

    // Per-currency tables
    cost: Record<string, number>;
    multipliers: Record<string, number>;
    maximumBets: Record<string, number>;
    maximumWithdraw: Record<string, number>;

    // Schedule
    scheduleFrom: string;
    scheduleTo: string;
}

interface CurrencyTable {
    id: string;
    name: string;
    values: Record<string, number>;
}

export default function DepositBonusForm() {
    const [formData, setFormData] = useState<DepositBonusData>({
        id: '',
        name_en: '',
        description_en: '',
        provider: 'PRAGMATIC',
        brand: 'PRAGMATIC',
        category: 'GAMES',
        triggerType: 'deposit',
        depositCount: '1',
        minimumAmount: '25',
        percentage: '100',
        bonusType: 'cost',
        duration: '7d',
        gameName: '',
        selectedCostTable: '',
        cost: Object.fromEntries(CURRENCIES.map(c => [c, 0])),
        multipliers: Object.fromEntries(CURRENCIES.map(c => [c, 0])),
        maximumBets: Object.fromEntries(CURRENCIES.map(c => [c, 200])),
        maximumWithdraw: Object.fromEntries(CURRENCIES.map(c => [c, 100])),
        scheduleFrom: '',
        scheduleTo: '',
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'multipliers' | 'bets' | 'withdraw' | 'schedule'>('basic');
    const [costTables, setCostTables] = useState<CurrencyTable[]>([]);
    const [loadingCosts, setLoadingCosts] = useState(false);

    // Fetch cost tables when provider changes
    useEffect(() => {
        const fetchCostTables = async () => {
            setLoadingCosts(true);
            try {
                const response = await axios.get(
                    `${API_ENDPOINTS.BASE_URL}/api/stable-config/${formData.provider}`
                );
                if (response.data?.cost) {
                    setCostTables(response.data.cost);
                }
            } catch (error) {
                console.log('Error fetching cost tables:', error);
            } finally {
                setLoadingCosts(false);
            }
        };

        fetchCostTables();
    }, [formData.provider]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // When cost table is selected, populate cost and multiplier
    const handleSelectCostTable = (tableId: string) => {
        const selectedTable = costTables.find(t => t.id === tableId);
        if (selectedTable) {
            setFormData(prev => ({
                ...prev,
                selectedCostTable: tableId,
                cost: selectedTable.values,
                multipliers: { ...selectedTable.values } // Same as cost for now
            }));
        }
    };

    const handleCurrencyChange = (field: 'multipliers' | 'maximumBets' | 'maximumWithdraw', currency: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [currency]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name_en.trim()) {
                setMessage('❌ Bonus name is required');
                setLoading(false);
                return;
            }

            if (!formData.gameName.trim()) {
                setMessage('❌ Game name is required');
                setLoading(false);
                return;
            }

            if (!formData.selectedCostTable) {
                setMessage('❌ Please select a cost table');
                setLoading(false);
                return;
            }

            const payload: any = {
                id: formData.id || `DEPOSIT_${formData.depositCount}_${Date.now()}`,
                trigger: {
                    name: {
                        '*': formData.name_en,
                        en: formData.name_en,
                    },
                    description: {
                        '*': formData.description_en,
                        en: formData.description_en,
                    },
                    minimumAmount: {
                        '*': parseFloat(formData.minimumAmount) || 25,
                    },
                    type: formData.triggerType,
                    duration: formData.duration,
                    minimumDepositCount: parseInt(formData.depositCount) || 1,
                },
                config: {
                    cost: formData.cost,
                    multiplier: formData.multipliers,
                    maximumBets: formData.maximumBets,
                    maximumWithdraw: Object.fromEntries(
                        Object.entries(formData.maximumWithdraw).map(([curr, val]) => [
                            curr,
                            { cap: val }
                        ])
                    ),
                    provider: formData.provider,
                    brand: formData.brand,
                    type: formData.bonusType,
                    withdrawActive: false,
                    category: formData.category.toLowerCase(),
                    expiry: formData.duration,
                    extra: {
                        category: formData.category.toLowerCase(),
                        game: formData.gameName
                    }
                },
                type: 'bonus_template'
            };

            if (formData.scheduleFrom && formData.scheduleTo) {
                payload.trigger.schedule = {
                    from: formData.scheduleFrom,
                    to: formData.scheduleTo,
                };
            }

            const response = await axios.post(`${API_ENDPOINTS.BASE_URL}/api/bonus-templates`, payload);
            setMessage(`✅ Deposit bonus "${response.data.id}" created successfully!`);

            // Reset form
            setFormData({
                id: '',
                name_en: '',
                description_en: '',
                provider: 'PRAGMATIC',
                brand: 'PRAGMATIC',
                category: 'GAMES',
                triggerType: 'deposit',
                depositCount: '1',
                minimumAmount: '25',
                percentage: '100',
                bonusType: 'cost',
                duration: '7d',
                gameName: '',
                selectedCostTable: '',
                cost: Object.fromEntries(CURRENCIES.map(c => [c, 0])),
                multipliers: Object.fromEntries(CURRENCIES.map(c => [c, 0])),
                maximumBets: Object.fromEntries(CURRENCIES.map(c => [c, 200])),
                maximumWithdraw: Object.fromEntries(CURRENCIES.map(c => [c, 100])),
                scheduleFrom: '',
                scheduleTo: '',
            });
            setActiveTab('basic');

            setTimeout(() => setMessage(''), 5000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || error.message;
            setMessage(`❌ Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">🎁 Create Deposit Bonus</h2>

            {message && (
                <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
                    <p className={message.includes('✅') ? 'text-green-400' : 'text-red-400'}>{message}</p>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'basic', label: '📋 Basic Info' },
                    { id: 'multipliers', label: '✖️ Multipliers' },
                    { id: 'bets', label: '🎯 Max Bets' },
                    { id: 'withdraw', label: '🏦 Max Withdraw' },
                    { id: 'schedule', label: '📅 Schedule' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded font-medium transition ${activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="bg-gray-800 p-6 rounded border border-gray-700 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Name (English) *</label>
                            <input
                                type="text"
                                name="name_en"
                                value={formData.name_en}
                                onChange={handleBasicChange}
                                placeholder="e.g., 200 FS with your 3rd Deposit"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description (English)</label>
                            <input
                                type="text"
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleBasicChange}
                                placeholder="e.g., on Bigger Bass Bonanza"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Deposit Count *</label>
                                <select
                                    name="depositCount"
                                    value={formData.depositCount}
                                    onChange={handleBasicChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="1">1st Deposit</option>
                                    <option value="2">2nd Deposit</option>
                                    <option value="3">3rd Deposit</option>
                                    <option value="4">4th Deposit</option>
                                    <option value="5">5th Deposit</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Type *</label>
                                <select
                                    name="bonusType"
                                    value={formData.bonusType}
                                    onChange={handleBasicChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                >
                                    {BONUS_TYPES_OPTIONS.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Amount (€) *</label>
                                <input
                                    type="number"
                                    name="minimumAmount"
                                    value={formData.minimumAmount}
                                    onChange={handleBasicChange}
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Percentage (%)</label>
                                <input
                                    type="number"
                                    name="percentage"
                                    value={formData.percentage}
                                    onChange={handleBasicChange}
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Game Name *</label>
                            <input
                                type="text"
                                name="gameName"
                                value={formData.gameName}
                                onChange={handleBasicChange}
                                placeholder="e.g., Bigger Bass Bonanza"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Provider *</label>
                                <select
                                    name="provider"
                                    value={formData.provider}
                                    onChange={handleBasicChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="PRAGMATIC">PRAGMATIC</option>
                                    <option value="BETSOFT">BETSOFT</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Cost Table *</label>
                                {loadingCosts ? (
                                    <div className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-400">Loading...</div>
                                ) : (
                                    <select
                                        value={formData.selectedCostTable}
                                        onChange={(e) => handleSelectCostTable(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">-- Select a cost table --</option>
                                        {costTables.map(table => (
                                            <option key={table.id} value={table.id}>
                                                {table.name} (€{table.values['EUR']?.toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleBasicChange}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="7d">7 Days</option>
                                <option value="14d">14 Days</option>
                                <option value="30d">30 Days</option>
                                <option value="1y">1 Year</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Multipliers Tab */}
                {activeTab === 'multipliers' && (
                    <div className="bg-gray-800 p-6 rounded border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Multipliers per Currency</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CURRENCIES.map(currency => (
                                <div key={currency}>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">{currency}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.multipliers[currency] || 0}
                                        onChange={(e) => handleCurrencyChange('multipliers', currency, parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Maximum Bets Tab */}
                {activeTab === 'bets' && (
                    <div className="bg-gray-800 p-6 rounded border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Maximum Bets per Currency</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CURRENCIES.map(currency => (
                                <div key={currency}>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">{currency}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.maximumBets[currency] || 0}
                                        onChange={(e) => handleCurrencyChange('maximumBets', currency, parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Maximum Withdraw Tab */}
                {activeTab === 'withdraw' && (
                    <div className="bg-gray-800 p-6 rounded border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Maximum Withdrawal Cap per Currency</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CURRENCIES.map(currency => (
                                <div key={currency}>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">{currency}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.maximumWithdraw[currency] || 0}
                                        onChange={(e) => handleCurrencyChange('maximumWithdraw', currency, parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                    <div className="bg-gray-800 p-6 rounded border border-gray-700 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Schedule (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                                <input
                                    type="datetime-local"
                                    name="scheduleFrom"
                                    value={formData.scheduleFrom}
                                    onChange={handleBasicChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="scheduleTo"
                                    value={formData.scheduleTo}
                                    onChange={handleBasicChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !formData.name_en.trim()}
                    className={`w-full py-3 px-6 rounded font-semibold transition ${loading || !formData.name_en.trim()
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
                        }`}
                >
                    {loading ? '⏳ Creating...' : '✅ Create Deposit Bonus'}
                </button>
            </form>
        </div>
    );
}
