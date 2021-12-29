import { RequestHandler } from 'express';
import { APIRequest, APIResponse } from './types';

export type APIMiddleware = RequestHandler;

export async function middleware(req: APIRequest, res: APIResponse, m: APIMiddleware) {
    return await new Promise((resolve, reject) => {
        try {
            m(req as any, res as any, (result) => {
                if (result instanceof Error) reject(result)
                else resolve(result)
            });
        } catch (err) {
            reject(err);
        }
    });
}
