# shopify-mcp-server

> **A production-ready MCP (Model Context Protocol) server for Shopify** — let Claude Code and any MCP-compatible AI assistant manage your Shopify store with natural language.

[![npm version](https://img.shields.io/npm/v/shopify-mcp-server?style=flat)](https://www.npmjs.com/package/shopify-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue?style=flat)](https://modelcontextprotocol.io)
[![Shopify](https://img.shields.io/badge/Shopify-Admin_API_2024--10-96BF48?style=flat&logo=shopify)](https://shopify.dev/docs/api/admin)

---

## What this does

You talk to Claude. Claude manages your store.

```
You: "List my 5 lowest-converting products from the past 30 days"
Claude: [fetches analytics, returns ranked list with conversion rates]

You: "Add a 15% discount for VIP customers, expires end of month"
Claude: [creates the discount code, confirms the details]

You: "Rewrite product descriptions for everything tagged 'summer' to be more urgent"
Claude: [bulk-rewrites, shows you a preview, asks for confirmation before saving]
```

---

## Features

| Category | Capabilities |
|----------|-------------|
| **Products** | List, create, update, bulk-edit, archive, manage variants & inventory |
| **Orders** | Fetch by status, filter by date, get line item details, track fulfillment |
| **Customers** | Search, segment, view order history, tag management |
| **Analytics** | Sales by product/collection/period, conversion data, inventory levels |
| **Discounts** | Create percentage/fixed/free-shipping codes, set eligibility rules |
| **Collections** | Smart + manual collections, bulk product assignment |

---

## Quickstart

### 1. Install

```bash
npm install -g shopify-mcp-server
```

### 2. Get your Shopify credentials

1. Go to your Shopify Admin → **Apps** → **Develop apps**
2. Create a private app, enable the Admin API scopes you need (see [required scopes](#required-scopes))
3. Copy your **Admin API access token** and **store domain**

### 3. Configure Claude Code

Add to your `~/.claude/claude_desktop_config.json` (or `claude_code_config.json`):

```json
{
  "mcpServers": {
    "shopify": {
      "command": "shopify-mcp-server",
      "env": {
        "SHOPIFY_STORE_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxxxxxxxxx"
      }
    }
  }
}
```

### 4. Start Claude Code and verify

```bash
claude
> /mcp
# Should show: shopify ✓ connected — N tools available
```

---

## Required Scopes

Minimum scopes for full functionality:

```
read_products, write_products
read_orders, write_orders
read_customers, write_customers
read_analytics
read_inventory, write_inventory
read_price_rules, write_price_rules
read_discounts, write_discounts
```

---

## Available Tools

The server exposes these tools to Claude:

### Products
- `shopify_list_products` — search & filter products
- `shopify_get_product` — detailed product + variant data
- `shopify_create_product` — create with variants, images, collections
- `shopify_update_product` — edit title, description, status, price
- `shopify_bulk_update_status` — archive/activate/draft in bulk
- `shopify_get_inventory` — stock levels across all locations
- `shopify_set_inventory` — update stock quantities

### Orders & Customers
- `shopify_list_orders` — filter by status, date, customer
- `shopify_get_order` — full order details with line items
- `shopify_list_customers` — search by email, tag, spend, date
- `shopify_get_customer` — full customer profile

### Collections & Discounts
- `shopify_list_collections` — browse store collections
- `shopify_create_collection` — manual or smart with rules
- `shopify_create_discount` — percentage/fixed/free shipping
- `shopify_run_analytics` — ShopifyQL query runner

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_STORE_DOMAIN` | ✅ | `your-store.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | ✅ | Admin API access token (`shpat_...`) |
| `SHOPIFY_API_VERSION` | ❌ | Defaults to `2024-10` |
| `LOG_LEVEL` | ❌ | `debug` / `info` / `warn` (default: `info`) |

---

## Development

```bash
git clone https://github.com/AlperNab/shopify-mcp-server
cd shopify-mcp-server
npm install

# Copy env
cp .env.example .env
# Fill in your SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN

# Run in dev mode
npm run dev

# Run tests
npm test

# Build
npm run build
```

### Project structure

```
src/
├── index.ts          # MCP server entry point
├── tools/
│   ├── products.ts   # Product CRUD tools
│   ├── orders.ts     # Order tools
│   ├── customers.ts  # Customer tools
│   ├── discounts.ts  # Discount tools
│   ├── analytics.ts  # ShopifyQL runner
│   └── collections.ts
├── shopify/
│   ├── client.ts     # Authenticated Shopify client
│   ├── graphql.ts    # GraphQL query helpers
│   └── rest.ts       # REST fallbacks
└── utils/
    ├── pagination.ts  # Cursor-based pagination
    └── validation.ts  # Input sanitization
```

---

## Roadmap

- [ ] Metafields read/write
- [ ] Theme asset management
- [ ] Webhook registration
- [ ] Multi-store support
- [ ] Fulfillment service integration
- [ ] Blog/article management

---

## Contributing

PRs welcome. Please open an issue first to discuss major changes.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with conventional commits: `feat:`, `fix:`, `docs:`
4. Open a PR with a clear description and test coverage

---

## License

MIT © [Alper Nabil Gabra Zakher](https://github.com/AlperNab)

---

<div align="center">

**Built by an actual Shopify store owner who got tired of clicking around the admin panel.**

⭐ Star this if it saves you time

</div>
