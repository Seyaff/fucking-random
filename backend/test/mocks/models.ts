import { vi } from "vitest";

export function mockUserModel() {
  return {
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: vi.fn(),
  };
}

export function mockOrderModel() {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  };
}

export function mockProductModel() {
  return {
    findOne: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
    findOneAndUpdate: vi.fn(),
  };
}

export function mockWhatsAppAccountModel() {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
  };
}

export function mockConversationModel() {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  };
}

export function mockMessageModel() {
  return {
    find: vi.fn(),
    create: vi.fn(),
  };
}

export function mockRefreshTokenModel() {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findOneAndUpdate: vi.fn(),
  };
}

export function mockAccountModel() {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
  };
}

export const TEST_USER = {
  _id: "507f1f77bcf86cd799439011",
  _doc: {
    _id: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    avatarUrl: "",
    createdAt: new Date("2025-01-01"),
  },
  name: "Test User",
  email: "test@example.com",
  avatarUrl: "",
  createdAt: new Date("2025-01-01"),
  omitPassword() {
    return this._doc;
  },
  toString() {
    return "507f1f77bcf86cd799439011";
  },
};

export const TEST_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDAwMDAwMDB9.test";
