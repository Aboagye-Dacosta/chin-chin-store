"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CustomAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText: string;
  cancelText: string;
  loading?: boolean;
  action: () => void;
  cancel: () => void;
}

export const CustomAlertDialog = ({
  open,
  onOpenChange,
  title,
  description,
  actionText,
  cancelText,
  loading,
  action,
  cancel,
}: Readonly<CustomAlertDialogProps>) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={action} disabled={loading}>
            <Button asChild loading={loading} disabled={loading}>
              {actionText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
