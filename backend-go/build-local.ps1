Write-Host "Building Go Local Windows..."

$env:GOOS="windows"
$env:GOARCH="amd64"
go build -o local.exe ./cmd/local


Write-Host "Build complete"
