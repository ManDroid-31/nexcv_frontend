import React, { useState } from 'react';
import { GripVertical, Edit3 } from 'lucide-react';
import { Input, Button } from '@/components';

interface DraggableSectionProps {
  title: string;
  children: React.ReactNode;
  onTitleChange?: (newTitle: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({ title, children, onTitleChange, dragHandleProps }) => {
  const [editing, setEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleEdit = () => {
    setEditing(true);
    setTempTitle(title);
  };

  const handleSave = () => {
    if (onTitleChange && tempTitle.trim() && tempTitle !== title) {
      onTitleChange(tempTitle.trim());
    }
    setEditing(false);
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm mb-4 p-4 flex flex-col gap-2 group relative">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="cursor-grab text-muted-foreground select-none"
          title="Drag section"
          {...dragHandleProps}
        >
          <GripVertical className="w-4 h-4" />
        </span>
        {onTitleChange ? (
          editing ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                className="w-40 h-8 text-base font-semibold"
                autoFocus
                onBlur={handleSave}
              />
              <Button type="submit" size="sm" variant="outline">Save</Button>
            </form>
          ) : (
            <span className="text-base font-semibold mr-2">
              {title}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="ml-2 p-1 h-6 w-6"
                onClick={handleEdit}
                tabIndex={-1}
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </span>
          )
        ) : (
          <span className="text-base font-semibold">{title}</span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DraggableSection; 