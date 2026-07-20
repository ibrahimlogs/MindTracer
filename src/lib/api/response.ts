import { NextResponse } from "next/server";

interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
  meta: ApiMeta;
}

interface ApiFailure {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

function createMeta(meta?: Partial<ApiMeta>): ApiMeta {
  return {
    requestId: meta?.requestId ?? crypto.randomUUID(),
    timestamp: meta?.timestamp ?? new Date().toISOString(),
  };
}

export function apiSuccess<T>(
  data: T,
  init?: ResponseInit,
  meta?: Partial<ApiMeta>,
) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, error: null, meta: createMeta(meta) },
    init,
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  meta?: Partial<ApiMeta>,
) {
  return NextResponse.json<ApiFailure>(
    {
      success: false,
      data: null,
      error: { code, message, ...(details === undefined ? {} : { details }) },
      meta: createMeta(meta),
    },
    { status },
  );
}
