import { Router } from 'express';
import { storage } from '../storage';
import { phoneSchema, verifyOtpSchema } from '../models/schema';
import { z } from 'zod';

const router = Router();

// Function to generate OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to simulate sending OTP (in production, this would use a real SMS service)
async function sendOTP(phone: string, otp: string): Promise<boolean> {
  // In a real implementation, this would send an SMS
  console.log(`Sending OTP ${otp} to ${phone}`);
  return true;
}

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    // Validate phone number
    const { phone } = phoneSchema.parse(req.body);
    
    // Generate OTP
    const otp = generateOTP();
    
    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Store OTP in the database
    const otpRecord = await db.insert(otpVerifications).values({
      phone,
      otp,
      expiresAt,
      isVerified: false
    }).returning();
    
    // Send OTP via SMS (simulated for now)
    await sendOTP(phone, otp);
    
    res.status(200).json({ 
      message: "OTP sent successfully", 
      phone,
      // Only include OTP in development mode
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error: any) {
    console.error("Error requesting OTP:", error);
    res.status(400).json({ message: error.message || "Authentication failed" });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    // Validate phone and OTP
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    
    // Find the OTP verification record
    const [otpRecord] = await db.select()
      .from(otpVerifications)
      .where(sql`${otpVerifications.phone} = ${phone} AND ${otpVerifications.otp} = ${otp}`)
      .orderBy(otpVerifications.createdAt, 'desc')
      .limit(1);
    
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ message: "OTP expired" });
    }
    
    // Mark OTP as verified
    await db.update(otpVerifications)
      .set({ isVerified: true })
      .where(eq(otpVerifications.id, otpRecord.id));
    
    // Find or create user
    let user = await storage.getUserByPhone(phone);
    if (!user) {
      user = await storage.createUser({
        phone,
        username: `user_${Date.now()}`
      });
    }
    
    // Return user data and token
    res.status(200).json({
      message: "Authentication successful",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || null
      },
      token: `user_${user.id}_${Date.now()}` // In production, this would be a proper JWT
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(400).json({ message: error.message || "Authentication failed" });
  }
});

export default router;