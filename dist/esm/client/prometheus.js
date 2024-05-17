// Copyright 2021 The Prometheus Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { labelMatchersToString } from '../parser';
import LRUCache from 'lru-cache';
// These are status codes where the Prometheus API still returns a valid JSON body,
// with an error encoded within the JSON.
const badRequest = 400;
const unprocessableEntity = 422;
const serviceUnavailable = 503;
// HTTPPrometheusClient is the HTTP client that should be used to get some information from the different endpoint provided by prometheus.
export class HTTPPrometheusClient {
    constructor(config) {
        this.lookbackInterval = 60 * 60 * 1000 * 12; //12 hours
        this.httpMethod = 'POST';
        this.apiPrefix = '/api/v1';
        // For some reason, just assigning via "= fetch" here does not end up executing fetch correctly
        // when calling it, thus the indirection via another function wrapper.
        this.fetchFn = (input, init) => fetch(input, init);
        this.requestHeaders = new Headers();
        this.url = config.url ? config.url : '';
        this.errorHandler = config.httpErrorHandler;
        if (config.lookbackInterval) {
            this.lookbackInterval = config.lookbackInterval;
        }
        if (config.fetchFn) {
            this.fetchFn = config.fetchFn;
        }
        if (config.httpMethod) {
            this.httpMethod = config.httpMethod;
        }
        if (config.apiPrefix) {
            this.apiPrefix = config.apiPrefix;
        }
        if (config.requestHeaders) {
            this.requestHeaders = config.requestHeaders;
        }
    }
    labelNames(metricName) {
        const end = new Date();
        const start = new Date(end.getTime() - this.lookbackInterval);
        if (metricName === undefined || metricName === '') {
            const request = this.buildRequest(this.labelsEndpoint(), new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
            }));
            // See https://prometheus.io/docs/prometheus/latest/querying/api/#getting-label-names
            return this.fetchAPI(request.uri, {
                method: this.httpMethod,
                body: request.body,
            }).catch((error) => {
                if (this.errorHandler) {
                    this.errorHandler(error);
                }
                return [];
            });
        }
        return this.series(metricName).then((series) => {
            const labelNames = new Set();
            for (const labelSet of series) {
                for (const [key] of Object.entries(labelSet)) {
                    if (key === '__name__') {
                        continue;
                    }
                    labelNames.add(key);
                }
            }
            return Array.from(labelNames);
        });
    }
    // labelValues return a list of the value associated to the given labelName.
    // In case a metric is provided, then the list of values is then associated to the couple <MetricName, LabelName>
    labelValues(labelName, metricName, matchers) {
        const end = new Date();
        const start = new Date(end.getTime() - this.lookbackInterval);
        if (!metricName || metricName.length === 0) {
            const params = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
            });
            // See https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
            return this.fetchAPI(`${this.labelValuesEndpoint().replace(/:name/gi, labelName)}?${params}`).catch((error) => {
                if (this.errorHandler) {
                    this.errorHandler(error);
                }
                return [];
            });
        }
        return this.series(metricName, matchers, labelName).then((series) => {
            const labelValues = new Set();
            for (const labelSet of series) {
                for (const [key, value] of Object.entries(labelSet)) {
                    if (key === '__name__') {
                        continue;
                    }
                    if (key === labelName) {
                        labelValues.add(value);
                    }
                }
            }
            return Array.from(labelValues);
        });
    }
    metricMetadata() {
        return this.fetchAPI(this.metricMetadataEndpoint()).catch((error) => {
            if (this.errorHandler) {
                this.errorHandler(error);
            }
            return {};
        });
    }
    series(metricName, matchers, labelName) {
        const end = new Date();
        const start = new Date(end.getTime() - this.lookbackInterval);
        const request = this.buildRequest(this.seriesEndpoint(), new URLSearchParams({
            start: start.toISOString(),
            end: end.toISOString(),
            'match[]': labelMatchersToString(metricName, matchers, labelName),
        }));
        // See https://prometheus.io/docs/prometheus/latest/querying/api/#finding-series-by-label-matchers
        return this.fetchAPI(request.uri, {
            method: this.httpMethod,
            body: request.body,
        }).catch((error) => {
            if (this.errorHandler) {
                this.errorHandler(error);
            }
            return [];
        });
    }
    metricNames() {
        return this.labelValues('__name__');
    }
    flags() {
        return this.fetchAPI(this.flagsEndpoint()).catch((error) => {
            if (this.errorHandler) {
                this.errorHandler(error);
            }
            return {};
        });
    }
    fetchAPI(resource, init) {
        if (init) {
            init.headers = this.requestHeaders;
        }
        else {
            init = { headers: this.requestHeaders };
        }
        return this.fetchFn(this.url + resource, init)
            .then((res) => {
            if (!res.ok && ![badRequest, unprocessableEntity, serviceUnavailable].includes(res.status)) {
                throw new Error(res.statusText);
            }
            return res;
        })
            .then((res) => res.json())
            .then((apiRes) => {
            if (apiRes.status === 'error') {
                throw new Error(apiRes.error !== undefined ? apiRes.error : 'missing "error" field in response JSON');
            }
            if (apiRes.data === undefined) {
                throw new Error('missing "data" field in response JSON');
            }
            return apiRes.data;
        });
    }
    buildRequest(endpoint, params) {
        let uri = endpoint;
        let body = params;
        if (this.httpMethod === 'GET') {
            uri = `${uri}?${params}`;
            body = null;
        }
        return { uri, body };
    }
    labelsEndpoint() {
        return `${this.apiPrefix}/labels`;
    }
    labelValuesEndpoint() {
        return `${this.apiPrefix}/label/:name/values`;
    }
    seriesEndpoint() {
        return `${this.apiPrefix}/series`;
    }
    metricMetadataEndpoint() {
        return `${this.apiPrefix}/metadata`;
    }
    flagsEndpoint() {
        return `${this.apiPrefix}/status/flags`;
    }
}
class Cache {
    constructor(config) {
        const maxAge = { ttl: config && config.maxAge ? config.maxAge : 5 * 60 * 1000 };
        this.completeAssociation = new LRUCache(maxAge);
        this.metricMetadata = {};
        this.labelValues = new LRUCache(maxAge);
        this.labelNames = [];
        this.flags = {};
        if (config === null || config === void 0 ? void 0 : config.initialMetricList) {
            this.setLabelValues('__name__', config.initialMetricList);
        }
    }
    setAssociations(metricName, series) {
        series.forEach((labelSet) => {
            let currentAssociation = this.completeAssociation.get(metricName);
            if (!currentAssociation) {
                currentAssociation = new Map();
                this.completeAssociation.set(metricName, currentAssociation);
            }
            for (const [key, value] of Object.entries(labelSet)) {
                if (key === '__name__') {
                    continue;
                }
                const labelValues = currentAssociation.get(key);
                if (labelValues === undefined) {
                    currentAssociation.set(key, new Set([value]));
                }
                else {
                    labelValues.add(value);
                }
            }
        });
    }
    setFlags(flags) {
        this.flags = flags;
    }
    getFlags() {
        return this.flags;
    }
    setMetricMetadata(metadata) {
        this.metricMetadata = metadata;
    }
    getMetricMetadata() {
        return this.metricMetadata;
    }
    setLabelNames(labelNames) {
        this.labelNames = labelNames;
    }
    getLabelNames(metricName) {
        if (!metricName || metricName.length === 0) {
            return this.labelNames;
        }
        const labelSet = this.completeAssociation.get(metricName);
        return labelSet ? Array.from(labelSet.keys()) : [];
    }
    setLabelValues(labelName, labelValues) {
        this.labelValues.set(labelName, labelValues);
    }
    getLabelValues(labelName, metricName) {
        if (!metricName || metricName.length === 0) {
            const result = this.labelValues.get(labelName);
            return result ? result : [];
        }
        const labelSet = this.completeAssociation.get(metricName);
        if (labelSet) {
            const labelValues = labelSet.get(labelName);
            return labelValues ? Array.from(labelValues) : [];
        }
        return [];
    }
}
export class CachedPrometheusClient {
    constructor(client, config) {
        this.client = client;
        this.cache = new Cache(config);
    }
    labelNames(metricName) {
        const cachedLabel = this.cache.getLabelNames(metricName);
        if (cachedLabel && cachedLabel.length > 0) {
            return Promise.resolve(cachedLabel);
        }
        if (metricName === undefined || metricName === '') {
            return this.client.labelNames().then((labelNames) => {
                this.cache.setLabelNames(labelNames);
                return labelNames;
            });
        }
        return this.series(metricName).then(() => {
            return this.cache.getLabelNames(metricName);
        });
    }
    labelValues(labelName, metricName) {
        const cachedLabel = this.cache.getLabelValues(labelName, metricName);
        if (cachedLabel && cachedLabel.length > 0) {
            return Promise.resolve(cachedLabel);
        }
        if (metricName === undefined || metricName === '') {
            return this.client.labelValues(labelName).then((labelValues) => {
                this.cache.setLabelValues(labelName, labelValues);
                return labelValues;
            });
        }
        return this.series(metricName).then(() => {
            return this.cache.getLabelValues(labelName, metricName);
        });
    }
    metricMetadata() {
        const cachedMetadata = this.cache.getMetricMetadata();
        if (cachedMetadata && Object.keys(cachedMetadata).length > 0) {
            return Promise.resolve(cachedMetadata);
        }
        return this.client.metricMetadata().then((metadata) => {
            this.cache.setMetricMetadata(metadata);
            return metadata;
        });
    }
    series(metricName) {
        return this.client.series(metricName).then((series) => {
            this.cache.setAssociations(metricName, series);
            return series;
        });
    }
    metricNames() {
        return this.labelValues('__name__');
    }
    flags() {
        const cachedFlags = this.cache.getFlags();
        if (cachedFlags && Object.keys(cachedFlags).length > 0) {
            return Promise.resolve(cachedFlags);
        }
        return this.client.flags().then((flags) => {
            this.cache.setFlags(flags);
            return flags;
        });
    }
}
//# sourceMappingURL=prometheus.js.map