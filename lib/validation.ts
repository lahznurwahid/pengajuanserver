import { NextResponse } from "next/server";
import { ZodError, type ZodIssue, type ZodSchema } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      message: "Validation error",
      errors: error.issues.map((issue: ZodIssue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 }
  );
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return { data: null, error: validationError(parsed.error) } as const;
  }

  return { data: parsed.data, error: null } as const;
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return validationError(error);
  }

  console.error(error);

  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}
