Write-Host "Building Go Lambda..."

$env:GOOS="linux"
$env:GOARCH="amd64"
$env:CGO_ENABLED="0"

go build -o bootstrap ./cmd/lambda

if (Test-Path function.zip) {
    Remove-Item function.zip
}

Compress-Archive -Path bootstrap -DestinationPath function.zip

Write-Host "Build complete"
