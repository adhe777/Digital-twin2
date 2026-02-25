$ErrorActionPreference = "Stop"

# 1. Register
$regBody = @{
    name = "TestUser"
    email = "testapi@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "Registration Success: $($regResponse.token)"
    $token = $regResponse.token
} catch {
    Write-Host "Registration Failed or User Exists. Trying Login..."
}

# 2. Login (if reg skipped or for fresh token)
if (-not $token) {
    $loginBody = @{
        email = "testapi@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $token = $loginResponse.token
        Write-Host "Login Success. Token acquired."
    } catch {
        Write-Host "Login Failed: $_"
        exit
    }
}

# 3. Save Routine
$routineBody = @{
    sleepHours = 7
    studyHours = 5
    screenTime = 3
    mood = 4
    date = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

try {
    $routineResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/routines" -Method Post -Body $routineBody -Headers $headers -ContentType "application/json"
    Write-Host "Save Routine Success: $($routineResponse.success)"
    Write-Host "Data: $($routineResponse.data | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Save Routine Failed: $_"
    # Print detailed error if available
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Server Error: $($reader.ReadToEnd())"
}
