export interface ProductInput {
    name: string;
    sku?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    stock?: number;
    unit?: string;
    category?: string;
    description?: string;
    externalId?: string;
}

export interface ConnectorConfig {
    name: string;
    description: string;
    fields: Array<{ key: string; label: string; type: "text" | "password" | "select"; options?: string[] }>;
}

export interface Connector {
    config: ConnectorConfig;
    fetchProducts(credentials: Record<string, string>): Promise<ProductInput[]>;
}
