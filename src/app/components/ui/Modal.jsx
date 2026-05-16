"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ open, onOpenChange, children, size = "md" }) {
  const maxWidthClass = size === "large" ? "max-w-4xl" : "max-w-md";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998] data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />

        {/* Modal Content */}
        <Dialog.Title className="opacity-0">Model Pop up</Dialog.Title>
        <Dialog.Content
          className={`
            fixed top-1/2 left-1/2 
            -translate-x-1/2 -translate-y-1/2 
            bg-white rounded-lg shadow-2xl 
            w-[95%] ${maxWidthClass} p-6
            z-[9999]
            data-[state=open]:animate-scaleIn 
            data-[state=closed]:animate-scaleOut
            focus:outline-none
          `}
        >
          {/* Actual Modal Content */}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
