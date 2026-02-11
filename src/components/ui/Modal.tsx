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
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed inset-0 z-10000 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-10001 flex items-center justify-center p-4">
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`glass w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden focus:outline-none flex flex-col`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(title || showCloseButton) && (
                    <div className="px-6 py-4 flex items-center justify-between border-b border-card-border">
                      {title && (
                        <Dialog.Title className="text-xl font-bold tracking-tight text-text-primary">
                          {title}
                        </Dialog.Title>
                      )}
                      {showCloseButton && (
                        <Dialog.Close asChild>
                          <button
                            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card-border transition-all active:scale-90"
                            aria-label="Close"
                          >
                            <X size={20} />
                          </button>
                        </Dialog.Close>
                      )}
                    </div>
                  )}
                  <div className="p-6 overflow-y-auto no-scrollbar">
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
