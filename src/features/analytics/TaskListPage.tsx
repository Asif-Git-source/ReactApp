/**
 * TASK LIST PAGE — Virtualization with react-window
 *
 * Virtualization (Windowing): When you have a large list (200+ items),
 * rendering all DOM nodes at once is expensive. react-window only renders
 * the items currently visible in the viewport — items outside are not in
 * the DOM at all. As you scroll, it reuses DOM nodes with new data.
 *
 * Result: Rendering 200 rows feels the same as 10 rows because the browser
 * only has ~10 actual DOM nodes at any time.
 *
 * Also demonstrates: useMemo for filtered/sorted lists, useCallback for
 * stable handler references, and controlled filter inputs.
 */
import { useMemo, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { List } from 'react-window';
import { mockAllTasks } from '../dashboard/api';
import Badge from '../../components/atoms/Badge';
import type { Task } from '../../types';

const ROW_HEIGHT = 64;

// Extra props passed via rowProps — index and style are injected by react-window
interface TaskRowExtraProps {
  tasks: Task[];
}

interface RowComponentProps extends TaskRowExtraProps {
  index: number;
  style: CSSProperties;
  ariaAttributes: Record<string, unknown>;
}

// rowComponent for react-window v2 — receives { index, style, ariaAttributes, ...rowProps }
const TaskRow = ({ index, style, tasks }: RowComponentProps) => {
  const task = tasks[index];
  return (
    <div
      style={style}
      className={`flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
        index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/80'
      }`}
    >
      <span className="text-xs text-slate-400 w-8 flex-shrink-0">#{index + 1}</span>
      <p className="text-sm text-slate-800 dark:text-slate-200 flex-1 truncate font-medium">{task.title}</p>
      <span className="text-xs text-slate-400 hidden sm:block w-16">{task.assignee.split(' ')[0]}</span>
      <Badge variant={task.priority} />
      <Badge variant={task.status} />
    </div>
  );
};

export default function TaskListPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');

  /**
   * useMemo: Filter 200 tasks based on search + filters.
   * Only recomputes when search/filter inputs change.
   */
  const filteredTasks = useMemo(() => {
    return mockAllTasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [search, filterStatus, filterPriority]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {filteredTasks.length} of {mockAllTasks.length} tasks — rendered with{' '}
          <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">
            react-window
          </code>{' '}
          virtualization (only visible rows are in the DOM)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search tasks..."
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Task['status'] | 'all')}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Task['priority'] | 'all')}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Virtualized List */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <span className="w-8">#</span>
          <span className="flex-1">Title</span>
          <span className="w-16 hidden sm:block">Assignee</span>
          <span className="w-16">Priority</span>
          <span className="w-20">Status</span>
        </div>

        {filteredTasks.length > 0 ? (
          <List<TaskRowExtraProps>
            rowComponent={TaskRow}
            rowCount={filteredTasks.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ tasks: filteredTasks }}
            defaultHeight={500}
            style={{ width: '100%' }}
          />
        ) : (
          <div className="flex items-center justify-center h-40 text-slate-400">
            No tasks match your filters
          </div>
        )}
      </div>
    </div>
  );
}
