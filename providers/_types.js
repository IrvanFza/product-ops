// @ts-check
/**
 * @typedef {Object} Provider
 * @property {string} id
 * @property {(entry: object, ctx: { transport: string, fetchJson: Function, fetchText: Function }) =>
 *   Promise<Array<{ title: string, url: string, company?: string, signal?: string, postedAt?: number }>>} fetch
 *
 * Shared provider contract for product-ops. Each providers/*.mjs (non-underscore)
 * default-exports a Provider. scan.mjs discovers and dispatches to them.
 */
export const __TYPE_ONLY = true;
