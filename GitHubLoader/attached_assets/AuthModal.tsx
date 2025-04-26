import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserStore, useUIStore } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// Validation schemas
const phoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits')
});

const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits')
});

// Type definitions
type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type AuthStep = 'phone' | 'otp';

/**
 * Authentication Modal Component
 * Handles phone verification and OTP-based login
 */
export default function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal } = useUIStore();
  const { login } = useUserStore();
  const { toast } = useToast();
  
  // State
  const [step, setStep] = useState<AuthStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Form setup
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' }
  });
  
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });
  
  /**
   * Handle phone number submission to request OTP
   */
  const onPhoneSubmit = useCallback(async (data: PhoneFormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone }),
      });
      
      // Check if the API request was successful
      if (response && response.success) {
        setPhoneNumber(data.phone);
        setStep('otp');
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code',
        });
      } else {
        throw new Error(response?.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);
  
  /**
   * Handle OTP verification for login
   */
  const onOtpSubmit = useCallback(async (data: OtpFormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          otp: data.otp 
        }),
      });
      
      // Process successful login
      if (response && response.user && response.token) {
        login(response.user, response.token);
        toggleAuthModal(); // Close the modal
        
        toast({
          title: 'Logged In',
          description: response.message || 'You have successfully logged in',
        });
      } else {
        throw new Error(response?.message || 'Invalid verification code');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [phoneNumber, login, toggleAuthModal, toast]);
  
  /**
   * Reset to phone entry step
   */
  const resetToPhoneStep = useCallback(() => {
    setStep('phone');
    otpForm.reset();
  }, [otpForm]);
  
  /**
   * Reset the entire modal state
   */
  const resetModalState = useCallback(() => {
    setTimeout(() => {
      phoneForm.reset();
      otpForm.reset();
      setStep('phone');
      setPhoneNumber('');
    }, 300);
  }, [phoneForm, otpForm]);
  
  /**
   * Handle dialog open state changes
   */
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      toggleAuthModal();
      resetModalState();
    }
  }, [toggleAuthModal, resetModalState]);
  
  /**
   * Render loading spinner with text
   */
  const LoadingSpinner = ({ text }: { text: string }) => (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {text}
    </>
  );
  
  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'phone' ? 'Enter Your Phone Number' : 'Enter Verification Code'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' 
              ? 'We\'ll send you a one-time password to verify your phone'
              : `We've sent a 6-digit verification code to ${phoneNumber}`}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'phone' ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="e.g., 9876543210" 
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting 
                  ? <LoadingSpinner text="Sending code..." /> 
                  : 'Send Verification Code'
                }
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP 
                        maxLength={6} 
                        {...field}
                        inputMode="numeric"
                      >
                        <InputOTPGroup>
                          {[...Array(6)].map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting 
                    ? <LoadingSpinner text="Verifying..." /> 
                    : 'Verify & Login'
                  }
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={resetToPhoneStep}
                  className="text-sm"
                >
                  Change Phone Number
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}