import { useState } from "react";
import { useUIStore, useUserStore } from "@/lib/store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number").max(10)
});

const otpSchema = z.object({
  otp: z.string().min(6, "Please enter a valid OTP").max(6)
});

export default function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal } = useUIStore();
  const { login } = useUserStore();
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: ""
    }
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ""
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`
      });
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phoneNumber}`,
        token: otp,
        type: "sms"
      });
      
      if (error) throw new Error(error.message);
      
      // Get the user profile from our backend
      const response = await apiRequest("POST", "/api/auth/verify", {
        phone: phoneNumber,
        supabaseUserId: data.user?.id
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
      });
      toggleAuthModal();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    setPhoneNumber(values.phone);
    sendOtpMutation.mutate(values.phone);
  }

  function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    verifyOtpMutation.mutate(values.otp);
  }

  function handleResendOtp() {
    sendOtpMutation.mutate(phoneNumber);
  }

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
        <div className="flex flex-col space-y-1.5 text-center">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Login to your account</h2>
          <p className="text-sm text-muted-foreground">Enter your phone number to receive an OTP</p>
        </div>
        
        {!otpSent ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="flex flex-col gap-4">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your 10-digit number"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={sendOtpMutation.isPending}>
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="flex flex-col gap-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter the 6-digit OTP"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Didn't receive the OTP? 
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-primary p-0 h-auto" 
                        onClick={handleResendOtp}
                        disabled={sendOtpMutation.isPending}
                      >
                        Resend
                      </Button>
                    </p>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
