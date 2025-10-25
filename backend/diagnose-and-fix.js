import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 Diagnosing Admin Dashboard Issues...\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully\n');

    // 2. Chec tables exist by trying to count records
    console.log('2. Checking database tables...');
    
    const tables = {
      'SiteSettings': () => prisma.siteSettings.count(),
      'Admin': () => prisma.admin.count(),
      'MusicItem': () => prisma.musicItem.count(),
      'Video': () => prisma.video.count(),
      'GalleryAlbum': () => prisma.galleryAlbum.count(),
      'Photo': () => prisma.photo.count(),
      'Event': () => prisma.event.count(),
      'MerchItem': () => prisma.merchItem.count(),
      'AboutSection': () => prisma.aboutSection.count(),
      'Subscriber': () => prisma.subscriber.count(),
      'LiveEvent': () => prisma.liveEvent.count()
    };

    let allTablesExist = true;
    for (const [tableName, countFn] of Object.entries(tables)) {
      try {
        const count = await countFn();
        console.log(`   ✅ ${tableName}: ${count} records`);
      } catch (error) {
        console.log(`   ❌ ${tableName}: Table doesn't exist or has issues`);
        allTablesExist = false;
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  ISSUE FOUND: Some tables are missing!');
      console.log('   Run this command to create tables:');
      console.log('   node node_modules/prisma/build/index.js db push\n');
      return;
    }

    console.log('\n3. Checking SiteSettings...');
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      console.log('   ⚠️  No SiteSettings found, creating default...');
      settings = await prisma.siteSettings.create({
        data: {
          heroType: 'video',
          heroTitle: 'Welcome to My Music',
          heroSubtitle: 'Experience the rhythm',
          primaryColor: '#9333ea',
          secondaryColor: '#000000',
          accentColor: '#a855f7',
          backgroundColor: '#000000',
          heroOpacity: 0.6,
          heroOpacityMobile: 0.6,
          backgroundOpacity: 1.0,
          fanClubAccessFee: 5.0,
          liveEventFee: 5.0,
          enableParallax: true,
          enableParticles: true,
          stickyPlayerAutoOpen: false
        }
      });
      console.log('   ✅ Default SiteSettings created');
    } else {
      console.log('   ✅ SiteSettings exists');
    }

    console.log('\n4. Checking Admin account...');
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.log('   ❌ ADMIN_EMAIL not set in .env');
    } else {
      const admin = await prisma.admin.findUnique({
        where: { email: adminEmail.toLowerCase() }
      });
      
      if (!admin) {
        console.log(`   ⚠️  Admin account for ${adminEmail} not found`);
        console.log('   Run: node src/scripts/setAdminPasscode.js');
      } else if (!admin.passcode) {
        console.log('   ⚠️  Admin account exists but no passcode set');
        console.log('   Run: node src/scripts/setAdminPasscode.js');
      } else {
        console.log(`   ✅ Admin account configured for ${adminEmail}`);
      }
    }

    console.log('\n5. Testing data operations...');
    
    // Test creating a test item
    console.log('   Testing MerchItem creation...');
    try {
      const testMerch = await prisma.merchItem.create({
        data: {
          name: 'Test Item',
          description: 'Diagnostic test',
          price: 10.0,
          stock: 0,
          displayOrder: 999
        }
      });
      console.log('   ✅ MerchItem create works');
      
      // Clean up test item
      await prisma.merchItem.delete({ where: { id: testMerch.id } });
      console.log('   ✅ MerchItem delete works');
    } catch (error) {
      console.log('   ❌ MerchItem operations failed:', error.message);
    }

    console.log('\n6. Checking upload directory...');
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadDir = path.join(__dirname, '../uploads');
    
    try {
      await fs.access(uploadDir);
      const files = await fs.readdir(uploadDir);
      console.log(`   ✅ Upload directory exists with ${files.length} files`);
    } catch (error) {
      console.log('   ⚠️  Upload directory missing, creating...');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log('   ✅ Upload directory created');
      } catch (mkdirError) {
        console.log('   ❌ Failed to create upload directory:', mkdirError.message);
      }
    }

    console.log('\n✅ DIAGNOSIS COMPLETE!\n');
    console.log('Summary:');
    console.log('--------');
    if (allTablesExist) {
      console.log('✅ All database tables exist');
      console.log('✅ Database operations working');
      console.log('\nIf you\'re still having issues:');
      console.log('1. Check browser console for errors');
      console.log('2. Verify admin is logged in (check localStorage.adminToken)');
      console.log('3. Check backend console for request errors');
      console.log('4. Try clearing browser cache and reloading');
    } else {
      console.log('❌ Database tables missing');
      console.log('\nTO FIX: Run this command:');
      console.log('node node_modules/prisma/build/index.js db push');
      console.log('\nThen run:');
      console.log('node src/scripts/setAdminPasscode.js');
    }

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('\nPossible causes:');
    console.error('1. PostgreSQL is not running');
    console.error('2. Database "musician" doesn\'t exist');
    console.error('3. Wrong credentials in .env');
    console.error('4. Network/firewall blocking connection');
    
    if (error.message.includes('does not exist')) {
      console.error('\n💡 FIX: Create the database:');
      console.error('   psql -U postgres -c "CREATE DATABASE musician;"');
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
