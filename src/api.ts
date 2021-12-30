import { VercelApiHandler } from "@vercel/node";
import { middleware } from "./middleware";
import { APIError, APIHandler, APIHandlerByMethod, APIOptions, APIOutcome, APIRequest, APIResponse, EmptyOutcome, MethodNotAllowedError } from './types';

export function api(handler: APIHandler<any> | APIHandlerByMethod, options?: APIOptions): VercelApiHandler {
    return async (req, res) => {
        if (options?.middleware) {
            const { middleware: mo } = options;
            const middlewareHandlers = Array.isArray(mo) ? mo : [mo];
            try {
                for (let m of middlewareHandlers) {
                    await middleware(req, res, m);
                }
            } catch (err) {
                if (err instanceof APIError) writeOutcome(res, err);
                else writeOutcome(res, await wrapUncaughtError(options, err, req, res));
                return;
            }
        }

        let impl: APIHandler<any> | undefined = undefined;
        if (typeof handler === 'object') {
            if (req.method) {
                impl = handler[req.method];
            }
        } else if (typeof handler === 'function') {
            impl = handler;
        }

        let out: APIOutcome = MethodNotAllowedError
        if (impl) {
            try {
                out = await impl(req, res);
                if (!(out instanceof APIOutcome)) {
                    out = new APIOutcome(200, out);
                }
            } catch (err) {
                if (err instanceof APIError) out = err;
                else {
                    await handleUnknownError(req, err);
                    out = await wrapUncaughtError(options, err, req, res);
                }
            }
        } else if (req.method === 'OPTIONS') {
            out = EmptyOutcome;
        }

        writeOutcome(res, out);
    };
}

export function handler<T = any>(callback: APIHandler<T>): APIHandler<T> {
    return callback;
}

async function wrapUncaughtError(options: APIOptions | undefined, err: any, req: APIRequest, res: APIResponse): Promise<APIOutcome> {
    if (options?.onUncaughtError) {
        const out = await options.onUncaughtError(err, req, res);
        if (out) return out;
    }

    return APIError.wrap(err);
}

function writeOutcome(res: APIResponse, out: APIOutcome) {
    try {
        if (out.statusCode === 0) {
            return;
        }

        res.status(out.statusCode);

        for (const e of Object.entries(out.headers)) {
            const name = e[0];
            const value = e[1];
            res.setHeader(name, value);
        }

        if (typeof out.payload !== 'undefined') {
            res.json(out.payload);
        }

        res.end();
    } catch (err) {
        console.error(err);
        try {
            res.end();
        } catch { }
    }
}

async function handleUnknownError(req: APIRequest, error: any) {
    const s = stringify();
    console.error(s);

    function stringify() {
        return `UNCAUGHT Error in API:
URL: ${req.url}
Query: ${JSON.stringify(req.query)}
Body: ${JSON.stringify(req.body)}
${stringifyDetails()}`
    }

    function stringifyDetails() {
        if (error instanceof Error) {
            if (error.stack) return error.stack;
            else return `[${error.name}] ${error.message}`;
        } else {
            return JSON.stringify(error);
        }
    }
}