"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.promQLLanguage = exports.LanguageType = exports.PromQLExtension = exports.newCompleteStrategy = void 0;
var complete_1 = require("./complete");
Object.defineProperty(exports, "newCompleteStrategy", { enumerable: true, get: function () { return complete_1.newCompleteStrategy; } });
var promql_1 = require("./promql");
Object.defineProperty(exports, "PromQLExtension", { enumerable: true, get: function () { return promql_1.PromQLExtension; } });
Object.defineProperty(exports, "LanguageType", { enumerable: true, get: function () { return promql_1.LanguageType; } });
Object.defineProperty(exports, "promQLLanguage", { enumerable: true, get: function () { return promql_1.promQLLanguage; } });
//# sourceMappingURL=index.js.map