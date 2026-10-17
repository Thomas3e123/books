@echo off
setlocal
cd /d "%~dp0"
echo Gravity Work Study Lab - Windows Beta Builder
echo Full expert package through v61
echo.
where node >nul 2>nul || (echo Node.js 22 or later is required.& exit /b 1)
node -e "let m=Number(process.versions.node.split('.')[0]);if(m<22)process.exit(1)" || (echo Node.js 22 or later is required.& exit /b 1)
if exist node_modules rmdir /s /q node_modules
call npm install || exit /b 1
call npm run sync:expert || exit /b 1
call npm run verify:expert || exit /b 1
call npm run build:win || exit /b 1
echo.
echo Build complete. Files are in the dist folder.
endlocal
