import axios from "axios";
import { Connector, ProductInput } from "./types";

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.com";
const ZOHO_INVENTORY_API = "https://inventory.zoho.com/api/v1";

async function getAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string> {
    const { data } = await axios.post(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, null, {
        params: {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
        },
    });
    return data.access_token;
}

export const zohoConnector: Connector = {
    config: {
        name: "Zoho Inventory",
        description: "Connect your Zoho Inventory account to sync products automatically",
        fields: [
            { key: "clientId", label: "Client ID", type: "text" },
            { key: "clientSecret", label: "Client Secret", type: "password" },
            { key: "refreshToken", label: "Refresh Token", type: "password" },
            { key: "organizationId", label: "Organization ID", type: "text" },
        ],
    },

    async fetchProducts(credentials: Record<string, string>): Promise<ProductInput[]> {
        const token = await getAccessToken(
            credentials.refreshToken!,
            credentials.clientId!,
            credentials.clientSecret!
        );

        const { data } = await axios.get(`${ZOHO_INVENTORY_API}/items`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
            params: { organization_id: credentials.organizationId, page: 1, per_page: 200 },
        });

        return (data.items || []).map((item: any) => ({
            name: item.name,
            sku: item.sku,
            price: parseFloat(item.rate) || 0,
            compareAtPrice: item.mrp ? parseFloat(item.mrp) : undefined,
            costPrice: item.purchase_rate ? parseFloat(item.purchase_rate) : undefined,
            stock: parseFloat(item.stock_on_hand) || 0,
            unit: item.unit || "piece",
            category: item.category?.name || "Uncategorized",
            description: item.description,
            externalId: item.item_id,
        }));
    },
};
