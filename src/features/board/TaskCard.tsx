/**
 * TASK CARD — React.memo + useCallback
 *
 * React.memo: Higher-order component that memoizes the rendered output.
 * If the parent re-renders but this component's props haven't changed,
 * React skips re-rendering it entirely. Crucial for lists where a state
 * change in one card would otherwise re-render ALL cards.
 *
 * useCallback: Memoizes a function reference. Without it, a new function
 * is created on every parent render, breaking React.memo (since the prop
 * reference changes even if the logic is the same).
 */
import { memo, useCallback, useState } from 'react';
import type { Task } from '../../types';
import Badge from '../../components/atoms/Badge';
import Modal from '../../components/organisms/Modal';
import { useAppDispatch } from '../../store/hooks';
import { deleteTask, moveTask } from './boardSlice';
import { useToast } from '../../components/organisms/Toast';

interface TaskCardProps {
  task: Task;
  onDragStart: (taskId: string) => void;
}

const NEXT_STATUS: Record<Task['status'], Task['status'] | null> = {
  'todo': 'in-progress',
  'in-progress': 'review',
  'review': 'done',
  'done': null,
};

const TaskCard = ({ task, onDragStart }: TaskCardProps) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [showDetail, setShowDetail] = useState(false);

  // useCallback ensures this function reference is stable across renders
  const handleDragStart = useCallback(() => {
    onDragStart(task.id);
  }, [task.id, onDragStart]);

  const handleAdvance = useCallback(() => {
    const next = NEXT_STATUS[task.status];
    if (next) {
      dispatch(moveTask({ taskId: task.id, newStatus: next }));
      showToast(`Moved to ${next}`, 'success');
    }
  }, [task.id, task.status, dispatch, showToast]);

  const handleDelete = useCallback(() => {
    dispatch(deleteTask(task.id));
    showToast('Task deleted', 'error');
  }, [task.id, dispatch, showToast]);

  const priorityDot: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-slate-400',
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug flex-1">{task.title}</p>
          <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${priorityDot[task.priority]}`} title={task.priority} />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <Badge variant={task.priority} />
          <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-full">{task.tag}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{task.assignee}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setShowDetail(true)} className="text-xs text-purple-500 hover:text-purple-700 px-2 py-0.5 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30">
              view
            </button>
            {NEXT_STATUS[task.status] && (
              <button onClick={handleAdvance} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">
                advance →
              </button>
            )}
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
              ×
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Task Detail">
        <div className="space-y-3 text-sm">
          <p className="text-slate-700 dark:text-slate-200 font-medium">{task.title}</p>
          <p className="text-slate-500 dark:text-slate-400">{task.description}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={task.status} />
            <Badge variant={task.priority} />
          </div>
          <p className="text-slate-400 text-xs">Assignee: {task.assignee}</p>
          <p className="text-slate-400 text-xs">Tag: {task.tag}</p>
        </div>
      </Modal>
    </>
  );
};

export default memo(TaskCard);
