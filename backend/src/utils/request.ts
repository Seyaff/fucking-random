import { Request } from "express";

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export function getRequestMeta(req: Request): RequestMeta {
  const meta: RequestMeta = {};
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.get("user-agent");
  if (ip) meta.ip = ip;
  if (userAgent) meta.userAgent = userAgent;
  return meta;
}