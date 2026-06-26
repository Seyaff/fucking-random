import { describe, it, expect } from "vitest";
import {
  isPureGreeting,
  isCatalogQuestion,
  classifyFlowIntent,
} from "../../../../../src/lib/intent-classifier";

describe("isPureGreeting", () => {
  it("detects pure greetings", () => {
    expect(isPureGreeting("hi")).toBe(true);
    expect(isPureGreeting("Hello")).toBe(true);
    expect(isPureGreeting("good morning")).toBe(true);
    expect(isPureGreeting("hey")).toBe(true);
    expect(isPureGreeting("goodbye")).toBe(true);
  });

  it("rejects greetings with business intent", () => {
    expect(isPureGreeting("hi I want to buy something")).toBe(false);
    expect(isPureGreeting("hello I need a product")).toBe(false);
  });

  it("rejects thanks", () => {
    expect(isPureGreeting("thanks")).toBe(false);
    expect(isPureGreeting("thank you")).toBe(false);
  });
});

describe("isCatalogQuestion", () => {
  it("detects catalog questions", () => {
    expect(isCatalogQuestion("what products do you have")).toBe(true);
    expect(isCatalogQuestion("show me products")).toBe(true);
    expect(isCatalogQuestion("catalog")).toBe(true);
    expect(isCatalogQuestion("menu")).toBe(true);
    expect(isCatalogQuestion("what do you have")).toBe(true);
  });

  it("rejects non-catalog questions", () => {
    expect(isCatalogQuestion("I want apples")).toBe(false);
    expect(isCatalogQuestion("how are you")).toBe(false);
  });
});

describe("classifyFlowIntent", () => {
  it("detects escalate", () => {
    expect(classifyFlowIntent("talk to a human")).toBe("escalate");
    expect(classifyFlowIntent("I want to speak to human")).toBe("escalate");
    expect(classifyFlowIntent("human")).toBe("escalate");
    expect(classifyFlowIntent("agent")).toBe("escalate");
  });

  it("detects cancel", () => {
    expect(classifyFlowIntent("no")).toBe("cancel");
    expect(classifyFlowIntent("cancel")).toBe("cancel");
    expect(classifyFlowIntent("never mind")).toBe("cancel");
  });

  it("detects confirm", () => {
    expect(classifyFlowIntent("yes")).toBe("confirm");
    expect(classifyFlowIntent("ok")).toBe("confirm");
    expect(classifyFlowIntent("sure")).toBe("confirm");
    expect(classifyFlowIntent("go ahead")).toBe("confirm");
  });

  it("defaults to chitchat", () => {
    expect(classifyFlowIntent("this is just random text")).toBe("chitchat");
    expect(classifyFlowIntent("I want 5 apples")).toBe("chitchat");
  });
});
