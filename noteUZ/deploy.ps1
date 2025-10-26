$warPath = "C:\Users\Hubert\Documents\Github\noteUZ\noteUZ\target\noteUZ.war"
$deployPath = "C:\payara6\glassfish\domains\domain1\autodeploy\"

Copy-Item -Path $warPath -Destination $deployPath -Force

Write-Output "Deploy pliku noteUZ.war do Payara zakonczony."
