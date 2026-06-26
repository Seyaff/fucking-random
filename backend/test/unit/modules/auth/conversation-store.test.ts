import { describe, it, expect, beforeEach } from "vitest";
import { conversationStore } from "../../../../src/lib/conversation-store";

describe("ConversationStore", () => {
  beforeEach(() => {
    conversationStore.reset("test-key");
  });

  it("returns default state for unknown keys", () => {
    const state = conversationStore.get("unknown-key");
    expect(state.lastIntent).toBe("chitchat");
    expect(state.pendingOrder).toBeNull();
    expect(state.awaitingDetails).toBe("nothing");
  });

  it("set and get work", () => {
    conversationStore.set("test-key", {
      lastIntent: "place_order",
      pendingOrder: { productId: "p1" },
      awaitingDetails: "quantity",
    });

    const state = conversationStore.get("test-key");
    expect(state.lastIntent).toBe("place_order");
    expect(state.pendingOrder?.productId).toBe("p1");
    expect(state.awaitingDetails).toBe("quantity");
  });

  it("reset removes the entry", () => {
    conversationStore.set("test-key", {
      lastIntent: "place_order",
      pendingOrder: null,
      awaitingDetails: "nothing",
    });
    conversationStore.reset("test-key");

    const state = conversationStore.get("test-key");
    expect(state.lastIntent).toBe("chitchat");
  });
});
