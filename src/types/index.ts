// ─── Global TypeScript Types ───────────────────────────────────────────────
// Centralised type definitions shared across features.

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  createdAt: string;
  tag: string;
}

export interface StatsCard {
  label: string;
  value: number | string;
  change: number;
  icon: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}
