# PowerShell smoke tests for Clinical Workflow endpoints
# Usage: Set $env:API_URL and $env:JWT if needed, then run in PowerShell

$API = $env:API_URL ? $env:API_URL : 'http://localhost:5000/api'
$headers = @{}
if ($env:JWT) { $headers['Authorization'] = "Bearer $env:JWT" }

Write-Host "Using API: $API"

# 1) Create workflow (ADMIN)
$body = @{
  name = 'Test Workflow'
  description = 'Workflow created by smoke test'
  steps = @(
    @{ key = 'triage'; name = 'Triage' },
    @{ key = 'assessment'; name = 'Assessment' },
    @{ key = 'treatment'; name = 'Treatment' }
  )
} | ConvertTo-Json -Depth 5

try {
  $resp = Invoke-RestMethod -Method Post -Uri "$API/workflows" -Body $body -Headers $headers -ContentType 'application/json'
  $workflow = $resp.workflow
  Write-Host "Created workflow id:" $workflow.id
} catch {
  Write-Host "Create workflow failed:" $_.Exception.Message
}

# 2) List workflows
try {
  $list = Invoke-RestMethod -Method Get -Uri "$API/workflows" -Headers $headers
  Write-Host "Workflows count:" ($list | Measure-Object).Count
} catch {
  Write-Host "List workflows failed:" $_.Exception.Message
}

# 3) Instantiate the workflow
if ($workflow) {
  $instBody = @{ context = @{ patientId = 1 } } | ConvertTo-Json -Depth 5
  try {
    $instResp = Invoke-RestMethod -Method Post -Uri "$API/workflows/$($workflow.id)/instantiate" -Body $instBody -Headers $headers -ContentType 'application/json'
    $instance = $instResp.instance
    Write-Host "Created instance id:" $instance.id
  } catch {
    Write-Host "Instantiate failed:" $_.Exception.Message
  }

  # 4) Transition instance
  if ($instance) {
    $trans = @{ targetStepKey = 'assessment'; details = 'Move to assessment' } | ConvertTo-Json
    try {
      $tresp = Invoke-RestMethod -Method Post -Uri "$API/workflows/instances/$($instance.id)/transition" -Body $trans -Headers $headers -ContentType 'application/json'
      Write-Host "Transition response:" ($tresp | ConvertTo-Json -Depth 3)
    } catch {
      Write-Host "Transition failed:" $_.Exception.Message
    }

    # 5) Get instance
    try {
      $getInst = Invoke-RestMethod -Method Get -Uri "$API/workflows/instances/$($instance.id)" -Headers $headers
      Write-Host "Instance currentStepKey:" $getInst.currentStepKey
    } catch {
      Write-Host "Get instance failed:" $_.Exception.Message
    }
  }
}
