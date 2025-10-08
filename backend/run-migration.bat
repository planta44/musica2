@echo off
echo ========================================
echo Database Migration Script
echo ========================================
echo.
echo This will add new fields to your database:
echo - Social media links (Instagram, Facebook, etc.)
echo - Contact email
echo - Fan Club fee (can be set to 0)
echo.
pause
echo.
echo Running migration...
echo.
npx prisma migrate dev --name add_social_media_and_contact_fields
echo.
echo ========================================
echo Migration complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server (npm run dev)
echo 2. Refresh admin dashboard
echo 3. Go to Settings to configure social media links
echo.
pause
