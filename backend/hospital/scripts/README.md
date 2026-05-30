Workflow smoke-test scripts

Files:
- `workflow_smoke_test.ps1` - PowerShell script for Windows (uses Invoke-RestMethod). Set `API_URL` and `JWT` env vars as needed.
- `workflow_smoke_test.sh` - POSIX shell script (requires `jq`). Set `API_URL` and `JWT` env vars as needed.
- `test_workflow_node.js` - Node script using `fetch`. Set `API_URL` and `JWT` env vars as needed.

Examples:

PowerShell:

```powershell
$env:API_URL = 'http://localhost:5000/api'
$env:JWT = '<your token>'
.\scripts\workflow_smoke_test.ps1
```

Shell:

```bash
export API_URL='http://localhost:5000/api'
export JWT='<your token>'
./scripts/workflow_smoke_test.sh
```

Node:

```bash
API_URL='http://localhost:5000/api' JWT='<your token>' node scripts/test_workflow_node.js
```
