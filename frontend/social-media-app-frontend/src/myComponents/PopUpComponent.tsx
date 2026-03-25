import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}


export function PopUpComponent({ isOpen, onClose, children }: ModalProps) {

  const modalRoot = document.getElementById("modal-root") || document.body;;
  if (!modalRoot || !isOpen) return null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 w-[90%] max-w-lg shadow-xl transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close popup"
          className="absolute right-2 top-1 text-xl leading-none text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
}
