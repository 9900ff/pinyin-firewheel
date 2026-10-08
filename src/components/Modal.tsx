import { useEffect, useRef, type ReactNode } from 'react';
export function Modal({
  titleId,
  children,
  className = '',
}: {
  titleId: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => e.preventDefault()}
      className={'modal ' + className}
    >
      {children}
    </dialog>
  );
}
