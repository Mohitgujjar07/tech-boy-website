# ============================================================
# Tech Boy Solutions — Built-in Local HTTP Server
# Runs directly in PowerShell using standard .NET HttpListener
# ============================================================

$port = 3000
$baseDir = "d:\techboy-sol-web"
$prefix = "http://localhost:$port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host " Tech Boy Solutions Local Server Running!" -ForegroundColor Green
    Write-Host " URL: $prefix" -ForegroundColor Yellow
    Write-Host " Root Directory: $baseDir" -ForegroundColor Gray
    Write-Host " Press Ctrl+C in this window to stop the server." -ForegroundColor Gray
    Write-Host "====================================================" -ForegroundColor Cyan

    # Open default browser
    Start-Process $prefix
} catch {
    Write-Warning "Could not start on port $port: $_. Trying port 8080..."
    $port = 8080
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Start-Process $prefix
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".gif"  = "image/gif"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
            $path = "/index.html"
        }

        # Normalize relative path and prevent directory traversal
        $cleanPath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($baseDir, $cleanPath)

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>File not found: $path</p>")
            $response.StatusCode = 404
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.Close()
    } catch {
        # Handle client disconnect or listener stop gracefully
    }
}
