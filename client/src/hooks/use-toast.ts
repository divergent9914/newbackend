import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const useToast = () => {
  function toast({
    title,
    description,
    variant = "default",
    duration = 5000,
    action,
  }: ToastProps) {
    const options: any = {
      duration,
      className: variant === "destructive" 
        ? "bg-red-100 border-l-4 border-red-500 text-red-700" 
        : variant === "success" 
          ? "bg-green-100 border-l-4 border-green-500 text-green-700" 
          : "bg-blue-100 border-l-4 border-blue-500 text-blue-700",
    };

    if (action) {
      options.action = action;
    }

    sonnerToast(title || '', {
      description,
      ...options,
    });
  }

  return { toast };
}

export default useToast;