import { Connector } from "./types";
import { zohoConnector } from "./zoho.service";

export const connectors: Record<string, Connector> = {
    zoho: zohoConnector,
};

export function getConnector(name: string): Connector | undefined {
    return connectors[name];
}

export function listConnectors() {
    return Object.entries(connectors).map(([key, c]) => ({
        id: key,
        name: c.config.name,
        description: c.config.description,
        fields: c.config.fields,
    }));
}
