@echo off
REM Deployment Script for India Tech Atlas (Windows)
REM Run this script to deploy the application

echo Deploying India Tech Atlas...

REM Check if .htaccess exists, if not rename htaccess
if not exist .htaccess (
    if exist htaccess (
        echo Renaming htaccess to .htaccess...
        ren htaccess .htaccess
    )
)

REM Create necessary directories
echo Creating directories...
if not exist backups mkdir backups
if not exist server\backups mkdir server\backups
if not exist logs mkdir logs
if not exist cache mkdir cache

REM Check PHP version
echo Checking PHP version...
php -v

REM Check if database is configured
if exist server\config.php (
    echo Configuration file found
) else (
    echo Warning: server\config.php not found
)

REM Run database installation if needed
set /p install="Run database installation? (y/n): "
if /i "%install%"=="y" (
    php server\install.php
)

echo Deployment complete!
echo Your application is ready at: https://yourdomain.com
pause

