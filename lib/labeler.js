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
        core.warning(`processing ${label}`);
        for (let glob of globs) {
            core.warning(` checking pattern ${glob}`);
            let requiredMatches = 1;
            if (glob.startsWith("all:")) {
                requiredMatches = files.length;
                glob = glob.replace("all:", "");
            }
            let addedLabel = "";
            let matches = 0;
            const matcher = new minimatch_1.Minimatch(glob);
            for (const file of files) {
                core.warning(` - ${file}`);
                if (matcher.match(file)) {
                    core.warning(` ${file} matches glob ${glob}`);
                    matches++;
                    if (matches === requiredMatches) {
                        addedLabel = label;
                        continue;
                    }
                }
                try {
                    const regex = new RegExp(glob);
                    if (file.match(regex)) {
                        core.warning(` ${file} matches regex ${regex}`);
                        matches++;
                        if (matches === requiredMatches) {
                            addedLabel = file.replace(regex, label);
                            continue;
                        }
                    }
                }
                catch (_a) { }
            }
            if (addedLabel != "") {
                labels.add(addedLabel);
            }
        }
    }
    return Array.from(labels);
}
exports.getLabels = getLabels;
