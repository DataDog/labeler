import * as core from "@actions/core";
import { Minimatch } from "minimatch";

export function getLabels(
  labelGlobs: Map<string, string[]>,
  files: string[]
): string[] {
  const labels = new Set<string>();

  for (const [label, globs] of labelGlobs.entries()) {
    core.warning(`processing ${label}`);
    for (let glob of globs) {
      core.warning(` checking pattern ${glob}`);

      let requiredMatches = 1;
      if (glob.startsWith("all:")) {
        requiredMatches = files.length;
        glob = glob.replace("all:", "");
      }

      let addedLabels = new Set<string>();
      let matches = 0;

      const matcher = new Minimatch(glob);
      for (const file of files) {
        core.warning(` - ${file}`);
        if (matcher.match(file)) {
          core.warning(` ${file} matches glob ${glob}`);
          matches++;
          if (matches === requiredMatches) {
            addedLabels.add(label);
            continue;
          }
        }
        try {
          const regex = new RegExp(glob);
          if (file.match(regex)) {
            core.warning(` ${file} matches regex ${regex}`);
            matches++;
            if (matches === requiredMatches) {
              addedLabels.add(file.replace(regex, label));
              continue;
            }
          }
        } catch {}
      }
      if (addedLabels.size != requiredMatches) {
        for (const addedLabel of addedLabels) {
          labels.add(addedLabel);
        }
      }
    }
  }

  return Array.from(labels);
}
