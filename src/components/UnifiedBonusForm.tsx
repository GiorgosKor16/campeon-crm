'use client';

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/api-config';
import { BonusType, BONUS_TYPES, generateBonusId } from '@/lib/bonusConfig';

interface FormData {
    id: string;
    bonusType: BonusType | '';
    provider: string;
    brand: string;
    category: string;
    triggerType: string;

    // Type-specific fields
    minimumAmount: string;
    percentage: string;
    wageringMultiplier: string;
    spinCount: string;
    wagerAmount: string;
    stageNumber: string;
    linkedBonusIds: string[]; // Array for COMBO bonuses

    // Schedule (optional)
    scheduleType: string;
    scheduleFrom: string;
    scheduleTo: string;
}

export default function UnifiedBonusForm() {
    const [formData, setFormData] = useState<FormData>({
        id: '',
        bonusType: '',
        provider: 'PRAGMATIC',
        brand: 'PRAGMATIC',
        category: 'GAMES',
        triggerType: 'reload',
        minimumAmount: '',
        percentage: '',
        wageringMultiplier: '',
        spinCount: '',
        wagerAmount: '',
        stageNumber: '',
        linkedBonusIds: [''],
        scheduleType: 'period',
        scheduleFrom: '',
        scheduleTo: '',
    });

    // For COMBO: track multiple bonuses being built
    const [comboMode, setComboMode] = useState(false);
    const [comboBonuses, setComboBonuses] = useState<FormData[]>([]);
    const [activeComboBonus, setActiveComboBonus] = useState(0);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const bonusTypeConfig = formData.bonusType ? BONUS_TYPES[formData.bonusType] : null;

    const handleTypeChange = (type: BonusType) => {
        // Enable COMBO mode if COMBO is selected
        if (type === 'COMBO') {
            setComboMode(true);
            setComboBonuses([
                {
                    id: '',
                    bonusType: '',
                    provider: 'PRAGMATIC',
                    brand: 'PRAGMATIC',
                    category: 'GAMES',
                    triggerType: 'reload',
                    minimumAmount: '',
                    percentage: '',
                    wageringMultiplier: '',
                    spinCount: '',
                    wagerAmount: '',
                    stageNumber: '',
                    linkedBonusIds: [''],
                    scheduleType: 'period',
                    scheduleFrom: '',
                    scheduleTo: '',
                },
                {
                    id: '',
                    bonusType: '',
                    provider: 'PRAGMATIC',
                    brand: 'PRAGMATIC',
                    category: 'GAMES',
                    triggerType: 'reload',
                    minimumAmount: '',
                    percentage: '',
                    wageringMultiplier: '',
                    spinCount: '',
                    wagerAmount: '',
                    stageNumber: '',
                    linkedBonusIds: [''],
                    scheduleType: 'period',
                    scheduleFrom: '',
                    scheduleTo: '',
                },
            ]);
            setActiveComboBonus(0);
        } else {
            setComboMode(false);
            setComboBonuses([]);
        }

        setFormData(prev => ({
            ...prev,
            bonusType: type,
            id: '',
            minimumAmount: '',
            percentage: '',
            wageringMultiplier: '',
            spinCount: '',
            wagerAmount: '',
            stageNumber: '',
            linkedBonusIds: [''],
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);

        // Auto-generate ID based on type and values
        if (formData.bonusType) {
            const newId = generateBonusId(formData.bonusType, updated);
            if (newId && newId !== formData.id) {
                updated.id = newId;
                setFormData(updated);
            }
        }
    };

    const handleLinkedBonusChange = (index: number, value: string) => {
        const updated = { ...formData };
        updated.linkedBonusIds[index] = value;
        setFormData(updated);
    };

    const addLinkedBonus = () => {
        setFormData(prev => ({
            ...prev,
            linkedBonusIds: [...prev.linkedBonusIds, ''],
        }));
    };

    const removeLinkedBonus = (index: number) => {
        setFormData(prev => ({
            ...prev,
            linkedBonusIds: prev.linkedBonusIds.filter((_, i) => i !== index),
        }));
    };

    // COMBO Mode Handlers
    const handleComboBonusChange = (bonusIndex: number, field: keyof FormData, value: any) => {
        const updated = [...comboBonuses];
        updated[bonusIndex] = { ...updated[bonusIndex], [field]: value };
        setComboBonuses(updated);

        // Auto-generate ID if bonus type exists
        if (field === 'bonusType' || (field !== 'bonusType' && updated[bonusIndex].bonusType)) {
            const bonus = updated[bonusIndex];
            if (bonus.bonusType) {
                const newId = generateBonusId(bonus.bonusType, bonus);
                if (newId) {
                    updated[bonusIndex].id = newId;
                    setComboBonuses(updated);
                }
            }
        }
    };

    const handleComboBonusInputChange = (bonusIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        handleComboBonusChange(bonusIndex, name as keyof FormData, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // COMBO Mode: Create both bonuses and link them
            if (comboMode && comboBonuses.length === 2) {
                const bonus1 = comboBonuses[0];
                const bonus2 = comboBonuses[1];

                if (!bonus1.bonusType || !bonus2.bonusType) {
                    setMessage('❌ Please select bonus types for both bonuses');
                    setLoading(false);
                    return;
                }

                if (!bonus1.id || !bonus2.id) {
                    setMessage('❌ Please fill in required fields for both bonuses');
                    setLoading(false);
                    return;
                }

                // Helper function to build payload for individual bonus
                const buildBonusPayload = (bonus: FormData) => {
                    const payload: any = {
                        id: bonus.id,
                        trigger_name: { '*': `${bonus.provider} ${bonus.bonusType} Bonus` },
                        trigger_description: { '*': `${bonus.provider} bonus` },
                        trigger_type: bonus.triggerType,
                        trigger_iterations: 1,
                        trigger_duration: '7d',
                        category: bonus.category,
                        provider: bonus.provider,
                        brand: bonus.brand,
                        bonus_type: bonus.bonusType.toLowerCase(),
                    };

                    switch (bonus.bonusType) {
                        case 'DEPOSIT':
                        case 'RELOAD':
                            payload.minimum_amount = { '*': parseFloat(bonus.minimumAmount) || 25 };
                            payload.percentage = parseFloat(bonus.percentage) || 100;
                            payload.wagering_multiplier = parseFloat(bonus.wageringMultiplier) || 20;
                            payload.maximum_amount = { '*': 300 };
                            break;
                        case 'FSDROP':
                            payload.minimum_amount = { '*': 0 };
                            payload.percentage = parseFloat(bonus.spinCount) || 50;
                            payload.wagering_multiplier = 5;
                            payload.maximum_amount = { '*': 0 };
                            break;
                        case 'WAGER':
                            payload.minimum_amount = { '*': parseFloat(bonus.wagerAmount) || 200 };
                            payload.percentage = parseFloat(bonus.spinCount) || 500;
                            payload.wagering_multiplier = 10;
                            payload.maximum_amount = { '*': 500 };
                            break;
                        case 'SEQ':
                            payload.minimum_amount = { '*': parseFloat(bonus.minimumAmount) || 25 };
                            payload.percentage = parseFloat(bonus.percentage) || 100;
                            payload.wagering_multiplier = parseFloat(bonus.wageringMultiplier) || 15;
                            payload.maximum_amount = { '*': 300 };
                            break;
                        case 'CASHBACK':
                            payload.minimum_amount = { '*': 0 };
                            payload.percentage = parseFloat(bonus.percentage) || 10;
                            payload.wagering_multiplier = 0;
                            payload.maximum_amount = { '*': parseFloat(bonus.minimumAmount) || 100 };
                            break;
                    }

                    payload.minimum_stake_to_wager = { '*': 0.5 };
                    payload.maximum_stake_to_wager = { '*': 5 };
                    payload.maximum_withdraw = { '*': 3 };
                    payload.include_amount_on_target_wager = true;
                    payload.compensate_overspending = true;
                    payload.withdraw_active = false;

                    if (bonus.scheduleFrom && bonus.scheduleTo) {
                        payload.schedule_type = bonus.scheduleType;
                        payload.schedule_from = bonus.scheduleFrom;
                        payload.schedule_to = bonus.scheduleTo;
                    }

                    return payload;
                };

                // Create both bonuses
                const payload1 = buildBonusPayload(bonus1);
                const payload2 = buildBonusPayload(bonus2);

                await axios.post(API_ENDPOINTS.BONUS_TEMPLATES, payload1);
                await axios.post(API_ENDPOINTS.BONUS_TEMPLATES, payload2);

                // Create COMBO bonus linking both
                const comboPayload: any = {
                    id: `COMBO_${bonus1.id}_${bonus2.id}`,
                    trigger_name: { '*': `${bonus1.provider} COMBO Bonus` },
                    trigger_description: { '*': `Combo of ${bonus1.bonusType} and ${bonus2.bonusType}` },
                    trigger_type: 'deposit',
                    trigger_iterations: 1,
                    trigger_duration: '7d',
                    category: bonus1.category,
                    provider: bonus1.provider,
                    brand: bonus1.brand,
                    bonus_type: 'combo',
                    minimum_amount: { '*': 25 },
                    percentage: 100,
                    wagering_multiplier: 15,
                    maximum_amount: { '*': 300 },
                    minimum_stake_to_wager: { '*': 0.5 },
                    maximum_stake_to_wager: { '*': 5 },
                    maximum_withdraw: { '*': 3 },
                    include_amount_on_target_wager: true,
                    compensate_overspending: true,
                    withdraw_active: false,
                    linked_bonus_ids: [bonus1.id, bonus2.id],
                };

                await axios.post(API_ENDPOINTS.BONUS_TEMPLATES, comboPayload);

                setMessage(`✅ Created COMBO bonus linking "${bonus1.id}" + "${bonus2.id}"`);
                setComboMode(false);
                setComboBonuses([]);
                setFormData(prev => ({ ...prev, bonusType: '' }));
                return;
            }

            // Regular Mode: Create single bonus
            if (!formData.bonusType) {
                setMessage('❌ Please select a bonus type');
                setLoading(false);
                return;
            }

            // Build payload, excluding empty optional fields
            const payload: any = {
                id: formData.id,
                trigger_name: { '*': `${formData.provider} ${formData.bonusType} Bonus` },
                trigger_description: { '*': `${formData.provider} bonus` },
                trigger_type: formData.triggerType,
                trigger_iterations: 1,
                trigger_duration: '7d',
                category: formData.category,
                provider: formData.provider,
                brand: formData.brand,
                bonus_type: formData.bonusType.toLowerCase(),
            };

            // Add type-specific fields
            switch (formData.bonusType) {
                case 'DEPOSIT':
                case 'RELOAD':
                    payload.minimum_amount = { '*': parseFloat(formData.minimumAmount) || 25 };
                    payload.percentage = parseFloat(formData.percentage) || 100;
                    payload.wagering_multiplier = parseFloat(formData.wageringMultiplier) || 20;
                    payload.maximum_amount = { '*': 300 };
                    break;

                case 'FSDROP':
                    payload.minimum_amount = { '*': 0 };
                    payload.percentage = parseFloat(formData.spinCount) || 50;
                    payload.wagering_multiplier = 5;
                    payload.maximum_amount = { '*': 0 };
                    break;

                case 'WAGER':
                    payload.minimum_amount = { '*': parseFloat(formData.wagerAmount) || 200 };
                    payload.percentage = parseFloat(formData.spinCount) || 500;
                    payload.wagering_multiplier = 10;
                    payload.maximum_amount = { '*': 500 };
                    break;

                case 'SEQ':
                    payload.minimum_amount = { '*': parseFloat(formData.minimumAmount) || 25 };
                    payload.percentage = parseFloat(formData.percentage) || 100;
                    payload.wagering_multiplier = parseFloat(formData.wageringMultiplier) || 15;
                    payload.maximum_amount = { '*': 300 };
                    break;

                case 'COMBO':
                    payload.minimum_amount = { '*': 25 };
                    payload.percentage = 100;
                    payload.wagering_multiplier = 15;
                    payload.maximum_amount = { '*': 300 };
                    payload.linked_bonus_ids = formData.linkedBonusIds.filter(id => id.trim() !== '');
                    break;

                case 'CASHBACK':
                    payload.minimum_amount = { '*': 0 };
                    payload.percentage = parseFloat(formData.percentage) || 10;
                    payload.wagering_multiplier = 0;
                    payload.maximum_amount = { '*': parseFloat(formData.minimumAmount) || 100 };
                    // Cashback typically doesn't need provider
                    break;
            }

            // Standard fields for all
            payload.minimum_stake_to_wager = { '*': 0.5 };
            payload.maximum_stake_to_wager = { '*': 5 };
            payload.maximum_withdraw = { '*': 3 };
            payload.include_amount_on_target_wager = true;
            payload.compensate_overspending = true;
            payload.withdraw_active = false;

            // Only add schedule if both dates are provided
            if (formData.scheduleFrom && formData.scheduleTo) {
                payload.schedule_type = formData.scheduleType;
                payload.schedule_from = formData.scheduleFrom;
                payload.schedule_to = formData.scheduleTo;
            }

            const response = await axios.post(API_ENDPOINTS.BONUS_TEMPLATES, payload);
            setMessage(`✅ Bonus "${response.data.id}" created successfully!`);

            // Reset form
            setFormData({
                id: '',
                bonusType: '',
                provider: 'PRAGMATIC',
                brand: 'PRAGMATIC',
                category: 'GAMES',
                triggerType: 'reload',
                minimumAmount: '',
                percentage: '',
                wageringMultiplier: '',
                spinCount: '',
                wagerAmount: '',
                stageNumber: '',
                linkedBonusIds: [''],
                scheduleType: 'period',
                scheduleFrom: '',
                scheduleTo: '',
            });

            setTimeout(() => setMessage(''), 4000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || error.message;
            setMessage(`❌ Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">✨ Create Bonus</h2>

            {message && (
                <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
                    <p className={message.includes('✅') ? 'text-green-400' : 'text-red-400'}>{message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Select Bonus Type */}
                <div className="bg-gray-800 p-6 rounded border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">1️⃣ Select Bonus Type</h3>
                    <select
                        value={formData.bonusType}
                        onChange={(e) => handleTypeChange(e.target.value as BonusType)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">-- Choose a bonus type --</option>
                        {Object.entries(BONUS_TYPES).map(([_, config]) => (
                            <option key={config.type} value={config.type}>
                                {config.label}
                            </option>
                        ))}
                    </select>
                    {bonusTypeConfig && (
                        <p className="text-sm text-gray-400 mt-2">{bonusTypeConfig.description}</p>
                    )}
                </div>

                {/* COMBO MODE: Dual Bonus Builder */}
                {comboMode && comboBonuses.length === 2 && (
                    <>
                        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded border-2 border-purple-500">
                            <h2 className="text-xl font-bold text-white mb-2">🔗 COMBO Bonus Builder</h2>
                            <p className="text-purple-200 text-sm">Build two bonuses and link them together</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bonus 1 */}
                            <div className="bg-gray-800 p-6 rounded border-2 border-blue-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-blue-400">💎 Bonus 1</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${comboBonuses[0].bonusType ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {comboBonuses[0].bonusType || 'Select type'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Type</label>
                                        <select
                                            value={comboBonuses[0].bonusType}
                                            onChange={(e) => handleComboBonusChange(0, 'bonusType', e.target.value as BonusType)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                        >
                                            <option value="">-- Select Type --</option>
                                            {Object.entries(BONUS_TYPES).map(([_, config]) => (
                                                config.type !== 'COMBO' && (
                                                    <option key={config.type} value={config.type}>
                                                        {config.label}
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                    </div>

                                    {comboBonuses[0].bonusType && (
                                        <>
                                            {(comboBonuses[0].bonusType === 'DEPOSIT' || comboBonuses[0].bonusType === 'RELOAD') && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Amount (€)</label>
                                                        <input
                                                            type="number"
                                                            value={comboBonuses[0].minimumAmount}
                                                            onChange={(e) => handleComboBonusChange(0, 'minimumAmount', e.target.value)}
                                                            placeholder="e.g., 25"
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">Percentage (%)</label>
                                                        <input
                                                            type="number"
                                                            value={comboBonuses[0].percentage}
                                                            onChange={(e) => handleComboBonusChange(0, 'percentage', e.target.value)}
                                                            placeholder="e.g., 100"
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">Wagering Multiplier</label>
                                                        <input
                                                            type="number"
                                                            value={comboBonuses[0].wageringMultiplier}
                                                            onChange={(e) => handleComboBonusChange(0, 'wageringMultiplier', e.target.value)}
                                                            placeholder="e.g., 20"
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {comboBonuses[0].bonusType === 'FSDROP' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Free Spins Count</label>
                                                    <input
                                                        type="number"
                                                        value={comboBonuses[0].spinCount}
                                                        onChange={(e) => handleComboBonusChange(0, 'spinCount', e.target.value)}
                                                        placeholder="e.g., 50"
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                    />
                                                </div>
                                            )}

                                            <div className="text-xs text-blue-300 bg-blue-900 bg-opacity-30 p-2 rounded">
                                                <strong>ID:</strong> {comboBonuses[0].id || 'Auto-generated'}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Arrow / Plus */}
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-400 mb-2">+</div>
                                    <p className="text-gray-400 text-sm">Combined</p>
                                    <p className="text-purple-300 font-semibold mt-2">= COMBO</p>
                                </div>
                            </div>

                            {/* Bonus 2 */}
                            <div className="bg-gray-800 p-6 rounded border-2 border-green-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-green-400">💎 Bonus 2</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${comboBonuses[1].bonusType ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {comboBonuses[1].bonusType || 'Select type'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Type</label>
                                        <select
                                            value={comboBonuses[1].bonusType}
                                            onChange={(e) => handleComboBonusChange(1, 'bonusType', e.target.value as BonusType)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                        >
                                            <option value="">-- Select Type --</option>
                                            {Object.entries(BONUS_TYPES).map(([_, config]) => (
                                                config.type !== 'COMBO' && (
                                                    <option key={config.type} value={config.type}>
                                                        {config.label}
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                    </div>

                                    {comboBonuses[1].bonusType && (
                                        <>
                                            {(comboBonuses[1].bonusType === 'DEPOSIT' || comboBonuses[1].bonusType === 'RELOAD') && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Amount (€)</label>
                                                        <input
                                                            type="number"
                                                            value={comboBonuses[1].minimumAmount}
                                                            onChange={(e) => handleComboBonusChange(1, 'minimumAmount', e.target.value)}
                                                            placeholder="e.g., 25"
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">Percentage (%)</label>
                                                        <input
                                                            type="number"
                                                            value={comboBonuses[1].percentage}
                                                            onChange={(e) => handleComboBonusChange(1, 'percentage', e.target.value)}
                                                            placeholder="e.g., 100"
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">Wagering Multiplier</label>
                                                        <input
                                                            type="number"
                                                            value={comboBonuses[1].wageringMultiplier}
                                                            onChange={(e) => handleComboBonusChange(1, 'wageringMultiplier', e.target.value)}
                                                            placeholder="e.g., 20"
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {comboBonuses[1].bonusType === 'FSDROP' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Free Spins Count</label>
                                                    <input
                                                        type="number"
                                                        value={comboBonuses[1].spinCount}
                                                        onChange={(e) => handleComboBonusChange(1, 'spinCount', e.target.value)}
                                                        placeholder="e.g., 50"
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                    />
                                                </div>
                                            )}

                                            <div className="text-xs text-green-300 bg-green-900 bg-opacity-30 p-2 rounded">
                                                <strong>ID:</strong> {comboBonuses[1].id || 'Auto-generated'}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {formData.bonusType && !comboMode && (
                    <>
                        {/* Step 2: Type-Specific Fields */}
                        <div className="bg-gray-800 p-6 rounded border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">2️⃣ Bonus Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* DEPOSIT / RELOAD */}
                                {(formData.bonusType === 'DEPOSIT' || formData.bonusType === 'RELOAD') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Amount (€) *</label>
                                            <input
                                                type="number"
                                                name="minimumAmount"
                                                value={formData.minimumAmount}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 25"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Percentage (%) *</label>
                                            <input
                                                type="number"
                                                name="percentage"
                                                value={formData.percentage}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 100"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Wagering Multiplier (x)</label>
                                            <input
                                                type="number"
                                                name="wageringMultiplier"
                                                value={formData.wageringMultiplier}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 20"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* FSDROP */}
                                {formData.bonusType === 'FSDROP' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Free Spins Count *</label>
                                        <input
                                            type="number"
                                            name="spinCount"
                                            value={formData.spinCount}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 50"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                        />
                                    </div>
                                )}

                                {/* WAGER */}
                                {formData.bonusType === 'WAGER' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Wager Amount (€) *</label>
                                            <input
                                                type="number"
                                                name="wagerAmount"
                                                value={formData.wagerAmount}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 200"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Free Spins *</label>
                                            <input
                                                type="number"
                                                name="spinCount"
                                                value={formData.spinCount}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 500"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* SEQ */}
                                {formData.bonusType === 'SEQ' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Stage Number *</label>
                                            <input
                                                type="number"
                                                name="stageNumber"
                                                value={formData.stageNumber}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 1"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Percentage (%)</label>
                                            <input
                                                type="number"
                                                name="percentage"
                                                value={formData.percentage}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 100"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* COMBO */}
                                {formData.bonusType === 'COMBO' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Linked Bonuses</label>
                                        <div className="space-y-3">
                                            {formData.linkedBonusIds.map((bonusId, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={bonusId}
                                                        onChange={(e) => handleLinkedBonusChange(index, e.target.value)}
                                                        placeholder="e.g., DEPOSIT_25_100_2025-12-22"
                                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                                    />
                                                    {formData.linkedBonusIds.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLinkedBonus(index)}
                                                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addLinkedBonus}
                                            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition"
                                        >
                                            + Add Bonus
                                        </button>
                                    </div>
                                )}

                                {/* CASHBACK */}
                                {formData.bonusType === 'CASHBACK' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Cashback Percentage (%) *</label>
                                            <input
                                                type="number"
                                                name="percentage"
                                                value={formData.percentage}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 10"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Cashback (€)</label>
                                            <input
                                                type="number"
                                                name="minimumAmount"
                                                value={formData.minimumAmount}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 100"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Step 3: General Fields */}
                        <div className="bg-gray-800 p-6 rounded border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">3️⃣ General Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                    >
                                        <option value="GAMES">Games</option>
                                        <option value="SPORTS">Sports</option>
                                        <option value="LIVE">Live</option>
                                    </select>
                                </div>
                                {formData.bonusType !== 'CASHBACK' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                                            <select
                                                name="provider"
                                                value={formData.provider}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            >
                                                <option value="PRAGMATIC">PRAGMATIC</option>
                                                <option value="BETSOFT">BETSOFT</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Type</label>
                                            <select
                                                name="triggerType"
                                                value={formData.triggerType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            >
                                                <option value="deposit">Deposit</option>
                                                <option value="reload">Reload</option>
                                                <option value="external">External</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Step 4: Schedule (Optional) */}
                        <div className="bg-gray-800 p-6 rounded border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">4️⃣ Schedule (Optional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Type</label>
                                    <select
                                        name="scheduleType"
                                        value={formData.scheduleType}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                    >
                                        <option value="period">Period</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        name="scheduleFrom"
                                        value={formData.scheduleFrom}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                                    <input
                                        type="datetime-local"
                                        name="scheduleTo"
                                        value={formData.scheduleTo}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Generated ID */}
                        {formData.id && (
                            <div className="p-4 bg-green-900 border border-green-700 rounded">
                                <div className="text-sm text-gray-300 mb-1">Generated Bonus ID:</div>
                                <div className="text-lg font-mono text-green-400 break-all">{formData.id}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.id}
                            className={`w-full py-3 px-6 rounded font-semibold transition ${loading || !formData.id
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
                                }`}
                        >
                            {loading ? '⏳ Creating...' : '✅ Create Bonus'}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
