#!/usr/bin/env bun

import { Command, Option } from "commander";
import degit from "degit";
import prompts from "prompts";
import packageJson from "../package.json";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main() {
  const program = new Command();

  program
    .name("create-vita")
    .description("Scaffold a new Vite + Alpine.js project")
    .argument("[project-name]", "name of the project folder")
    .addOption(new Option("--with-jsxpine", "add jsxpine ui reusable components"))
    .version(
      packageJson.version || "1.0.0",
      "-v, --version",
      "display the version number"
    )
    .action(
      /**
       * Create a new Vite + TSX + Alpine.js project
       * @param {string} projectName name of the project folder
       * @param {object} options options
       * @param {boolean} options.withJsxpine add jsxpine ui reusable components
       */
      async (projectName, options) => {
        let withJsxpine = options?.withJsxpine ?? false;

        // Ask for project name if not provided
        if (!projectName) {
          const res = await prompts({
            type: "text",
            name: "name",
            message: "Project name:",
            initial: "my-vite-alpine-app",
          });
          projectName = res.name;
        }

        // Add jsxpine ui reusable components
        if (!options?.withJsxpine) {
          const res = /** @type {{ withJsxpine: boolean }} */ (await prompts({
            type: "confirm",
            name: "withJsxpine",
            message: "Add jsxpine ui reusable components?",
            initial: false,
          }));
          withJsxpine = res.withJsxpine;
        }

        // Clone the starter template
        const repo = `billybillydev/create-vita/apps/${
          withJsxpine ? "jsxpine-" : ""
        }starter`;

        const emitter = degit(repo, {
          cache: false,
          force: true,
          verbose: true,
        });

        await emitter.clone(projectName);

        // Remove bun.lockb
        const bunLockFile = Bun.file(
          `${process.cwd()}/${projectName}/bun.lockb`
        );
        if (await bunLockFile.exists()) {
          await bunLockFile.delete();
        }

        // Update package.json name
        const pkgPath = `${process.cwd()}/${projectName}/package.json`;
        const pkgFile = Bun.file(pkgPath);

        if (await pkgFile.exists()) {
          const pkg = JSON.parse(await pkgFile.text(), "utf-8");
          pkg.name = projectName;

          await Bun.write(pkgPath, JSON.stringify(pkg, null, 2));
        }

        console.log(`\n✅ Done!`);
        console.log(`\nNext steps:\n`);
        console.log(`cd ${projectName}`);
        console.log(`npm install`);
        console.log(`npm run dev\n`);
      }
    );
  program.parse(process.argv);
}

main();
