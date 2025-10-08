import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function setAdminPasscode() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL not set in .env');
    }
    
    const passcode = '2025';
    const hashedPasscode = await bcrypt.hash(passcode, 10);
    
    await prisma.admin.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { passcode: hashedPasscode },
      create: { 
        email: adminEmail.toLowerCase(),
        passcode: hashedPasscode
      }
    });
    
    console.log('✅ Admin passcode set successfully to: 2025');
    console.log(`📧 Admin email: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Error setting admin passcode:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPasscode();
