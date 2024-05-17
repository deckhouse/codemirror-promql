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
import { parser } from '@prometheus-io/lezer-promql';
import { newCompleteStrategy } from './complete';
import { newLintStrategy, promQLLinter } from './lint';
import { LRLanguage } from '@codemirror/language';
export var LanguageType;
(function (LanguageType) {
    LanguageType["PromQL"] = "PromQL";
    LanguageType["MetricName"] = "MetricName";
})(LanguageType || (LanguageType = {}));
export function promQLLanguage(top) {
    return LRLanguage.define({
        parser: parser.configure({
            top: top,
        }),
        languageData: {
            closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
            commentTokens: { line: '#' },
        },
    });
}
/**
 * This class holds the state of the completion extension for CodeMirror and allow hot-swapping the complete strategy.
 */
export class PromQLExtension {
    constructor() {
        this.complete = newCompleteStrategy();
        this.lint = newLintStrategy();
        this.enableLinter = true;
        this.enableCompletion = true;
    }
    setComplete(conf) {
        this.complete = newCompleteStrategy(conf);
        return this;
    }
    getComplete() {
        return this.complete;
    }
    activateCompletion(activate) {
        this.enableCompletion = activate;
        return this;
    }
    setLinter(linter) {
        this.lint = linter;
        return this;
    }
    getLinter() {
        return this.lint;
    }
    activateLinter(activate) {
        this.enableLinter = activate;
        return this;
    }
    asExtension(languageType = LanguageType.PromQL) {
        const language = promQLLanguage(languageType);
        let extension = [language];
        if (this.enableCompletion) {
            const completion = language.data.of({
                autocomplete: (context) => {
                    return this.complete.promQL(context);
                },
            });
            extension = extension.concat(completion);
        }
        if (this.enableLinter) {
            extension = extension.concat(promQLLinter(this.lint.promQL, this.lint));
        }
        return extension;
    }
}
//# sourceMappingURL=promql.js.map