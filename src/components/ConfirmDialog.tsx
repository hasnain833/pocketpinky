"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
}: ConfirmDialogProps) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[hsl(var(--cream))] border-[hsl(var(--divider))] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl text-[hsl(var(--charcoal))]">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-[hsl(var(--text-secondary))] pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--charcoal))]"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={
                            isDestructive
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-[hsl(var(--charcoal))] hover:bg-[hsl(var(--charcoal))]/90 text-white"
                        }
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
