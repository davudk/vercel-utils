import { ZodSchema } from "zod";
import { InternalServerError, InvalidInputError, NotFoundError } from "./types";

export async function validate<T>(data: any, schema: ZodSchema<T>, error = InvalidInputError): Promise<T> {
    const res = await schema.safeParseAsync(data);
    if (res.success) {
        return res.data;
    } else {
        const details = res.error.issues;
        throw error.with({ details });
    }
}

export interface ValidateResponseOptions {
    disableExpect?: boolean
}

export function validateResponse<T>(data: any, schema: ZodSchema<T>, options?: ValidateResponseOptions): Promise<T> {
    if (!options?.disableExpect) {
        expect(data);
    }

    return validate(data, schema, InternalServerError);
}

export function expect<T>(data: T): T {
    if (data === null || typeof data === 'undefined') {
        throw NotFoundError;
    }

    return data;
}
