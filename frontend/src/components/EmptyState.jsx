import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no active data entries available at this moment.',
  icon: Icon = FolderOpen,
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/10 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-credora-deep/30 flex items-center justify-center text-credora-gold mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-gray-800">{title}</h4>
      <p className="text-xs text-gray-500 max-w-xs mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-semibold gold-gradient text-credora-dark rounded-xl shadow-sm hover:brightness-105"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
