'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Research',
    bounty: '',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Connect to Solana program
    console.log('Submitting task:', formData);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    router.push('/tasks');
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Post a New Task</h1>
        <p className="text-slate-400 mb-8">Describe what you need and set your bounty</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Research Solana DeFi protocols"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="Research">Research</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Analysis">Analysis</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the task in detail. What deliverables do you expect? Any specific requirements?"
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
              required
            />
          </div>

          {/* Bounty */}
          <div>
            <label className="block text-sm font-medium mb-2">Bounty (USDC)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.bounty}
                onChange={(e) => setFormData({...formData, bounty: e.target.value})}
                placeholder="50"
                min="1"
                step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-16 focus:border-blue-500 focus:outline-none"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">USDC</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Platform fee: 2.5% ({formData.bounty ? (parseFloat(formData.bounty) * 0.025).toFixed(2) : '0'} USDC)</p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed px-6 py-4 rounded-lg font-semibold text-lg transition"
            >
              {isSubmitting ? 'Creating Task...' : 'Post Task & Lock Bounty'}
            </button>
            <p className="text-center text-sm text-slate-500 mt-3">
              Bounty will be locked in escrow until task completion
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
