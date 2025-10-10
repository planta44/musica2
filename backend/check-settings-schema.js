// Quick script to check if heroMediaUrlMobile field exists and is saving
import prisma from './src/lib/prisma.js';

async function checkSettings() {
  try {
    console.log('🔍 Checking SiteSettings schema and data...\n');
    
    // Get current settings
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      console.log('❌ No settings found in database!');
      console.log('💡 Create default settings first in Admin panel\n');
      return;
    }
    
    console.log('✅ Settings found!\n');
    console.log('📋 Current Hero Media URLs:');
    console.log('   Desktop URL:', settings.heroMediaUrl || '(not set)');
    console.log('   Mobile URL:', settings.heroMediaUrlMobile || '(not set)');
    console.log('\n📋 Header Opacity:');
    console.log('   Scrolled:', settings.headerOpacity ?? '(not set - run migration!)');
    console.log('   Top:', settings.headerOpacityTop ?? '(not set - run migration!)');
    console.log('\n📋 Hero Type:', settings.heroType);
    
    // Test update
    console.log('\n🧪 Testing heroMediaUrlMobile update...');
    const testUrl = 'https://test.com/mobile-test.jpg';
    
    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { heroMediaUrlMobile: testUrl }
    });
    
    console.log('✅ Update successful!');
    console.log('   New value:', updated.heroMediaUrlMobile);
    
    // Restore original value
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { heroMediaUrlMobile: settings.heroMediaUrlMobile }
    });
    console.log('✅ Restored original value\n');
    
    console.log('✅ heroMediaUrlMobile field is working correctly!');
    console.log('💡 If saving from Admin panel still fails, check browser console for errors\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Unknown arg')) {
      console.log('\n⚠️ Field does not exist in schema!');
      console.log('💡 Run: npx prisma migrate deploy');
      console.log('   or: npx prisma db push\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkSettings();
