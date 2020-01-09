"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const minimatch_1 = require("minimatch");
function getLabels(labelGlobs, files) {
    const labels = new Set();
    for (const [label, globs] of labelGlobs.entries()) {
        core.debug(`processing ${label}`);
        let addedLabels = new Set();
        for (let glob of globs) {
            core.debug(` checking pattern ${glob}`);
            let requiredMatches = 1;
            if (glob.startsWith("all:")) {
                requiredMatches = files.length;
                glob = glob.replace("all:", "");
            }
            let matches = 0;
            const matcher = new minimatch_1.Minimatch(glob);
            for (const file of files) {
                core.debug(` - ${file}`);
                if (matcher.match(file)) {
                    core.debug(` ${file} matches glob ${glob}`);
                    matches++;
                    addedLabels.add(label);
                    continue;
                }
                try {
                    const regex = new RegExp(glob);
                    let patternMatches = file.match(regex);
                    if (patternMatches) {
                        if (patternMatches.length > 1) {
                            let r = file.replace(regex, label);
                            core.debug(` ${file} replaced by ${r} for regex ${regex}`);
                            addedLabels.add(r);
                        }
                        else {
                            core.debug(` ${file} matches regex ${glob}`);
                            addedLabels.add(label);
                        }
                        matches++;
                        continue;
                    }
                }
                catch (_a) { }
            }
            if (requiredMatches === files.length) {
                if (matches === requiredMatches) {
                    for (const addedLabel of addedLabels) {
                        core.debug(`adding ${addedLabel}`);
                        labels.add(addedLabel);
                    }
                }
            }
            else {
                for (const addedLabel of addedLabels) {
                    core.debug(`adding ${addedLabel}`);
                    labels.add(addedLabel);
                }
            }
        }
    }
    return Array.from(labels);
}
exports.getLabels = getLabels;
