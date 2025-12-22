'use client';

import React, { useState } from 'react';
import { BonusType, BONUS_TYPES, generateBonusId } from '@/lib/bonusConfig';

interface BonusWizardProps {
    onBonusCreated?: (bonusData: any) => void;
    onCancel?: () => void;
    inline?: boolean;
}

export default function BonusWizard({ onBonusCreated, onCancel, inline = false }: BonusWizardProps) {
    const [selectedType, setSelectedType] = useState<BonusType | null>(null);
    const [bonusData, setBonusData] = useState<Record<string, any>>({});
    const [generatedId, setGeneratedId] = useState<string>('');

    const handleTypeChange = (type: BonusType) => {
        setSelectedType(type);
        setBonusData({});
        setGeneratedId('');
    };

    const handleInputChange = (field: string, value: any) => {
        const updated = { ...bonusData, [field]: value };
        setBonusData(updated);

        // Auto-generate ID when relevant fields are filled
        if (selectedType && shouldGenerateId(updated, selectedType)) {
            const newId = generateBonusId(selectedType, updated);
            setGeneratedId(newId);
        }
    };

    const shouldGenerateId = (data: Record<string, any>, type: BonusType): boolean => {
        switch (type) {
            case 'DEPOSIT':
            case 'RELOAD':
                return data.minimumAmount && data.percentage;
            case 'FSDROP':
                return data.spinCount;
            case 'WAGER':
                return data.wagerAmount && data.spinCount;
            case 'SEQ':
                return data.stageNumber && data.minimumAmount && data.percentage;
            case 'COMBO':
                return data.linkedBonusId;
            case 'CASHBACK':
                return data.percentage;
            default:
                return false;
        }
    };

    const handleFinish = () => {
        const finalBonus = {
            id: generatedId,
            type: selectedType,
            ...bonusData,
            created_at: new Date().toISOString(),
        };
        onBonusCreated?.(finalBonus);
    };

    return (
        <div className={`${inline ? 'bg-gray-900 rounded-lg p-6' : 'min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8'}`}>
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-6">✨ Bonus Builder</h2>

                <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 space-y-6">
                    {/* Bonus Type Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">Select Bonus Type *</label>
                        <select
                            value={selectedType || ''}
                            onChange={(e) => handleTypeChange(e.target.value as BonusType)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white text-base focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">-- Choose a bonus type --</option>
                            {Object.entries(BONUS_TYPES).map(([_, config]) => (
                                <option key={config.type} value={config.type}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                        {selectedType && (
                            <p className="text-sm text-gray-400 mt-2">{BONUS_TYPES[selectedType].description}</p>
                        )}
                    </div>

                    {/* Conditional Fields */}
                    {selectedType && (
                        <div className="space-y-6">
                            {/* Generated ID Display */}
                            {generatedId && (
                                <div className="p-4 bg-green-900 border border-green-700 rounded">
                                    <div className="text-sm text-gray-300 mb-1">Generated Bonus ID:</div>
                                    <div className="text-lg font-mono text-green-400 break-all">{generatedId}</div>
                                </div>
                            )}

                            {/* DEPOSIT / RELOAD */}
                            {(selectedType === 'DEPOSIT' || selectedType === 'RELOAD') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Minimum Amount (€) *</label>
                                        <input
                                            type="number"
                                            value={bonusData.minimumAmount || ''}
                                            onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 25"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Percentage (%) *</label>
                                        <input
                                            type="number"
                                            value={bonusData.percentage || ''}
                                            onChange={(e) => handleInputChange('percentage', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-white mb-2">Wagering Multiplier (x)</label>
                                        <input
                                            type="number"
                                            value={bonusData.wageringMultiplier || ''}
                                            onChange={(e) => handleInputChange('wageringMultiplier', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 20"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* FSDROP */}
                            {selectedType === 'FSDROP' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Spin Count *</label>
                                        <input
                                            type="number"
                                            value={bonusData.spinCount || ''}
                                            onChange={(e) => handleInputChange('spinCount', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Wagering Multiplier (x)</label>
                                        <input
                                            type="number"
                                            value={bonusData.wagering || ''}
                                            onChange={(e) => handleInputChange('wagering', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 5"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* WAGER */}
                            {selectedType === 'WAGER' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Wager Amount (€) *</label>
                                        <input
                                            type="number"
                                            value={bonusData.wagerAmount || ''}
                                            onChange={(e) => handleInputChange('wagerAmount', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Spin Count *</label>
                                        <input
                                            type="number"
                                            value={bonusData.spinCount || ''}
                                            onChange={(e) => handleInputChange('spinCount', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-white mb-2">Wagering Multiplier (x)</label>
                                        <input
                                            type="number"
                                            value={bonusData.wagering || ''}
                                            onChange={(e) => handleInputChange('wagering', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 5"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SEQUENTIAL */}
                            {selectedType === 'SEQ' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Stage Number *</label>
                                        <input
                                            type="number"
                                            value={bonusData.stageNumber || ''}
                                            onChange={(e) => handleInputChange('stageNumber', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Minimum Amount (€) *</label>
                                        <input
                                            type="number"
                                            value={bonusData.minimumAmount || ''}
                                            onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 25"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Percentage (%) *</label>
                                        <input
                                            type="number"
                                            value={bonusData.percentage || ''}
                                            onChange={(e) => handleInputChange('percentage', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Wagering Multiplier (x)</label>
                                        <input
                                            type="number"
                                            value={bonusData.wageringMultiplier || ''}
                                            onChange={(e) => handleInputChange('wageringMultiplier', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                            placeholder="e.g., 20"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* COMBO */}
                            {selectedType === 'COMBO' && (
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Linked Bonus ID *</label>
                                    <input
                                        type="text"
                                        value={bonusData.linkedBonusId || ''}
                                        onChange={(e) => handleInputChange('linkedBonusId', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                                        placeholder="e.g., DEPOSIT_25_100_22.12.25"
                                    />
                                </div>
                            )}

                            {/* CASHBACK */}
                            {selectedType === 'CASHBACK' && (
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Cashback Percentage (%) *</label>
                                    <input
                                        type="number"
                                        value={bonusData.percentage || ''}
                                        onChange={(e) => handleInputChange('percentage', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                        placeholder="e.g., 10"
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-gray-700">
                                {onCancel && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onCancel();
                                        }}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFinish();
                                    }}
                                    disabled={!generatedId}
                                    className={`px-6 py-2 rounded transition ${generatedId
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    ✅ Create Bonus
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
