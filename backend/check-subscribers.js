import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubscribers() {
  try {
    console.log('🔍 Checking subscribers in database...');
    
    const allSubscribers = await prisma.subscriber.findMany();
    console.log(`📊 Total subscribers: ${allSubscribers.length}`);
    
    const fanClubMembers = await prisma.subscriber.findMany({
      where: { isFanClub: true }
    });
    console.log(`💜 Fan club members: ${fanClubMembers.length}`);
    
    const verifiedSubscribers = await prisma.subscriber.findMany({
      where: { emailVerified: true }
    });
    console.log(`✅ Verified subscribers: ${verifiedSubscribers.length}`);
    
    console.log('\n📋 All subscribers:');
    allSubscribers.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.email} (${sub.name}) - Fan Club: ${sub.isFanClub}, Verified: ${sub.emailVerified}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscribers();
