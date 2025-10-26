Write-Host "Zwalniam porty zajęte przez proces java.exe..."
taskkill /F /IM java.exe
Write-Host "Procesy Java zabite, porty powinny być wolne."
pause
