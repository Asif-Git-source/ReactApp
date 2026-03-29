/**
 * REDUX TOOLKIT — createSlice
 *
 * createSlice combines action creators and reducers in one place.
 * Immer is built-in so you can write "mutating" syntax that is
 * actually immutable under the hood.
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '../../types';

const initialColumns = ['todo', 'in-progress', 'review', 'done'] as const;

const seed: Task[] = [
  { id: 't1', title: 'Design system tokens', description: 'Define color + spacing scale', status: 'todo', priority: 'high', assignee: 'Alex J.', createdAt: new Date().toISOString(), tag: 'design' },
  { id: 't2', title: 'Auth API integration', description: 'Connect login to backend', status: 'todo', priority: 'high', assignee: 'Sam R.', createdAt: new Date().toISOString(), tag: 'backend' },
  { id: 't3', title: 'Dashboard charts', description: 'Recharts integration', status: 'in-progress', priority: 'medium', assignee: 'Alex J.', createdAt: new Date().toISOString(), tag: 'frontend' },
  { id: 't4', title: 'Redux store setup', description: 'RTK slices & middleware', status: 'in-progress', priority: 'high', assignee: 'Jamie K.', createdAt: new Date().toISOString(), tag: 'frontend' },
  { id: 't5', title: 'Unit test coverage', description: 'Vitest + Testing Library', status: 'review', priority: 'medium', assignee: 'Sam R.', createdAt: new Date().toISOString(), tag: 'testing' },
  { id: 't6', title: 'CI/CD pipeline', description: 'GitHub Actions deploy', status: 'done', priority: 'low', assignee: 'Taylor M.', createdAt: new Date().toISOString(), tag: 'devops' },
  { id: 't7', title: 'Accessibility audit', description: 'WCAG 2.1 compliance', status: 'done', priority: 'medium', assignee: 'Jamie K.', createdAt: new Date().toISOString(), tag: 'frontend' },
];

interface BoardState {
  tasks: Task[];
  columns: typeof initialColumns;
}

const boardSlice = createSlice({
  name: 'board',
  initialState: { tasks: seed, columns: initialColumns } as BoardState,
  reducers: {
    moveTask: (state, action: PayloadAction<{ taskId: string; newStatus: Task['status'] }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) task.status = action.payload.newStatus;
    },
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt'>>) => {
      state.tasks.push({
        ...action.payload,
        id: `t${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
  },
});

export const { moveTask, addTask, deleteTask } = boardSlice.actions;
export default boardSlice.reducer;
