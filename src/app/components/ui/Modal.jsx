"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ open, onOpenChange, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50  data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />

        {/* Modal Content */}
        <Dialog.Title className="opacity-0">Model Pop up</Dialog.Title>
        <Dialog.Content
          className="
            fixed top-1/2 left-1/2 
            -translate-x-1/2 -translate-y-1/2 
            bg-white rounded-sm shadow-xl 
            w-[90%] max-w-md p-6
            data-[state=open]:animate-scaleIn 
            data-[state=closed]:animate-scaleOut
          "
        >
        
          {/* Actual Modal Content */}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
