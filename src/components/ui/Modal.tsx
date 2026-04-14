import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showCloseButton = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed inset-0 z-10000 bg-black/40 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-10001 flex items-center justify-center p-4">
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ 
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                    mass: 0.8
                  }}
                  className={`glass w-full ${maxWidth} rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden focus:outline-none flex flex-col border border-white/10`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(title || showCloseButton) && (
                    <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
                      {title && (
                        <Dialog.Title className="text-xl font-semibold tracking-tight text-white/90">
                          {title}
                        </Dialog.Title>
                      )}
                      {showCloseButton && (
                        <Dialog.Close asChild>
                          <button
                            className="p-1 px-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            aria-label="Close"
                          >
                            <X size={20} />
                          </button>
                        </Dialog.Close>
                      )}
                    </div>
                  )}
                  <div className="p-7 overflow-y-auto no-scrollbar">
                    {children}
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
}

