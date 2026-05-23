#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";

import { productTools, handleProductTool } from "./tools/products.js";
import { orderTools, handleOrderTool } from "./tools/orders.js";
import { customerTools, handleCustomerTool } from "./tools/customers.js";
import { discountTools, handleDiscountTool } from "./tools/discounts.js";
import { collectionTools, handleCollectionTool } from "./tools/collections.js";
import { analyticsTools, handleAnalyticsTool } from "./tools/analytics.js";
import { inventoryTools, handleInventoryTool } from "./tools/inventory.js";
import { createShopifyClient } from "./shopify/client.js";

dotenv.config();

const REQUIRED_ENV = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ACCESS_TOKEN"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Error: Missing required environment variable: ${key}`);
    console.error("See README.md for setup instructions.");
    process.exit(1);
  }
}

const shopify = createShopifyClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
  apiVersion: process.env.SHOPIFY_API_VERSION || "2024-10",
});

const allTools = [
  ...productTools,
  ...orderTools,
  ...customerTools,
  ...discountTools,
  ...collectionTools,
  ...analyticsTools,
  ...inventoryTools,
];

const server = new Server(
  {
    name: "shopify-mcp-server",
    version: process.env.npm_package_version || "1.0.0",
  },
  {
    capabilities: { tools: {} },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Route to correct handler by tool name prefix
    if (name.startsWith("shopify_product") || name === "shopify_get_product") {
      return await handleProductTool(name, args, shopify);
    }
    if (name.startsWith("shopify_order") || name === "shopify_get_order") {
      return await handleOrderTool(name, args, shopify);
    }
    if (name.startsWith("shopify_customer") || name === "shopify_get_customer") {
      return await handleCustomerTool(name, args, shopify);
    }
    if (name.startsWith("shopify_discount") || name === "shopify_create_discount") {
      return await handleDiscountTool(name, args, shopify);
    }
    if (name.startsWith("shopify_collection")) {
      return await handleCollectionTool(name, args, shopify);
    }
    if (name.startsWith("shopify_analytics") || name === "shopify_run_analytics") {
      return await handleAnalyticsTool(name, args, shopify);
    }
    if (name.startsWith("shopify_inventory") || name === "shopify_set_inventory") {
      return await handleInventoryTool(name, args, shopify);
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error: any) {
    const message = error?.message || "An unexpected error occurred";
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const logLevel = process.env.LOG_LEVEL || "info";
  if (logLevel === "debug") {
    console.error(
      `shopify-mcp-server running — store: ${process.env.SHOPIFY_STORE_DOMAIN} — ${allTools.length} tools loaded`
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
