import { Request } from "express";

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export function getRequestMeta(req: Request): RequestMeta {
  return {
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get("user-agent"),
  };
}