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
exports.PromQLExtension = exports.promQLLanguage = exports.LanguageType = void 0;
var lezer_promql_1 = require("@prometheus-io/lezer-promql");
var complete_1 = require("./complete");
var lint_1 = require("./lint");
var language_1 = require("@codemirror/language");
var LanguageType;
(function (LanguageType) {
    LanguageType["PromQL"] = "PromQL";
    LanguageType["MetricName"] = "MetricName";
})(LanguageType || (exports.LanguageType = LanguageType = {}));
function promQLLanguage(top) {
    return language_1.LRLanguage.define({
        parser: lezer_promql_1.parser.configure({
            top: top,
        }),
        languageData: {
            closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
            commentTokens: { line: '#' },
        },
    });
}
exports.promQLLanguage = promQLLanguage;
/**
 * This class holds the state of the completion extension for CodeMirror and allow hot-swapping the complete strategy.
 */
var PromQLExtension = /** @class */ (function () {
    function PromQLExtension() {
        this.complete = (0, complete_1.newCompleteStrategy)();
        this.lint = (0, lint_1.newLintStrategy)();
        this.enableLinter = true;
        this.enableCompletion = true;
    }
    PromQLExtension.prototype.setComplete = function (conf) {
        this.complete = (0, complete_1.newCompleteStrategy)(conf);
        return this;
    };
    PromQLExtension.prototype.getComplete = function () {
        return this.complete;
    };
    PromQLExtension.prototype.activateCompletion = function (activate) {
        this.enableCompletion = activate;
        return this;
    };
    PromQLExtension.prototype.setLinter = function (linter) {
        this.lint = linter;
        return this;
    };
    PromQLExtension.prototype.getLinter = function () {
        return this.lint;
    };
    PromQLExtension.prototype.activateLinter = function (activate) {
        this.enableLinter = activate;
        return this;
    };
    PromQLExtension.prototype.asExtension = function (languageType) {
        var _this = this;
        if (languageType === void 0) { languageType = LanguageType.PromQL; }
        var language = promQLLanguage(languageType);
        var extension = [language];
        if (this.enableCompletion) {
            var completion = language.data.of({
                autocomplete: function (context) {
                    return _this.complete.promQL(context);
                },
            });
            extension = extension.concat(completion);
        }
        if (this.enableLinter) {
            extension = extension.concat((0, lint_1.promQLLinter)(this.lint.promQL, this.lint));
        }
        return extension;
    };
    return PromQLExtension;
}());
exports.PromQLExtension = PromQLExtension;
//# sourceMappingURL=promql.js.map