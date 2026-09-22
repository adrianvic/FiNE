import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import { Node, Project, SyntaxKind } from "ts-morph";

const TARGET_MODULE = "@affine/track";

let removedImports = 0;
let removedStatements = 0;
let ambiguous = 0;
let scannedFiles = 0;
let changedFiles = 0;

function getRootIdentifier(node: Node): Node | undefined {
  let current = node;

  while (
    Node.isPropertyAccessExpression(current) ||
    Node.isElementAccessExpression(current)
  ) {
    current = current.getExpression();
  }

  return Node.isIdentifier(current) ? current : undefined;
}

function sameSymbol(a: Node, b: Node): boolean {
  const aSymbol = a.getSymbol();
  const bSymbol = b.getSymbol();

  return Boolean(aSymbol && bSymbol && aSymbol === bSymbol);
}

function findCandidateFiles(): string[] {
  const output = execFileSync(
    "git",
    [
      "grep",
      "-l",
      TARGET_MODULE,
      "--",
      "packages/**/*.ts",
      "packages/**/*.tsx",
    ],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }
  );

  return output
    .split("\n")
    .map(file => file.trim())
    .filter(Boolean)
    .filter(
      file =>
        !file.includes("/node_modules/") &&
        !file.includes("/dist/") &&
        !file.includes("/build/") &&
        !file.endsWith(".d.ts")
    );
}

console.log(`Looking for imports from ${TARGET_MODULE}...`);

let candidateFiles: string[];

try {
  candidateFiles = findCandidateFiles();
} catch {
  console.error(
    "Could not use git grep. Falling back to filesystem scanning."
  );

  candidateFiles = [];
}

if (candidateFiles.length === 0) {
  console.log("No candidate files found.");
  process.exit(0);
}

console.log(
  `Found ${candidateFiles.length} candidate file(s).`
);

console.log("Loading only candidate files into ts-morph...");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

for (const file of candidateFiles) {
  project.addSourceFileAtPath(file);
}

console.log(
  `Loaded ${project.getSourceFiles().length} file(s) into ts-morph.`
);

for (const sourceFile of project.getSourceFiles()) {
  const imports = sourceFile
    .getImportDeclarations()
    .filter(
      importDecl =>
        importDecl.getModuleSpecifierValue() === TARGET_MODULE
    );

  if (imports.length === 0) {
    continue;
  }

  scannedFiles++;

  console.log(`\n${sourceFile.getFilePath()}`);

  const edits = new Map<
    string,
    {
      start: number;
      end: number;
      text: string;
      kind: "import" | "statement";
    }
  >();

  const bindings = [];

  for (const importDecl of imports) {
    console.log(`  removing import: ${importDecl.getText()}`);

    edits.set(
      `${importDecl.getStart()}:${importDecl.getEnd()}`,
      {
        start: importDecl.getStart(),
        end: importDecl.getEnd(),
        text: importDecl.getText(),
        kind: "import",
      }
    );

    bindings.push(
      ...importDecl.getNamedImports(),
      importDecl.getDefaultImport(),
      importDecl.getNamespaceImport()
    );
  }

  /*
   * Only scan CallExpressions once.
   */
  const calls = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );

  /*
   * Resolve imported bindings once.
   */
  for (const binding of bindings) {
    if (!binding) {
      continue;
    }

    const bindingSymbol = binding.getSymbol();

    if (!bindingSymbol) {
      console.log(
        `  ambiguous binding: ${binding.getText()}`
      );
      ambiguous++;
      continue;
    }

    for (const callExpression of calls) {
      const rootIdentifier = getRootIdentifier(
        callExpression.getExpression()
      );

      if (!rootIdentifier) {
        continue;
      }

      if (!sameSymbol(rootIdentifier, binding)) {
        continue;
      }

      const statement = callExpression.getFirstAncestorByKind(
        SyntaxKind.ExpressionStatement
      );

      if (!statement) {
        console.log(
          `  ambiguous reference: ${callExpression.getText()}`
        );
        ambiguous++;
        continue;
      }

      if (statement.getExpression() !== callExpression) {
        console.log(
          `  ambiguous statement: ${statement.getText()}`
        );
        ambiguous++;
        continue;
      }

      const key = `${statement.getStart()}:${statement.getEnd()}`;

      edits.set(key, {
        start: statement.getStart(),
        end: statement.getEnd(),
        text: statement.getText(),
        kind: "statement",
      });
    }
  }

  if (edits.size === 0) {
    continue;
  }

  const originalText = readFileSync(
    sourceFile.getFilePath(),
    "utf8"
  );

  const orderedEdits = [...edits.values()].sort(
    (a, b) => b.start - a.start
  );

  let newText = originalText;

  for (const edit of orderedEdits) {
    console.log(`  removing: ${edit.text}`);

    newText =
      newText.slice(0, edit.start) +
      newText.slice(edit.end);

    if (edit.kind === "import") {
      removedImports++;
    } else {
      removedStatements++;
    }
  }

  if (newText === originalText) {
    continue;
  }

  /*
   * Direct filesystem write.
   *
   * This avoids ts-morph's manipulation layer completely.
   */
  writeFileSync(
    sourceFile.getFilePath(),
    newText,
    "utf8"
  );

  changedFiles++;
}

console.log("\nDone.");
console.log(`Candidate files: ${candidateFiles.length}`);
console.log(`Files scanned: ${scannedFiles}`);
console.log(`Files changed: ${changedFiles}`);
console.log(`Imports removed: ${removedImports}`);
console.log(`Statements removed: ${removedStatements}`);
console.log(`Ambiguous cases: ${ambiguous}`);

if (ambiguous > 0) {
  console.log(
    "\nAmbiguous references were intentionally left alone."
  );
}