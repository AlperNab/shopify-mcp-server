import { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ShopifyClient } from "../shopify/client.js";

export const productTools: Tool[] = [
  {
    name: "shopify_list_products",
    description:
      "List and search products in the Shopify store. Supports filtering by title, status, vendor, tag, price range, and collection.",
    inputSchema: {
      type: "object",
      properties: {
        query:        { type: "string",  description: "Search query (e.g. 'title:blue shirt status:active')" },
        first:        { type: "number",  description: "Number of products to return (default 10, max 50)", default: 10 },
        status:       { type: "string",  enum: ["ACTIVE", "DRAFT", "ARCHIVED"], description: "Filter by status" },
        vendor:       { type: "string",  description: "Filter by vendor" },
        product_type: { type: "string",  description: "Filter by product type" },
        after:        { type: "string",  description: "Pagination cursor (from previous response)" },
      },
    },
  },
  {
    name: "shopify_get_product",
    description: "Get full details of a single product including all variants, images, inventory, and metafields.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "Product GID (gid://shopify/Product/123) or numeric ID" },
      },
    },
  },
  {
    name: "shopify_create_product",
    description: "Create a new product with variants, images, and optional collection assignment.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title:         { type: "string",  description: "Product title" },
        description:   { type: "string",  description: "Product description (HTML supported)" },
        vendor:        { type: "string",  description: "Brand or vendor name" },
        product_type:  { type: "string",  description: "Product type/category" },
        status:        { type: "string",  enum: ["ACTIVE", "DRAFT"], default: "DRAFT" },
        tags:          { type: "array",   items: { type: "string" }, description: "Product tags" },
        price:         { type: "string",  description: "Default variant price (e.g. '29.99')" },
        collection_id: { type: "string",  description: "Collection GID to add this product to" },
      },
    },
  },
  {
    name: "shopify_update_product",
    description: "Update an existing product's title, description, status, tags, vendor, or variant prices.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id:          { type: "string", description: "Product GID" },
        title:       { type: "string" },
        description: { type: "string", description: "HTML description" },
        status:      { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"] },
        vendor:      { type: "string" },
        tags:        { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "shopify_bulk_update_status",
    description:
      "Update the status (ACTIVE/DRAFT/ARCHIVED) of multiple products at once. Pass product IDs or a collection ID.",
    inputSchema: {
      type: "object",
      required: ["status"],
      properties: {
        status:        { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"] },
        product_ids:   { type: "array",  items: { type: "string" }, description: "Array of product GIDs" },
        collection_id: { type: "string", description: "Update all products in this collection (first 50)" },
      },
    },
  },
];

export async function handleProductTool(
  name: string,
  args: Record<string, any>,
  shopify: ShopifyClient
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    switch (name) {
      case "shopify_list_products": {
        const result = await shopify.searchProducts({
          query: args.query,
          first: args.first ?? 10,
          status: args.status,
          vendor: args.vendor,
          productType: args.product_type,
          after: args.after,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "shopify_get_product": {
        const id = args.id.startsWith("gid://") ? args.id : `gid://shopify/Product/${args.id}`;
        const result = await shopify.getProduct(id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "shopify_create_product": {
        const result = await shopify.createProduct({
          title: args.title,
          descriptionHtml: args.description,
          vendor: args.vendor,
          productType: args.product_type,
          status: args.status ?? "DRAFT",
          tags: args.tags,
          variants: args.price ? [{ price: args.price }] : undefined,
          collectionId: args.collection_id,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "shopify_update_product": {
        const id = args.id.startsWith("gid://") ? args.id : `gid://shopify/Product/${args.id}`;
        const result = await shopify.updateProduct({
          id,
          title: args.title,
          descriptionHtml: args.description,
          status: args.status,
          vendor: args.vendor,
          tags: args.tags,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "shopify_bulk_update_status": {
        const result = await shopify.bulkUpdateStatus({
          status: args.status,
          productIds: args.product_ids,
          collectionId: args.collection_id,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      default:
        return { content: [{ type: "text", text: `Unknown product tool: ${name}` }], isError: true };
    }
  } catch (err: any) {
    return { content: [{ type: "text", text: `Error in ${name}: ${err.message}` }], isError: true };
  }
}
