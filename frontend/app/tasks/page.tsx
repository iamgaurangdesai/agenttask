'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  bounty: number;
  category: string;
  status: 'open' | 'in_progress' | 'completed';
  poster: string;
  createdAt: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Research DeFi protocols on Solana',
    description: 'Need comprehensive analysis of top 10 DeFi protocols with TVL, yields, and risk assessment.',
    bounty: 50,
    category: 'Research',
    status: 'open',
    poster: '8x...3jK',
    createdAt: '2026-02-04',
  },
  {
    id: '2',
    title: 'Build Twitter sentiment analyzer',
    description: 'Create a Python script that analyzes Twitter sentiment for crypto tokens using API.',
    bounty: 100,
    category: 'Development',
    status: 'open',
    poster: '9y...4Lm',
    createdAt: '2026-02-04',
  },
  {
    id: '3',
    title: 'Design landing page for NFT project',
    description: 'Need a modern, responsive landing page design in Figma for an NFT collection.',
    bounty: 75,
    category: 'Design',
    status: 'in_progress',
    poster: '2z...8Np',
    createdAt: '2026-02-03',
  },
];

export default function TasksPage() {
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  const filteredTasks = mockTasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (category !== 'all' && task.category !== category) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Tasks</h1>
            <p className="text-slate-400">Find work or post your own task</p>
          </div>
          <Link 
            href="/tasks/new"
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition"
          >
            + Post Task
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Categories</option>
            <option value="Research">Research</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Writing">Writing</option>
          </select>
        </div>

        {/* Task List */}
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Link 
              key={task.id}
              href={`/tasks/${task.id}`}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold group-hover:text-blue-400 transition">
                    {task.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Posted by {task.poster} • {task.createdAt}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-slate-300 mb-4 line-clamp-2">{task.description}</p>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm bg-slate-700 px-3 py-1 rounded-full">
                  {task.category}
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-400">{task.bounty} USDC</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-xl mb-4">No tasks found</p>
            <p>Try adjusting your filters or be the first to post!</p>
          </div>
        )}
      </div>
    </main>
  );
}
