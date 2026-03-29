/**
 * KANBAN BOARD PAGE
 *
 * Demonstrates:
 *  - useReducer (via Redux Toolkit boardSlice) for complex state transitions
 *  - Drag-and-drop using native HTML5 DnD API
 *  - useCallback for stable event handler references
 *  - React.memo on TaskCard to prevent unnecessary re-renders
 *  - React Hook Form + Zod for the Add Task modal form
 *  - useState for local UI state (drag tracking, modal visibility only)
 */
import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { moveTask, addTask } from './boardSlice';
import TaskCard from './TaskCard';
import Modal from '../../components/organisms/Modal';
import FormField from '../../components/molecules/FormField';
import { useToast } from '../../components/organisms/Toast';
import type { Task } from '../../types';

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',       color: 'border-slate-300' },
  { id: 'in-progress', label: 'In Progress', color: 'border-blue-400'  },
  { id: 'review',      label: 'In Review',   color: 'border-yellow-400' },
  { id: 'done',        label: 'Done',        color: 'border-green-400'  },
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
];

const TAG_OPTIONS = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend',  label: 'Backend'  },
  { value: 'devops',   label: 'DevOps'   },
  { value: 'design',   label: 'Design'   },
  { value: 'testing',  label: 'Testing'  },
];

const addTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  priority: z.enum(['low', 'medium', 'high']),
  tag:      z.enum(['frontend', 'backend', 'devops', 'design', 'testing']),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

export default function BoardPage() {
  const dispatch    = useAppDispatch();
  const tasks       = useAppSelector((state) => state.board.tasks);
  const { showToast } = useToast();
  const navigate    = useNavigate();

  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [showAddModal,  setShowAddModal]  = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { priority: 'medium', tag: 'frontend' },
  });

  // useMemo: group tasks by status — recomputes only when tasks array changes
  const columnTasks = useMemo(() => {
    return COLUMNS.reduce<Record<Task['status'], Task[]>>((acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    }, {} as Record<Task['status'], Task[]>);
  }, [tasks]);

  const handleDragStart = useCallback((taskId: string) => {
    setDraggingId(taskId);
  }, []);

  const handleDrop = useCallback(
    (status: Task['status']) => {
      if (draggingId) {
        dispatch(moveTask({ taskId: draggingId, newStatus: status }));
        showToast(`Task moved to ${status}`, 'info');
        setDraggingId(null);
      }
    },
    [draggingId, dispatch, showToast]
  );

  const onAddTask = (data: AddTaskFormData) => {
    dispatch(addTask({ ...data, status: 'todo', description: '', assignee: 'You' }));
    showToast('Task added!', 'success');
    reset();
    setShowAddModal(false);
  };

  const handleCloseModal = () => {
    reset();
    setShowAddModal(false);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sprint Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{tasks.length} tasks total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/board/new')}
            className="border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Full Form
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-x-auto">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
            className={`flex flex-col bg-slate-50 dark:bg-slate-900 rounded-xl border-t-4 ${col.color} min-h-[400px]`}
          >
            {/* Column Header */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{col.label}</span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {columnTasks[col.id]?.length ?? 0}
              </span>
            </div>

            {/* Drop Zone */}
            <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto">
              {columnTasks[col.id]?.map((task) => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal — RHF + Zod */}
      <Modal isOpen={showAddModal} onClose={handleCloseModal} title="Add New Task">
        <form onSubmit={handleSubmit(onAddTask)} className="space-y-4" noValidate>
          <FormField
            label="Title"
            required
            error={errors.title?.message}
            inputProps={{ ...register('title'), placeholder: 'e.g. Implement dark mode', autoFocus: true }}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Priority"
              required
              as="select"
              options={PRIORITY_OPTIONS}
              error={errors.priority?.message}
              inputProps={register('priority')}
            />
            <FormField
              label="Tag"
              required
              as="select"
              options={TAG_OPTIONS}
              error={errors.tag?.message}
              inputProps={register('tag')}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
