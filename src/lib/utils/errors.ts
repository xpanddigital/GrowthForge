export class GrowthForgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "GrowthForgeError";
  }
}

export class InsufficientCreditsError extends GrowthForgeError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits: ${required} required, ${available} available`,
      "INSUFFICIENT_CREDITS",
      402,
      { required, available }
    );
    this.name = "InsufficientCreditsError";
  }
}

export class ApifyActorError extends GrowthForgeError {
  constructor(actorId: string, message: string, details?: Record<string, unknown>) {
    super(
      `Apify actor ${actorId} failed: ${message}`,
      "APIFY_ACTOR_ERROR",
      502,
      { actorId, ...details }
    );
    this.name = "ApifyActorError";
  }
}

export class AIGenerationError extends GrowthForgeError {
  constructor(model: string, message: string, details?: Record<string, unknown>) {
    super(
      `AI generation failed (${model}): ${message}`,
      "AI_GENERATION_ERROR",
      502,
      { model, ...details }
    );
    this.name = "AIGenerationError";
  }
}

export class RateLimitError extends GrowthForgeError {
  constructor(resource: string, retryAfterMs?: number) {
    super(
      `Rate limit exceeded for ${resource}`,
      "RATE_LIMIT",
      429,
      { resource, retryAfterMs }
    );
    this.name = "RateLimitError";
  }
}

export class UnauthorizedError extends GrowthForgeError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends GrowthForgeError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` (${id})` : ""} not found`,
      "NOT_FOUND",
      404,
      { resource, id }
    );
    this.name = "NotFoundError";
  }
}

export class ValidationError extends GrowthForgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export function handleApiError(error: unknown): { message: string; status: number } {
  if (error instanceof GrowthForgeError) {
    return { message: error.message, status: error.statusCode };
  }
  // Zod validation errors should return 400, not 500
  if (error instanceof Error && error.name === "ZodError") {
    return { message: error.message, status: 400 };
  }
  if (error instanceof Error) {
    console.error("[handleApiError] Unhandled error:", error);
    return { message: error.message, status: 500 };
  }
  return { message: "An unexpected error occurred", status: 500 };
}
