import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/domain";

export function ok<T>(data: T, meta: Record<string, unknown> = {}) {
  const body: ApiResponse<T> = { data, meta, error: null };
  return NextResponse.json(body);
}

export function fail(code: string, message: string, status = 400, details: unknown[] = []) {
  const body: ApiResponse<never> = {
    data: null,
    meta: {},
    error: { code, message, details }
  };

  return NextResponse.json(body, { status });
}

