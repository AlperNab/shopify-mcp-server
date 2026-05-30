# Shopify Mcp Server — Standalone Real GUI Implementation

This folder is now its own runnable project app. It does not depend on the root all-project dashboard at runtime.

## Run

```bash
./run_gui.sh
```

Windows:

```powershell
.\run_gui_windows.ps1
```

Default URL: `http://127.0.0.1:9153`

## What is inside this project folder

- `app/` — FastAPI backend for this project.
- `static/` — elegant browser GUI.
- `plugins/shopify-mcp-server.json` — this project’s own feature/customization/input schema.
- `project_config.json` — readable copy of the same project-specific configuration.
- `data/` — local SQLite jobs, uploads, exports.
- `tests/` — verifies this project has a registered real local engine.

## Project-specific scope

- Domain: `E-commerce / Shopify Ops`
- Target user: `Domain operator, business owner, analyst, or team member who needs this workflow executed reliably.`
- Core job: MCP tools → Shopify store operations
- Suite: `E-commerce Growth Suite`

## Deep features applied

- bulk product ops
- inventory checks
- discount workflows
- customer segments
- abandoned cart insights
- approval gates
- audit logs
- analytics questions

## Customization controls

- `execution_mode` — Execution mode (select)
- `store` — store (text)
- `scopes` — scopes (text)
- `allowed_actions` — allowed actions (text)
- `approval_rules` — approval rules (textarea)
- `rate_limits` — rate limits (text)
- `product_fields` — product fields (text)
- `risk_policy` — risk policy (text)
- `output_format` — output format (select)
- `language` — language (select)
- `privacy_mode` — privacy mode (select)
- `confidence_threshold` — Confidence threshold (slider)

## Input fields

- `mcp_tools` — MCP tools (text) required
- `work_brief` — Work brief / source text / URL / instructions (textarea) required

## External data policy

The local deterministic core is real and executable. Live external systems are not simulated. If Shopify, ATS, ERP, OCR/STT, maps, SERP, market data, medical databases, tax/customs databases, or other live systems are required, this project reports the missing connector/API requirement instead of inventing data.

---

## Final UX/UI Layer

This project now uses the **Growth Command Center** pattern.

**UX workflow:** Research → positioning → content/ads → launch queue → measurement

**Domain components:**
- Shopify tool cards
- Product/inventory grid
- Order/customer action queue
- Approval gates
- Audit log

**Quick actions:**
- Check product ops
- Prepare inventory actions
- Create safe approval queue
- Generate store ops report

**No fake-data policy:** external/live actions require real connectors or API keys. Missing connectors are reported instead of simulated.
