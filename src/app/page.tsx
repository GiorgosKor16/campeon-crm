'use client';

import { useState } from 'react';
import AdminPanel from '@/components/AdminPanel';
import SimpleBonusForm from '@/components/SimpleBonusForm';
import TranslationTeam from '@/components/TranslationTeam';
import OptimizationTeam from '@/components/OptimizationTeam';

export default function Home() {
    const [activeTab, setActiveTab] = useState('admin');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <header className="mb-10 pb-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl">🎰</span>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CAMPEON CRM</h1>
                    </div>
                    <p className="text-slate-400 text-lg">Collaborative Bonus Offer Management System</p>
                </header>

                {/* Tab Navigation */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-3 border-b border-slate-600 flex-wrap">
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shadow-md ${activeTab === 'admin'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        ⚙️ Admin Setup
                    </button>
                    <button
                        onClick={() => setActiveTab('casino')}
                        className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shadow-md ${activeTab === 'casino'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        🎰 Create Bonus
                    </button>
                    <button
                        onClick={() => setActiveTab('translation')}
                        className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shadow-md ${activeTab === 'translation'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/50 scale-105'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        🌐 Translation Team
                    </button>
                    <button
                        onClick={() => setActiveTab('optimization')}
                        className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shadow-md ${activeTab === 'optimization'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/50 scale-105'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        📊 Optimization Team
                    </button>
                </div>

                {/* Tab Content */}
                <div className="card">
                    {activeTab === 'admin' && <AdminPanel />}
                    {activeTab === 'casino' && <SimpleBonusForm />}
                    {activeTab === 'translation' && <TranslationTeam />}
                    {activeTab === 'optimization' && <OptimizationTeam />}
                </div>
            </div>
        </div>
    );
}
