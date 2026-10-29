@echo off
echo ========================================================
echo Deploying PolyTube Arabic to GitHub Pages (gh-pages)
echo ========================================================
echo.

cd /d "%~dp0.."
call npm run build:single

if not exist "dist" (
    echo Error: dist directory not found!
    exit /b 1
)

cd dist
if exist ".git" rd /s /q ".git"
git init
git add -A
git commit -m "Deploy v1.7.0 with centered auto-scroll, reverse subtitle seek, and full Tashkeel vocalization"
git push -f https://github.com/aneesma1/polytube-arabic.git HEAD:gh-pages
rd /s /q ".git"

echo.
echo ========================================================
echo Successfully deployed to https://aneesma1.github.io/polytube-arabic/
echo ========================================================
