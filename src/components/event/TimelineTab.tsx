'use client';

import { useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { EventPlan, TaskCategory, TaskItem, TaskPriority } from '@/types/event';
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_BADGES,
  checkTaskDependenciesInIndex,
  createTaskIndex,
  isTaskOverdue,
} from '@/utils/timeline';
import { formatDate, getCountdownLabel } from '@/utils/formatters';
import { createId } from '@/utils/ids';

interface TaskDraft {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  daysBeforeEvent: number;
  dueDate: string;
}

const EMPTY_TASK: TaskDraft = {
  title: '',
  description: '',
  category: 'general',
  priority: 'medium',
  daysBeforeEvent: 7,
  dueDate: '',
};

interface TimelineTabProps {
  event: EventPlan;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (task: TaskItem) => void;
}

export function TimelineTab({
  event,
  isRegenerating,
  onRegenerate,
  onToggleTask,
  onDeleteTask,
  onCreateTask,
}: TimelineTabProps) {
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<TaskDraft>(EMPTY_TASK);

  const taskRows = useMemo(() => {
    const referenceDate = new Date();
    const taskIndex = createTaskIndex(event.tasks);

    return event.tasks
      .filter((task) => {
        if (taskCategoryFilter !== 'all' && task.category !== taskCategoryFilter) return false;
        if (taskStatusFilter === 'completed' && !task.isCompleted) return false;
        if (taskStatusFilter === 'pending' && task.isCompleted) return false;
        if (taskStatusFilter === 'overdue' && !isTaskOverdue(task, referenceDate)) return false;
        return true;
      })
      .map((task) => ({
        task,
        overdue: isTaskOverdue(task, referenceDate),
        dependencyCheck: checkTaskDependenciesInIndex(task, taskIndex),
        priorityBadge: TASK_PRIORITY_BADGES[task.priority],
        countdown: getCountdownLabel(task.dueDate, referenceDate),
      }));
  }, [event.tasks, taskCategoryFilter, taskStatusFilter]);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const taskDate =
      newTask.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    onCreateTask({
      id: createId('custom-t'),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      category: newTask.category,
      priority: newTask.priority,
      daysBeforeEvent: newTask.daysBeforeEvent,
      dueDate: taskDate,
      isCustomDate: true,
      isCompleted: false,
    });

    setShowAddTaskModal(false);
    setNewTask(EMPTY_TASK);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-[#D4C6B6] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#182620]">
              Timeline & Preparation Checklist
            </h2>
            <p className="text-xs text-[#5C6E64]">
              Relative offsets converted to dates via date-fns. Check off tasks as you finish
              them.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              isLoading={isRegenerating}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Regenerate Tasks
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddTaskModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Custom Task
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <label htmlFor="task-status-filter" className="text-[#5C6E64] font-medium">
              Status:
            </label>
            <select
              id="task-status-filter"
              value={taskStatusFilter}
              onChange={(changeEvent) => setTaskStatusFilter(changeEvent.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
              <option value="overdue">Overdue Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="task-category-filter" className="text-[#5C6E64] font-medium">
              Category:
            </label>
            <select
              id="task-category-filter"
              value={taskCategoryFilter}
              onChange={(changeEvent) => setTaskCategoryFilter(changeEvent.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            >
              <option value="all">All Categories</option>
              {Object.entries(TASK_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {taskRows.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#5C6E64] bg-white">
            No tasks match the selected filters.
          </Card>
        ) : (
          taskRows.map(({ task, overdue, dependencyCheck, priorityBadge, countdown }) => (
            <Card
              key={task.id}
              className={`p-4 transition-all border ${
                task.isCompleted
                  ? 'bg-[#FAF7F2] border-[#E5DDD3] opacity-75'
                  : overdue
                    ? 'bg-rose-50/50 border-rose-300'
                    : 'bg-white border-[#E5DDD3] hover:border-[#2D5A43]'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as ${
                    task.isCompleted ? 'incomplete' : 'complete'
                  }`}
                  className="mt-1 p-0.5 text-[#2D5A43] hover:scale-110 transition-transform cursor-pointer"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2D5A43] fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#5C6E64]" />
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-bold ${
                        task.isCompleted
                          ? 'line-through text-[#5C6E64]'
                          : 'text-[#182620]'
                      }`}
                    >
                      {task.title}
                    </h3>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}
                    >
                      {task.priority}
                    </span>

                    <Badge variant="neutral" size="sm">
                      {TASK_CATEGORY_LABELS[task.category] || task.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#5C6E64] leading-relaxed">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#5C6E64]">
                    <span className={`font-medium ${overdue ? 'text-red-600 font-bold' : ''}`}>
                      Due: {formatDate(task.dueDate)} ({countdown.text})
                    </span>

                    {task.estimatedDuration && (
                      <span>Estimated Duration: {task.estimatedDuration}</span>
                    )}

                    {dependencyCheck.isBlocked && (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Prerequisite uncompleted:{' '}
                        {dependencyCheck.missingDependencies[0]?.title}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  aria-label="Delete task"
                  className="p-1 rounded-md text-[#5C6E64] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        title="Add Preparation Task"
        confirmLabel="Add Task"
        onConfirm={handleCreateTask}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label htmlFor="task-title" className="font-semibold block mb-1">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Order custom milestone bento cake"
              value={newTask.title}
              onChange={(changeEvent) =>
                setNewTask((current) => ({ ...current, title: changeEvent.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-priority" className="font-semibold block mb-1">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTask.priority}
                onChange={(changeEvent) =>
                  setNewTask((current) => ({
                    ...current,
                    priority: changeEvent.target.value as TaskPriority,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="font-semibold block mb-1">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={newTask.dueDate}
                onChange={(changeEvent) =>
                  setNewTask((current) => ({
                    ...current,
                    dueDate: changeEvent.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-description" className="font-semibold block mb-1">
              Description / Notes
            </label>
            <textarea
              id="task-description"
              rows={2}
              placeholder="Actionable details and checklist reminders..."
              value={newTask.description}
              onChange={(changeEvent) =>
                setNewTask((current) => ({
                  ...current,
                  description: changeEvent.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
