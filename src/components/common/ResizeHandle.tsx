import { useCallback, useRef, useState } from 'react';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  onDoubleClick?: () => void;
  direction?: 'left' | 'right';
}

export function ResizeHandle({ onResize, onDoubleClick, direction = 'right' }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const isResizingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    isResizingRef.current = true;
    startXRef.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = direction === 'right'
        ? moveEvent.clientX - startXRef.current
        : startXRef.current - moveEvent.clientX;
      onResize(delta);
      startXRef.current = moveEvent.clientX;
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize, direction]);

  return (
    <div
      className={`
        absolute top-0 bottom-0 w-2 cursor-col-resize group
        ${direction === 'right' ? 'right-0' : 'left-0'}
        ${isResizing ? 'bg-[var(--color-accent)]' : 'hover:bg-[var(--color-border)]'}
      `}
      style={{
        zIndex: 20,
        transition: isResizing ? 'none' : 'background-color 0.15s ease',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-1 h-12 rounded-full
          ${isResizing ? 'bg-[var(--color-accent)]' : 'bg-transparent group-hover:bg-[var(--color-text-tertiary)]'}
        `}
        style={{
          transition: isResizing ? 'none' : 'background-color 0.15s ease',
        }}
      />
    </div>
  );
}