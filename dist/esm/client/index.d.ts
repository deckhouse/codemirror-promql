export { PrometheusClient, PrometheusConfig, CacheConfig } from './prometheus';
export type FetchFn = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
