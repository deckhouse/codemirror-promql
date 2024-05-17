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
import { HybridComplete } from './hybrid';
import { CachedPrometheusClient, HTTPPrometheusClient } from '../client/prometheus';
export function isPrometheusClient(remoteConfig) {
    const client = remoteConfig;
    return (typeof client.labelNames === 'function' &&
        typeof client.labelValues === 'function' &&
        typeof client.metricMetadata === 'function' &&
        typeof client.series === 'function' &&
        typeof client.metricNames === 'function');
}
export function newCompleteStrategy(conf) {
    if (conf === null || conf === void 0 ? void 0 : conf.completeStrategy) {
        return conf.completeStrategy;
    }
    if (conf === null || conf === void 0 ? void 0 : conf.remote) {
        if (isPrometheusClient(conf.remote)) {
            return new HybridComplete(conf.remote, conf.maxMetricsMetadata);
        }
        return new HybridComplete(new CachedPrometheusClient(new HTTPPrometheusClient(conf.remote), conf.remote.cache), conf.maxMetricsMetadata);
    }
    return new HybridComplete();
}
//# sourceMappingURL=index.js.map