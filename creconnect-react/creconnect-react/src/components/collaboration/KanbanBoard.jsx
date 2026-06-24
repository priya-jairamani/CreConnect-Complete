import { useState } from 'react';
import PropTypes from 'prop-types';
import CollabCard from '@/components/collaboration/CollabCard';
import { KANBAN_STAGES, STAGE_BADGE_VARIANT } from '@/constants/collaborationOptions';
import Badge from '@/components/common/Badge';

export default function KanbanBoard({ columns, onOpen, onMessage, onSubmit, onMoveStage }) {
  const [draggedId, setDraggedId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-3 min-w-max">
        {KANBAN_STAGES.map((stage) => {
          const items = columns[stage] ?? [];
          return (
            <div
              key={stage}
              className="w-72 flex-shrink-0 rounded-2xl flex flex-col"
              style={{
                background: overStage === stage ? 'rgba(109,92,255,0.06)' : 'var(--surface)',
                border: overStage === stage ? '1px dashed var(--brand-500)' : '1px solid var(--border)',
                transition: 'background .15s, border-color .15s',
              }}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
              onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setOverStage(null);
                if (draggedId) onMoveStage(draggedId, stage);
                setDraggedId(null);
              }}
            >
              <div className="flex items-center justify-between gap-2 p-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
                <Badge variant={STAGE_BADGE_VARIANT[stage] ?? 'neutral'} label={stage} />
                <span className="text-fg-muted text-xs font-semibold">{items.length}</span>
              </div>
              <div className="p-2 flex flex-col gap-2 flex-1 min-h-[120px] max-h-[calc(100vh-22rem)] overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-fg-muted text-xs text-center py-8 opacity-60">No collaborations</div>
                ) : (
                  items.map(({ item, intel }) => (
                    <CollabCard
                      key={item.id}
                      item={item}
                      intel={intel}
                      onOpen={onOpen}
                      onMessage={onMessage}
                      onSubmit={onSubmit}
                      compact
                      draggable
                      isDragging={draggedId === item.id}
                      onDragStart={(e) => { setDraggedId(item.id); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => setDraggedId(null)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

KanbanBoard.propTypes = {
  columns:    PropTypes.object.isRequired,
  onOpen:     PropTypes.func.isRequired,
  onMessage:  PropTypes.func,
  onSubmit:   PropTypes.func,
  onMoveStage: PropTypes.func.isRequired,
};
