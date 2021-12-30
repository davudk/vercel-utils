import { VercelRequest, VercelResponse } from "@vercel/node";
import { RequestHandler } from "express";

export type API = (req: APIRequest, res: APIResponse) => void | Promise<void>;
export type APIRequest = VercelRequest;
export type APIResponse = VercelResponse;

export type APIMiddleware = RequestHandler;

export interface APIOptions {
    middleware?: APIMiddleware | APIMiddleware[];
    onUncaughtError?: (err: any, req: APIRequest, res: APIResponse) =>
        Promise<APIOutcome | void | null | undefined>;
}

export type APIHandler<T> = (req: VercelRequest, res: VercelResponse) =>
    Promise<
        T extends void | undefined
        ? void | APIOutcome<T>
        : T | APIOutcome<T> | APIError
    >;
export type APIHandlerByMethod = Record<string, APIHandler<any>>;

export class APIOutcome<T = any> {
    constructor(
        public readonly statusCode: number,
        public readonly payload: T,
        public readonly headers: Record<string, string> = {}
    ) { }

    toJSON() {
        return this.payload;
    }
}

export class APIError extends APIOutcome<{ name: string, message: string, details?: any }> {
    constructor(statusCode: number, name: string, message: string, details?: any) {
        super(statusCode, { name, message, details });
    }

    with(options: { statusCode?: number, name?: string, message?: string, details?: any }): APIError {
        return new APIError(
            options.statusCode ?? this.statusCode,
            options.name ?? this.payload.name,
            options.message ?? this.payload.message,
            options.details ?? this.payload.details
        );
    }

    static wrap(value: any) {
        if (value instanceof APIError) return value;
        else return InternalServerError;
    }
}

export const UnknownError = new APIError(500, 'unknown', 'An unknown error has occurred.');
export const UnauthenticatedError = new APIError(401, 'unauthenticated', 'Prevented due to missing or bad auth.');
export const PermissionDeniedError = new APIError(403, 'permission-denied', 'Prevented due to missing permissions.');
export const NotFoundError = new APIError(404, 'not-found', 'Not found.');
export const MethodNotAllowedError = new APIError(405, 'method-not-allowed', 'The attempted HTTP method is not allowed.');
export const ConflictError = new APIError(409, 'conflict', 'The request could not be completed due to a state conflict.');
export const InvalidInputError = new APIError(422, 'invalid-input', 'Invalid input was provided in the HTTP request.');
export const InternalServerError = new APIError(500, 'internal-error', 'An internal error has occurred.');

export const EmptyOutcome: APIOutcome<any> = new APIOutcome(200, undefined);
export const AlreadyHandled: APIOutcome<any> = new APIOutcome(0, undefined);