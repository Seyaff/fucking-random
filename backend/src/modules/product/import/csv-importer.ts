import { BadRequestError } from "../../../utils/appError";

interface ColumnMap {
    [key: string]: string;
}

const SEARCH_MAP: Record<string, string[]> = {
    name: ["name", "product name", "product", "item name", "item", "title", "product_title"],
    sku: ["sku", "sku_code", "product code", "code", "item code", "variant sku"],
    price: ["price", "selling price", "rate", "mrp", "unit price", "sale price", "amount"],
    compareAtPrice: ["compare price", "original price", "mrp", "list price", "strikethrough"],
    costPrice: ["cost price", "cost", "purchase price", "buying price", "landing cost"],
    stock: ["stock", "quantity", "qty", "inventory", "available", "stock quantity", "current stock"],
    unit: ["unit", "uom", "measurement unit", "units"],
    category: ["category", "categories", "product category", "group", "department", "type"],
    description: ["description", "desc", "product description", "long description", "details", "notes"],
    externalId: ["id", "product id", "item id", "product_id", "external id", "reference"],
};

function normalize(str: string): string {
    return str.trim().toLowerCase().replace(/[_-]/g, " ");
}

function matchColumn(header: string, candidates: string[]): boolean {
    const norm = normalize(header);
    return candidates.some((c) => norm === normalize(c));
}

export function detectColumnMap(headers: string[]): Record<string, string> {
    const map: ColumnMap = {};

    for (const header of headers) {
        const norm = normalize(header);

        for (const [field, candidates] of Object.entries(SEARCH_MAP)) {
            if (matchColumn(header, candidates)) {
                map[field] = header;
                break;
            }

            if (!map[field]) {
                for (const c of candidates) {
                    if (norm.includes(c) || c.includes(norm)) {
                        map[field] = header;
                        break;
                    }
                }
            }
        }
    }

    return map;
}

export function parseCsvRows(
    headers: string[],
    rows: string[][],
    columnMap: Record<string, string>
) {
    const products: Array<{
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
    }> = [];

    const headerIndex = (field: string) => {
        const col = columnMap[field];
        return col ? headers.indexOf(col) : -1;
    };

    for (const row of rows) {
        const get = (field: string): string | undefined => {
            const idx = headerIndex(field);
            return idx >= 0 ? row[idx]?.trim() : undefined;
        };

        const name = get("name");
        const priceStr = get("price");

        if (!name || !priceStr) continue;

        const price = parseFloat(priceStr);
        if (isNaN(price)) continue;

        const product: {
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
        } = { name, price };

        const sku = get("sku");
        if (sku) product.sku = sku;

        const compareAtPrice = parseFloat(get("compareAtPrice") || "");
        if (!isNaN(compareAtPrice)) product.compareAtPrice = compareAtPrice;

        const costPrice = parseFloat(get("costPrice") || "");
        if (!isNaN(costPrice)) product.costPrice = costPrice;

        const stock = parseInt(get("stock") || "0", 10);
        if (!isNaN(stock)) product.stock = stock;

        product.unit = get("unit") || "piece";
        product.category = get("category") || "Uncategorized";

        const description = get("description");
        if (description) product.description = description;

        const externalId = get("externalId");
        if (externalId) product.externalId = externalId;

        products.push(product);
    }

    return products;
}

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new BadRequestError("CSV must have a header row and at least one data row");

    const headers = lines[0]!.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) =>
        line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    );

    return { headers, rows };
}
