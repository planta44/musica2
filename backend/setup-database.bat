@echo off
echo ====================================
echo Database Setup Script
echo ====================================
echo.

echo Step 1: Running Prisma migrations...
node node_modules/prisma/build/index.js migrate dev --name init
if %errorlevel% neq 0 (
    echo.
    echo Migration failed, trying db push...
    node node_modules/prisma/build/index.js db push
)

echo.
echo Step 2: Generating Prisma Client...
node node_modules/prisma/build/index.js generate

echo.
echo Step 3: Setting admin passcode...
node src/scripts/setAdminPasscode.js

echo.
echo ====================================
echo Setup complete!
echo ====================================
echo.
echo You can now start the server with:
echo   npm run dev
echo.
pause
