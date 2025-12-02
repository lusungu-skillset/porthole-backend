#!/usr/bin/env pwsh

# API Base URL
$BaseUrl = "http://localhost:3005"
$headers = @{ 'Content-Type' = 'application/json' }

Write-Host "=== Pothole Reporter API Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Pothole 1
Write-Host "[TEST 1] POST /potholes - Create Pothole 1" -ForegroundColor Yellow
$body1 = @{
    latitude = -15.3875
    longitude = 28.3228
    description = "Large pothole near the main street intersection causing vehicle damage"
    reporterName = "Alice Smith"
} | ConvertTo-Json

try {
    $resp1 = Invoke-WebRequest -Uri "$BaseUrl/potholes" -Method POST -Headers $headers -Body $body1 -UseBasicParsing
    $data1 = $resp1.Content | ConvertFrom-Json
    Write-Host "✓ Success! Created Pothole ID: $($data1.id)" -ForegroundColor Green
    Write-Host "  Status: $($data1.status)"
    Write-Host "  Location: ($($data1.latitude), $($data1.longitude))"
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Create Pothole 2
Write-Host "[TEST 2] POST /potholes - Create Pothole 2" -ForegroundColor Yellow
$body2 = @{
    latitude = -15.4
    longitude = 28.35
    description = "Small crack in the asphalt near the junction"
    reporterName = "Bob Jones"
} | ConvertTo-Json

try {
    $resp2 = Invoke-WebRequest -Uri "$BaseUrl/potholes" -Method POST -Headers $headers -Body $body2 -UseBasicParsing
    $data2 = $resp2.Content | ConvertFrom-Json
    Write-Host "✓ Success! Created Pothole ID: $($data2.id)" -ForegroundColor Green
    Write-Host "  Status: $($data2.status)"
    Write-Host "  Location: ($($data2.latitude), $($data2.longitude))"
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Create Pothole 3 with Image URL
Write-Host "[TEST 3] POST /potholes - Create Pothole 3 (with image)" -ForegroundColor Yellow
$body3 = @{
    latitude = -15.415
    longitude = 28.31
    description = "Deep pothole at the corner of Main and Oak streets - very dangerous for motorcycles"
    reporterName = "Charlie Brown"
    imageUrl = "https://example.com/images/pothole-20251130.jpg"
} | ConvertTo-Json

try {
    $resp3 = Invoke-WebRequest -Uri "$BaseUrl/potholes" -Method POST -Headers $headers -Body $body3 -UseBasicParsing
    $data3 = $resp3.Content | ConvertFrom-Json
    Write-Host "✓ Success! Created Pothole ID: $($data3.id)" -ForegroundColor Green
    Write-Host "  Status: $($data3.status)"
    Write-Host "  Image: $($data3.imageUrl)"
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Fetch All Potholes
Write-Host "[TEST 4] GET /potholes - Fetch All Potholes" -ForegroundColor Yellow
try {
    $resp4 = Invoke-WebRequest -Uri "$BaseUrl/potholes" -Method GET -UseBasicParsing
    $allData = $resp4.Content | ConvertFrom-Json
    Write-Host "✓ Success! Retrieved $($allData.Length) pothole(s)" -ForegroundColor Green
    Write-Host ""
    
    foreach ($pothole in $allData) {
        Write-Host "  ID: $($pothole.id) | Status: $($pothole.status) | Reporter: $($pothole.reporterName)" -ForegroundColor Cyan
        Write-Host "    Location: ($($pothole.latitude), $($pothole.longitude))"
        Write-Host "    Description: $($pothole.description)"
        Write-Host "    Reported: $($pothole.reportedAt)"
        Write-Host ""
    }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Update Pothole Status to Verified
Write-Host "[TEST 5] PUT /potholes/1 - Update Status to Verified" -ForegroundColor Yellow
$bodyUpdate1 = @{
    status = "Verified"
} | ConvertTo-Json

try {
    $resp5 = Invoke-WebRequest -Uri "$BaseUrl/potholes/1" -Method PUT -Headers $headers -Body $bodyUpdate1 -UseBasicParsing
    $dataUpdate1 = $resp5.Content | ConvertFrom-Json
    Write-Host "✓ Success! Updated Pothole ID 1" -ForegroundColor Green
    Write-Host "  New Status: $($dataUpdate1.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Update Pothole Status to Fixed
Write-Host "[TEST 6] PUT /potholes/2 - Update Status to Fixed" -ForegroundColor Yellow
$bodyUpdate2 = @{
    status = "Fixed"
} | ConvertTo-Json

try {
    $resp6 = Invoke-WebRequest -Uri "$BaseUrl/potholes/2" -Method PUT -Headers $headers -Body $bodyUpdate2 -UseBasicParsing
    $dataUpdate2 = $resp6.Content | ConvertFrom-Json
    Write-Host "✓ Success! Updated Pothole ID 2" -ForegroundColor Green
    Write-Host "  New Status: $($dataUpdate2.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Fetch All Potholes Again (to see updated statuses)
Write-Host "[TEST 7] GET /potholes - Fetch All Potholes (Updated)" -ForegroundColor Yellow
try {
    $resp7 = Invoke-WebRequest -Uri "$BaseUrl/potholes" -Method GET -UseBasicParsing
    $allData2 = $resp7.Content | ConvertFrom-Json
    Write-Host "✓ Success! Retrieved $($allData2.Length) pothole(s)" -ForegroundColor Green
    Write-Host ""
    
    foreach ($pothole in $allData2) {
        $statusColor = switch ($pothole.status) {
            "Pending" { "Red" }
            "Verified" { "Yellow" }
            "Fixed" { "Green" }
            default { "White" }
        }
        Write-Host "  ID: $($pothole.id) | Status: " -NoNewline
        Write-Host "$($pothole.status)" -ForegroundColor $statusColor -NoNewline
        Write-Host " | Reporter: $($pothole.reporterName)"
        Write-Host "    Location: ($($pothole.latitude), $($pothole.longitude))"
        Write-Host ""
    }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 8: Try to update non-existent pothole (error handling)
Write-Host "[TEST 8] PUT /potholes/999 - Update Non-Existent Pothole (Error Test)" -ForegroundColor Yellow
$bodyUpdateFail = @{
    status = "Verified"
} | ConvertTo-Json

try {
    $resp8 = Invoke-WebRequest -Uri "$BaseUrl/potholes/999" -Method PUT -Headers $headers -Body $bodyUpdateFail -UseBasicParsing
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Expected Error! Got 404 Not Found" -ForegroundColor Green
        $errorContent = $_.Exception.Response.Content.ReadAsStream() | ConvertFrom-Json
        Write-Host "  Error Message: $($errorContent.message)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "✗ Unexpected Error: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "=== API Test Complete ===" -ForegroundColor Cyan
