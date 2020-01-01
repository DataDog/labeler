import * as core from "@actions/core";
import { Minimatch } from "minimatch";

export function getLabels(
  labelGlobs: Map<string, string[]>,
  files: string[]
): string[] {
  const labels = new Set<string>();

  for (const [label, globs] of labelGlobs.entries()) {
    core.debug(`processing ${label}`);
    let addedLabels = new Set<string>();
    for (let glob of globs) {
      core.debug(` checking pattern ${glob}`);

      let requiredMatches = 1;
      if (glob.startsWith("all:")) {
        requiredMatches = files.length;
        glob = glob.replace("all:", "");
      }

      let matches = 0;
      const matcher = new Minimatch(glob);
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
          if (file.match(regex)) {
            let r = file.replace(regex, label);
            core.debug(` ${file} replaced by ${r} for regex ${regex}`);
            matches++;
            addedLabels.add(r);
            continue;
          }
        } catch {}
      }
      if (requiredMatches === files.length) {
        if (matches === requiredMatches) {
          for (const addedLabel of addedLabels) {
            core.debug(`adding ${addedLabel}`);
            labels.add(addedLabel);
          }
        }
      } else {
        for (const addedLabel of addedLabels) {
          core.debug(`adding ${addedLabel}`);
          labels.add(addedLabel);
        }
      }
    }
  }

  return Array.from(labels);
}
