export interface ShopifyClientConfig {
  storeDomain: string;
  accessToken: string;
  apiVersion: string;
}

export interface ShopifyClient {
  graphql: (query: string, variables?: Record<string, any>) => Promise<any>;
  searchProducts: (params: any) => Promise<any>;
  getProduct: (id: string) => Promise<any>;
  createProduct: (input: any) => Promise<any>;
  updateProduct: (input: any) => Promise<any>;
  bulkUpdateStatus: (params: any) => Promise<any>;
  listOrders: (params: any) => Promise<any>;
  getOrder: (id: string) => Promise<any>;
  listCustomers: (params: any) => Promise<any>;
  getCustomer: (id: string) => Promise<any>;
  createDiscount: (input: any) => Promise<any>;
  listCollections: (params: any) => Promise<any>;
  getCollection: (id: string) => Promise<any>;
  createCollection: (input: any) => Promise<any>;
  updateCollection: (input: any) => Promise<any>;
  addToCollection: (params: any) => Promise<any>;
  runAnalytics: (query: string) => Promise<any>;
  getInventoryLevels: (productId: string) => Promise<any>;
  setInventory: (params: any) => Promise<any>;
}

export function createShopifyClient(config: ShopifyClientConfig): ShopifyClient {
  const endpoint = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.accessToken,
  };

  async function graphql(query: string, variables?: Record<string, any>) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`Shopify API HTTP error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (json.errors?.length) {
      throw new Error(json.errors.map((e: any) => e.message).join("; "));
    }

    return json.data;
  }

  async function searchProducts(params: any) {
    const query = `
      query searchProducts($query: String, $first: Int!, $after: String) {
        products(query: $query, first: $first, after: $after) {
          edges {
            node {
              id title status vendor productType
              tags priceRangeV2 { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
              totalInventory createdAt updatedAt
            }
            cursor
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;

    let q = params.query || "";
    if (params.status) q += ` status:${params.status}`;
    if (params.vendor) q += ` vendor:${params.vendor}`;
    if (params.productType) q += ` product_type:${params.productType}`;

    return graphql(query, { query: q.trim() || undefined, first: params.first ?? 10, after: params.after });
  }

  async function getProduct(id: string) {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id title status descriptionHtml vendor productType tags
          createdAt updatedAt totalInventory
          variants(first: 50) {
            edges { node { id title price compareAtPrice sku inventoryQuantity } }
          }
          images(first: 10) {
            edges { node { id url altText } }
          }
          priceRangeV2 { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
        }
      }
    `;
    return graphql(query, { id });
  }

  async function createProduct(input: any) {
    const mutation = `
      mutation createProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product { id title status }
          userErrors { field message }
        }
      }
    `;
    const result = await graphql(mutation, {
      input: {
        title: input.title,
        descriptionHtml: input.descriptionHtml,
        vendor: input.vendor,
        productType: input.productType,
        status: input.status,
        tags: input.tags,
        variants: input.variants,
      },
    });

    if (result.productCreate.userErrors?.length) {
      throw new Error(result.productCreate.userErrors.map((e: any) => e.message).join("; "));
    }

    return result.productCreate.product;
  }

  async function updateProduct(input: any) {
    const mutation = `
      mutation updateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id title status }
          userErrors { field message }
        }
      }
    `;
    const result = await graphql(mutation, { input });

    if (result.productUpdate.userErrors?.length) {
      throw new Error(result.productUpdate.userErrors.map((e: any) => e.message).join("; "));
    }

    return result.productUpdate.product;
  }

  async function bulkUpdateStatus(params: any) {
    const { status, productIds, collectionId } = params;
    let ids = productIds || [];

    if (collectionId && !ids.length) {
      const data = await graphql(`
        query collectionProducts($id: ID!) {
          collection(id: $id) {
            products(first: 50) { edges { node { id } } }
          }
        }
      `, { id: collectionId });
      ids = data.collection.products.edges.map((e: any) => e.node.id);
    }

    const results = await Promise.allSettled(
      ids.map((id: string) => updateProduct({ id, status }))
    );

    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return { succeeded, failed, total: ids.length, status };
  }

  // Stub implementations — full versions in the respective tool files
  const listOrders = (p: any) => graphql(`query { orders(first: ${p.first ?? 10}) { edges { node { id name totalPriceSet { shopMoney { amount } } financialStatus fulfillmentStatus createdAt } } } }`);
  const getOrder = (id: string) => graphql(`query { order(id: "${id}") { id name totalPriceSet { shopMoney { amount } } financialStatus fulfillmentStatus lineItems(first: 20) { edges { node { title quantity } } } } }`);
  const listCustomers = (p: any) => graphql(`query { customers(first: ${p.first ?? 10}, query: "${p.query || ""}") { edges { node { id firstName lastName email ordersCount totalSpent } } } }`);
  const getCustomer = (id: string) => graphql(`query { customer(id: "${id}") { id firstName lastName email phone ordersCount totalSpent } }`);
  const createDiscount = (input: any) => graphql(`mutation { discountCodeBasicCreate(basicCodeDiscount: { title: "${input.title}", code: "${input.code}", customerGets: { value: { percentage: ${(input.percentage / 100)} }, items: { all: true } }, appliesOncePerCustomer: false }) { codeDiscountNode { id } userErrors { message } } }`);
  const listCollections = (p: any) => graphql(`query { collections(first: ${p.first ?? 10}) { edges { node { id title productsCount { count } } } } }`);
  const getCollection = (id: string) => graphql(`query { collection(id: "${id}") { id title descriptionHtml products(first: 20) { edges { node { id title } } } } }`);
  const createCollection = (input: any) => graphql(`mutation { collectionCreate(input: { title: "${input.title}" }) { collection { id title } userErrors { message } } }`);
  const updateCollection = (input: any) => graphql(`mutation { collectionUpdate(input: { id: "${input.id}", title: "${input.title || ""}" }) { collection { id title } userErrors { message } } }`);
  const addToCollection = (p: any) => graphql(`mutation { collectionAddProducts(id: "${p.collectionId}", productIds: ${JSON.stringify(p.productIds)}) { collection { id } userErrors { message } } }`);
  const runAnalytics = (q: string) => graphql(`query { shopifyqlQuery(query: "${q.replace(/"/g, '\\"')}") { tableData { columns { name dataType } rows } } }`);
  const getInventoryLevels = (productId: string) => graphql(`query { product(id: "${productId}") { variants(first: 50) { edges { node { id title inventoryItem { id inventoryLevels(first: 10) { edges { node { location { id name } quantities(names: ["available"]) { name quantity } } } } } } } } } }`);
  const setInventory = (p: any) => graphql(`mutation { inventorySetQuantities(input: { reason: "${p.reason || "correction"}", setQuantities: [{ inventoryItemId: "${p.inventoryItemId}", locationId: "${p.locationId}", quantity: ${p.quantity} }] }) { inventoryAdjustmentGroup { id } userErrors { message } } }`);

  return {
    graphql,
    searchProducts,
    getProduct,
    createProduct,
    updateProduct,
    bulkUpdateStatus,
    listOrders,
    getOrder,
    listCustomers,
    getCustomer,
    createDiscount,
    listCollections,
    getCollection,
    createCollection,
    updateCollection,
    addToCollection,
    runAnalytics,
    getInventoryLevels,
    setInventory,
  };
}
