"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

function DialogContent({ className, children, onClose }: DialogContentProps) {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-3xl bg-background p-6 pt-4 shadow-elevated",
        className
      )}
    >
      {/* Drag handle */}
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/20" />
      {children}
      {onClose && (
        <button
          className="absolute right-4 top-4 rounded-full p-2 opacity-70 transition-opacity hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export { Dialog, DialogContent, DialogHeader, DialogTitle };
