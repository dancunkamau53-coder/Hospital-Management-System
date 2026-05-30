#!/usr/bin/env bash
# Shell smoke tests for Clinical Workflow endpoints
# Usage: export API_URL and JWT then run: ./workflow_smoke_test.sh
API=${API_URL:-http://localhost:5000/api}
AUTH_HEADER=""
if [ -n "$JWT" ]; then
  AUTH_HEADER="-H \"Authorization: Bearer $JWT\""
fi

set -e

echo "Using API: $API"

# 1) Create workflow
CREATE_PAYLOAD='{ "name":"Test Workflow", "description":"smoke", "steps":[{"key":"triage","name":"Triage"},{"key":"assessment","name":"Assessment"},{"key":"treatment","name":"Treatment"}] }'
resp=$(curl -s -X POST "$API/workflows" -H "Content-Type: application/json" $([ -n "$JWT" ] && echo "-H 'Authorization: Bearer $JWT'") -d "$CREATE_PAYLOAD")
echo "Create response: $resp"
workflow_id=$(echo "$resp" | jq -r '.workflow.id')

# 2) List workflows
curl -s $([ -n "$JWT" ] && echo "-H 'Authorization: Bearer $JWT'") "$API/workflows" | jq '. | length as $n | {count:$n, items:.}'

# 3) Instantiate
if [ "$workflow_id" != "null" ]; then
  inst=$(curl -s -X POST "$API/workflows/$workflow_id/instantiate" -H "Content-Type: application/json" $([ -n "$JWT" ] && echo "-H 'Authorization: Bearer $JWT'") -d '{"context":{"patientId":1}}')
  echo "Instantiate: $inst"
  instance_id=$(echo "$inst" | jq -r '.instance.id')

  # 4) Transition
  curl -s -X POST "$API/workflows/instances/$instance_id/transition" -H "Content-Type: application/json" $([ -n "$JWT" ] && echo "-H 'Authorization: Bearer $JWT'") -d '{"targetStepKey":"assessment","details":"moving"}' | jq '.'

  # 5) Get instance
  curl -s $([ -n "$JWT" ] && echo "-H 'Authorization: Bearer $JWT'") "$API/workflows/instances/$instance_id" | jq '.'
fi
