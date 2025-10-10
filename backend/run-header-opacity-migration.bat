@echo off
echo ========================================
echo Running Header Opacity Fields Migration
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Prisma installation...
call npx prisma --version
if errorlevel 1 (
    echo ERROR: Prisma not found. Please run 'npm install' first.
    pause
    exit /b 1
)

echo.
echo Running migration...
echo.

call npx prisma migrate dev --name add_header_opacity_fields

if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo.
    echo Trying to apply migration directly to database...
    call npx prisma db execute --file prisma/migrations/add_header_opacity_fields/migration.sql
)

echo.
echo ========================================
echo Migration completed!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Test the header opacity controls in Admin -^> Settings
echo.

pause
