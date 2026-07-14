import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { ActionCenterModule as TActionCenterModule, ActionTask, ActionUrgency } from '@/types/homeConfig';
import { resolveIcon } from '../iconMap';

const URGENCY_STYLE: Record<ActionUrgency, { dot: string; label: string; chip: string }> = {
  critical: { dot: 'bg-red-500',    label: 'Critical', chip: 'bg-red-50 text-red-700 border-red-200' },
  high:     { dot: 'bg-amber-500',  label: 'High',     chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  medium:   { dot: 'bg-blue-500',   label: 'Medium',   chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  low:      { dot: 'bg-gray-400',   label: 'Low',      chip: 'bg-gray-50 text-gray-600 border-gray-200' },
};

function TaskRow({ task }: { task: ActionTask }) {
  const navigate = useNavigate();
  const Icon = resolveIcon(task.icon, 'Info');
  const style = URGENCY_STYLE[task.urgency];
  const isExternal = task.cta.href.startsWith('http');

  const ctaClasses =
    task.cta.kind === 'primary'
      ? 'bg-fleek-yellow text-fleek-black hover:bg-fleek-yellow-dark'
      : 'bg-white text-fleek-black border border-gray-200 hover:border-fleek-yellow';

  return (
    <div className="flex items-start gap-3 sm:gap-4 p-4 rounded-lg border border-gray-100 hover:border-fleek-yellow transition-colors bg-white">
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-fleek-yellow-light rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-fleek-black" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-sm font-bold text-fleek-black leading-tight">{task.title}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.chip}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
        {task.estimatedMinutes != null && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
            <Clock className="w-3 h-3" />
            {task.estimatedMinutes} min
          </div>
        )}
        {isExternal ? (
          <a
            href={task.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            data-home-cta="1"
            data-home-href={task.cta.href}
            data-home-task={task.taskId}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors ${ctaClasses}`}
          >
            {task.cta.label}
          </a>
        ) : (
          <button
            onClick={() => navigate(task.cta.href)}
            data-home-cta="1"
            data-home-href={task.cta.href}
            data-home-task={task.taskId}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors ${ctaClasses}`}
          >
            {task.cta.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ActionCenterModule({ module }: { module: TActionCenterModule }) {
  const { title, tasks } = module.data;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-fleek-black mb-0.5">{title}</h2>
        <p className="text-sm text-gray-500">
          {tasks.length} {tasks.length === 1 ? 'item' : 'items'} for you
        </p>
      </div>
      <div className="px-4 sm:px-6 py-4 space-y-3">
        {tasks.map((t) => (
          <TaskRow key={t.taskId} task={t} />
        ))}
      </div>
    </div>
  );
}
