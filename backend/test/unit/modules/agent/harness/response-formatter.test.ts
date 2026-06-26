import { describe, it, expect } from "vitest";
import {
  formatProductList,
  formatPriceCheck,
  formatOrderStatus,
  formatPlaceOrder,
  formatEscalation,
  formatFlowConfirm,
  extractOrderId,
  extractQuantity,
  isCatalogQuery,
  extractProductQuery,
} from "../../../../../src/modules/agent/harness/response-formatter";

describe("formatProductList", () => {
  it("formats product list", () => {
    const result = formatProductList(
      JSON.stringify({
        found: true,
        products: [
          { id: "1", name: "Apple", price: 1.5, unit: "kg", stock: 100, category: "Fruit" },
          { id: "2", name: "Banana", price: 0.5, unit: "piece", stock: 200, category: "Fruit" },
        ],
      })
    );
    expect(result).toContain("Apple");
    expect(result).toContain("$1.5/kg");
    expect(result).toContain("Banana");
    expect(result).toContain("$0.5/piece");
    expect(result).toContain("100 in stock");
    expect(result).toContain("200 in stock");
  });

  it("handles empty catalog", () => {
    const result = formatProductList(
      JSON.stringify({ found: false, message: "No products found." })
    );
    expect(result).toBe("No products found.");
  });

  it("handles missing message in empty catalog", () => {
    const result = formatProductList(
      JSON.stringify({ found: false })
    );
    expect(result).toBe("I couldn't find any matching products.");
  });

  it("handles invalid JSON", () => {
    const result = formatProductList("not-json");
    expect(result).toBe("I couldn't load the product catalog right now. Please try again.");
  });
});

describe("formatPriceCheck", () => {
  it("formats a single product price", () => {
    const result = formatPriceCheck(
      JSON.stringify({
        found: true,
        product: { id: "1", name: "Apple", price: 1.5, unit: "kg", stock: 50 },
      })
    );
    expect(result).toBe("Apple is $1.5/kg. We have 50 in stock.");
  });

  it("handles not found", () => {
    const result = formatPriceCheck(
      JSON.stringify({ found: false, message: "Product not found." })
    );
    expect(result).toBe("Product not found.");
  });

  it("handles invalid JSON", () => {
    const result = formatPriceCheck("garbage");
    expect(result).toBe("I couldn't find that product.");
  });
});

describe("formatOrderStatus", () => {
  it("formats an order", () => {
    const result = formatOrderStatus(
      JSON.stringify({
        found: true,
        orderId: "ORD-ABC123",
        product: "Apple",
        quantity: 3,
        total: 4.5,
        status: "shipped",
        customerName: "John",
      })
    );
    expect(result).toContain("ORD-ABC123");
    expect(result).toContain("3x Apple");
    expect(result).toContain("$4.50");
    expect(result).toContain("shipped");
  });

  it("handles not found", () => {
    const result = formatOrderStatus(
      JSON.stringify({ found: false, message: "Order not found." })
    );
    expect(result).toBe("Order not found.");
  });
});

describe("formatPlaceOrder", () => {
  it("formats successful order", () => {
    const result = formatPlaceOrder(
      JSON.stringify({ success: true, orderId: "ORD-NEW123", total: 15 })
    );
    expect(result).toContain("ORD-NEW123");
  });

  it("uses custom message when provided", () => {
    const result = formatPlaceOrder(
      JSON.stringify({ success: true, orderId: "ORD-NEW123", message: "Custom message" })
    );
    expect(result).toBe("Custom message");
  });

  it("handles failure", () => {
    const result = formatPlaceOrder(
      JSON.stringify({ success: false, message: "Out of stock." })
    );
    expect(result).toBe("Out of stock.");
  });
});

describe("formatEscalation", () => {
  it("returns escalation message", () => {
    expect(formatEscalation()).toBe(
      "I'm connecting you with a human agent. Someone will reply shortly."
    );
  });
});

describe("formatFlowConfirm", () => {
  it("formats order confirmation", () => {
    const result = formatFlowConfirm({
      productName: "Apple",
      quantity: 3,
      customerName: "John",
      price: 1.5,
      unit: "kg",
    });
    expect(result).toContain("3x Apple");
    expect(result).toContain("$4.50");
    expect(result).toContain("John");
    expect(result).toContain("YES");
    expect(result).toContain("NO");
  });

  it("handles missing fields gracefully", () => {
    const result = formatFlowConfirm({});
    expect(result).toContain("$0.00");
  });
});

describe("extractOrderId", () => {
  it("extracts ORD- prefixed IDs", () => {
    expect(extractOrderId("My order is ORD-ABC123")).toBe("ORD-ABC123");
    expect(extractOrderId("ORD-XYZ789")).toBe("ORD-XYZ789");
  });

  it("handles lowercase", () => {
    expect(extractOrderId("ord-abc123")).toBe("ORD-ABC123");
  });

  it("returns null when no match", () => {
    expect(extractOrderId("hello world")).toBeNull();
    expect(extractOrderId("")).toBeNull();
  });
});

describe("extractQuantity", () => {
  it("extracts numeric quantity", () => {
    expect(extractQuantity("I want 5")).toBe(5);
    expect(extractQuantity("give me 10 kg")).toBe(10);
  });

  it("rejects zero", () => {
    expect(extractQuantity("0 items")).toBeNull();
  });

  it("rejects numbers above 999", () => {
    expect(extractQuantity("1000 items")).toBeNull();
  });

  it("returns null when no number", () => {
    expect(extractQuantity("no numbers here")).toBeNull();
  });
});

describe("isCatalogQuery", () => {
  it("matches catalog queries", () => {
    expect(isCatalogQuery("what products do you have")).toBe(true);
    expect(isCatalogQuery("show me all products")).toBe(true);
    expect(isCatalogQuery("catalog")).toBe(true);
    expect(isCatalogQuery("menu")).toBe(true);
    expect(isCatalogQuery("list products")).toBe(true);
  });

  it("rejects non-catalog queries", () => {
    expect(isCatalogQuery("I want apples")).toBe(false);
    expect(isCatalogQuery("hello")).toBe(false);
    expect(isCatalogQuery("")).toBe(false);
  });
});

describe("extractProductQuery", () => {
  it("returns empty for catalog queries", () => {
    expect(extractProductQuery("what products do you have")).toBe("");
  });

  it("strips noise words", () => {
    expect(extractProductQuery("I want apples")).toBe("apples");
    expect(extractProductQuery("price of banana")).toBe("banana");
    expect(extractProductQuery("how much is apple")).toBe("apple");
  });

  it("returns original text for non-matching", () => {
    expect(extractProductQuery("organic eggs")).toBe("organic eggs");
  });
});
