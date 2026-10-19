/**
 * Writes each component's props into the doc comment of its shipped declaration, so hovering
 * `<Badge>` in an editor lists what Badge accepts.
 *
 * TypeScript's hover shows a component's signature and doc comment but never expands its props
 * type, so without this a `forwardRef` component shows nothing more than
 * `ForwardRefExoticComponent<ButtonProps & …>`. The list is generated from the types rather than
 * written by hand so it cannot drift: names and types come from the checker, descriptions and
 * `@default` tags from the doc comments on the props themselves, and defaults otherwise from the
 * component's destructuring or its `cva` `defaultVariants`.
 *
 * Runs as part of `build:lib`, after tsup has written `dist`.
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, relative, resolve, sep } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '../..');
const SOURCE_DIRECTORY = resolve(PACKAGE_ROOT, 'src');
const DOCS_DIRECTORY = resolve(PACKAGE_ROOT, '../demo/src/content/docs/components');
const DOCS_URL = 'https://equality.eqtylab.io/components';
const DECLARATION_FILES = ['dist/index.d.ts', 'dist/index.d.cts'];

const MAX_LISTED_PROPS = 30;
const MAX_LISTED_LITERALS = 12;
const MAX_TYPE_LENGTH = 120;
const MIN_SUMMARISED_HTML_PROPS = 6;
const IGNORED_PROPS = new Set(['key', 'ref']);

const isComponentName = (name) => /^[A-Z][A-Za-z0-9]*$/.test(name) && /[a-z]/.test(name);

const kebabCase = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const createSourceProgram = () => {
  const config = ts.getParsedCommandLineOfConfigFile(
    resolve(PACKAGE_ROOT, 'tsconfig.json'),
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    }
  );
  return ts.createProgram({
    rootNames: [resolve(SOURCE_DIRECTORY, 'index.ts')],
    options: { ...config.options, noEmit: true },
  });
};

const propOrigin = (prop) => {
  const fileNames = (prop.declarations ?? []).map(
    (declaration) => declaration.getSourceFile().fileName
  );
  if (fileNames.some((fileName) => fileName.startsWith(SOURCE_DIRECTORY + sep))) return 'own';
  if (fileNames.every((fileName) => fileName.includes(`${sep}@types${sep}react${sep}`))) {
    return 'html';
  }
  return 'library';
};

const propertyName = (node) =>
  node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    ? node.text
    : undefined;

const propertyNamed = (objectLiteral, name) =>
  objectLiteral.properties.find(
    (property) => ts.isPropertyAssignment(property) && propertyName(property.name) === name
  );

/** Follows `DEFAULT_LOCALE` or `ELEVATION.RAISED` to the literal they stand for. */
const formatDefault = (checker, expression, depth = 0) => {
  if (ts.isStringLiteralLike(expression)) return JSON.stringify(expression.text);
  if (depth < 3 && (ts.isIdentifier(expression) || ts.isPropertyAccessExpression(expression))) {
    let symbol = checker.getSymbolAtLocation(expression);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol?.valueDeclaration;
    const isConstant =
      declaration &&
      (ts.isPropertyAssignment(declaration) ||
        (ts.isVariableDeclaration(declaration) &&
          ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const));
    if (isConstant && declaration.initializer) {
      return formatDefault(checker, declaration.initializer, depth + 1);
    }
  }
  return expression.getText().replace(/\s+/g, ' ');
};

const unwrapComponentFunction = (node) => {
  if (!node) return undefined;
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return node;
  }
  if (ts.isVariableDeclaration(node)) return unwrapComponentFunction(node.initializer);
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) {
    return unwrapComponentFunction(node.expression);
  }
  if (ts.isCallExpression(node)) return unwrapComponentFunction(node.arguments[0]);
  return undefined;
};

const destructuredDefaults = (checker, declaration) => {
  const defaults = new Map();
  const pattern = unwrapComponentFunction(declaration)?.parameters[0]?.name;
  if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults;

  for (const element of pattern.elements) {
    const name = propertyName(element.propertyName ?? element.name);
    if (!element.dotDotDotToken && element.initializer && name) {
      defaults.set(name, formatDefault(checker, element.initializer));
    }
  }
  return defaults;
};

/** A `cva` variant prop is declared by its entry in the config's `variants` object. */
const cvaVariantOf = (prop) => {
  const declaration = prop.declarations?.[0];
  const variants = declaration?.parent;
  const variantsAssignment = variants?.parent;
  const config = variantsAssignment?.parent;
  if (
    declaration &&
    ts.isPropertyAssignment(declaration) &&
    ts.isObjectLiteralExpression(variants) &&
    ts.isPropertyAssignment(variantsAssignment) &&
    propertyName(variantsAssignment.name) === 'variants' &&
    ts.isObjectLiteralExpression(config)
  ) {
    return { options: declaration.initializer, config };
  }
  return undefined;
};

const variantDefault = (checker, prop) => {
  const config = cvaVariantOf(prop)?.config;
  const defaultVariants = config && propertyNamed(config, 'defaultVariants')?.initializer;
  if (!defaultVariants || !ts.isObjectLiteralExpression(defaultVariants)) return undefined;
  const value = propertyNamed(defaultVariants, prop.name)?.initializer;
  return value ? formatDefault(checker, value) : undefined;
};

const literalText = (node) => {
  if (ts.isStringLiteral(node)) return JSON.stringify(node.text);
  return node.getText();
};

/** The order the values were written in, which the checker does not keep. */
const declaredLiteralOrder = (checker, prop) => {
  const variant = cvaVariantOf(prop);
  if (variant && ts.isObjectLiteralExpression(variant.options)) {
    return variant.options.properties.map((property) => {
      const name = propertyName(property.name);
      return name === 'true' || name === 'false' || /^\d/.test(name) ? name : JSON.stringify(name);
    });
  }

  let node = prop.declarations?.[0]?.type;
  if (node && ts.isTypeReferenceNode(node)) {
    const alias = checker.getTypeFromTypeNode(node).aliasSymbol?.declarations?.[0];
    node = alias && ts.isTypeAliasDeclaration(alias) ? alias.type : undefined;
  }
  if (!node || !ts.isUnionTypeNode(node)) return [];
  return node.types.map((member) =>
    ts.isLiteralTypeNode(member) ? literalText(member.literal) : ''
  );
};

const isLiteralType = (type) =>
  (type.flags &
    (ts.TypeFlags.StringLiteral |
      ts.TypeFlags.NumberLiteral |
      ts.TypeFlags.BooleanLiteral |
      ts.TypeFlags.Null)) !==
  0;

const formatLiterals = (checker, prop, members) => {
  const order = declaredLiteralOrder(checker, prop);
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  const names = members
    .map((member) => checker.typeToString(member))
    .sort((a, b) => rank(a) - rank(b));

  if (names.includes('true') && names.includes('false')) {
    return ['boolean', ...names.filter((name) => name !== 'true' && name !== 'false')];
  }
  return names;
};

const printer = ts.createPrinter({ removeComments: true });

const shorten = (text) => {
  const flat = text.replace(/\s+/g, ' ');
  return flat.length > MAX_TYPE_LENGTH ? `${flat.slice(0, MAX_TYPE_LENGTH - 1).trimEnd()}…` : flat;
};

const isOmittedTypeNode = (node, omitsNull) =>
  node.kind === ts.SyntaxKind.UndefinedKeyword ||
  (omitsNull && ts.isLiteralTypeNode(node) && node.literal.kind === ts.SyntaxKind.NullKeyword);

/**
 * Printed from the node rather than the type so an alias such as `React.ReactNode`, which
 * itself includes `null` and `undefined`, keeps its name instead of expanding into its members.
 */
const printTypeWithout = (checker, type, omitsNull) => {
  const flags =
    ts.NodeBuilderFlags.NoTruncation |
    ts.NodeBuilderFlags.UseAliasDefinedOutsideCurrentScope |
    ts.NodeBuilderFlags.IgnoreErrors;
  let node = checker.typeToTypeNode(type, undefined, flags);
  if (node && ts.isUnionTypeNode(node)) {
    const kept = node.types.filter((member) => !isOmittedTypeNode(member, omitsNull));
    node = kept.length === 1 ? kept[0] : ts.factory.createUnionTypeNode(kept);
  }
  if (node && ts.isParenthesizedTypeNode(node)) node = node.type;
  return node ? printer.printNode(ts.EmitHint.Unspecified, node, undefined) : 'unknown';
};

/**
 * Each type a prop can take, so the branches of a union of props can be merged. `undefined`
 * only says a prop is optional, and `VariantProps` adds `null` to every `cva` variant, but any
 * other `null` is a value worth passing, such as Progress's indeterminate `value`.
 */
const typesOf = (checker, prop) => {
  const type = checker.getTypeOfSymbol(prop);
  const omitsNull = Boolean(cvaVariantOf(prop));
  const omitted = ts.TypeFlags.Undefined | ts.TypeFlags.Never | (omitsNull ? ts.TypeFlags.Null : 0);
  const members = (type.isUnion() ? type.types : [type]).filter(
    (member) => !(member.flags & omitted)
  );
  if (!members.length) return [];

  if (members.length <= MAX_LISTED_LITERALS && members.every(isLiteralType)) {
    return formatLiterals(checker, prop, members);
  }

  const declaration = prop.declarations?.find((candidate) =>
    candidate.getSourceFile().fileName.startsWith(SOURCE_DIRECTORY + sep)
  );
  if (declaration?.type) {
    return [
      shorten(
        printer.printNode(ts.EmitHint.Unspecified, declaration.type, declaration.getSourceFile())
      ),
    ];
  }

  return [shorten(printTypeWithout(checker, type, omitsNull))];
};

/** A template literal type such as `--${string}` would otherwise close the code span early. */
const code = (text) => {
  const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(longestRun + 1);
  return longestRun ? `${fence} ${text} ${fence}` : `${fence}${text}${fence}`;
};

const tagText = (checker, prop, name) => {
  const tag = prop.getJsDocTags(checker).find((candidate) => candidate.name === name);
  return tag ? ts.displayPartsToString(tag.text).trim() : undefined;
};

const formatProp = (checker, { name, symbols, optional }, defaults) => {
  const first = (read) => symbols.map(read).find((value) => value !== undefined && value !== '');
  const types = [...new Set(symbols.flatMap((symbol) => typesOf(checker, symbol)))];
  const defaultValue =
    first((symbol) => tagText(checker, symbol, 'default')) ??
    defaults.get(name) ??
    first((symbol) => variantDefault(checker, symbol));
  const deprecated = symbols
    .map((symbol) => tagText(checker, symbol, 'deprecated'))
    .find((value) => value !== undefined);
  const description = first((symbol) =>
    ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()
  );

  const label = /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
  let line = `- ${code(`${label}${optional ? '?' : ''}: ${types.join(' | ') || 'never'}`)}`;
  if (defaultValue) line += ` (default ${code(defaultValue)})`;
  if (deprecated !== undefined) line += ` **Deprecated.**${deprecated ? ` ${deprecated}` : ''}`;
  if (description) line += ` — ${description.replace(/\n/g, '\n  ')}`;
  return line;
};

/**
 * A union of props (Button is `<button>` props, or `<a>` props when `href` is set) is merged
 * into one list. A prop is optional unless every branch requires it.
 */
const propsOf = (checker, propsType) => {
  const branches = propsType.isUnion() ? propsType.types : [propsType];
  const props = new Map();

  for (const branch of branches) {
    for (const symbol of checker.getPropertiesOfType(branch)) {
      if (IGNORED_PROPS.has(symbol.name)) continue;
      const prop = props.get(symbol.name) ?? { name: symbol.name, symbols: [], requiredIn: 0 };
      prop.symbols.push(symbol);
      const required = !(symbol.flags & ts.SymbolFlags.Optional);
      const never = checker.getTypeOfSymbol(symbol).flags & ts.TypeFlags.Never;
      if (required && !never) prop.requiredIn += 1;
      props.set(symbol.name, prop);
    }
  }

  const origins = ['own', 'library', 'html'];
  return [...props.values()].map(({ requiredIn, ...prop }) => ({
    ...prop,
    origin: origins.find((origin) => prop.symbols.some((symbol) => propOrigin(symbol) === origin)),
    variant: prop.symbols.some((symbol) => cvaVariantOf(symbol)),
    optional: requiredIn < branches.length,
  }));
};

/** Merged union branches otherwise list props in the order each branch first mentions them. */
const inSourceOrder = (props) => {
  const files = [];
  const position = (prop) => {
    const declaration = prop.symbols
      .flatMap((symbol) => symbol.declarations ?? [])
      .find((candidate) => candidate.getSourceFile().fileName.startsWith(SOURCE_DIRECTORY + sep));
    const fileName = declaration.getSourceFile().fileName;
    if (!files.includes(fileName)) files.push(fileName);
    return [files.indexOf(fileName), declaration.pos];
  };
  const positions = new Map(props.map((prop) => [prop, position(prop)]));
  return [...props].sort((a, b) => {
    const [fileA, posA] = positions.get(a);
    const [fileB, posB] = positions.get(b);
    return fileA - fileB || posA - posB;
  });
};

const htmlElementNames = (checker, propsType) => {
  const branches = propsType.isUnion() ? propsType.types : [propsType];
  const names = new Set();
  for (const branch of branches) {
    const onClick = checker.getPropertyOfType(branch, 'onClick');
    if (!onClick || propOrigin(onClick) !== 'html') continue;
    const handler = checker.getNonNullableType(checker.getTypeOfSymbol(onClick));
    const element = handler.aliasTypeArguments?.[0];
    if (element) names.add(`\`${checker.typeToString(element)}\``);
  }
  return [...names];
};

const docsPageTitle = (slug) => {
  const page = readFileSync(resolve(DOCS_DIRECTORY, `${slug}.mdx`), 'utf8');
  return page.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
};

const docsLink = (name, declaration) => {
  const path = relative(
    resolve(SOURCE_DIRECTORY, 'components'),
    declaration.getSourceFile().fileName
  );
  const candidates = [kebabCase(name)];
  if (!path.startsWith('..')) candidates.push(path.split(sep)[0]);

  const slug = candidates.find((candidate) =>
    existsSync(resolve(DOCS_DIRECTORY, `${candidate}.mdx`))
  );
  if (!slug) return undefined;
  return `[${docsPageTitle(slug) ?? name} documentation](${DOCS_URL}/${slug})`;
};

const describeComponent = (checker, name, symbol) => {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  const signature = checker.getTypeOfSymbol(symbol).getCallSignatures()[0];
  if (!declaration || !signature) return undefined;

  const propsType = signature.parameters[0]
    ? checker.getTypeOfSymbol(signature.parameters[0])
    : undefined;
  const props = propsType ? propsOf(checker, propsType) : [];
  const own = props.filter((prop) => prop.origin === 'own');
  const html = props.filter((prop) => prop.origin === 'html');
  const summariseHtml = html.length >= MIN_SUMMARISED_HTML_PROPS;

  const listed = [
    ...own.filter((prop) => prop.variant),
    ...inSourceOrder(own.filter((prop) => !prop.variant)),
    ...props.filter((prop) => prop.origin === 'library'),
    ...(summariseHtml ? [] : html),
  ];

  const sections = [];
  if (listed.length) {
    const defaults = destructuredDefaults(checker, declaration);
    const lines = listed
      .slice(0, MAX_LISTED_PROPS)
      .map((prop) => formatProp(checker, prop, defaults));
    if (listed.length > MAX_LISTED_PROPS) {
      lines.push(`- …and ${listed.length - MAX_LISTED_PROPS} more`);
    }
    sections.push(['**Props**', ...lines].join('\n'));
  } else if (!summariseHtml) {
    sections.push('Takes no props.');
  }

  if (summariseHtml) {
    const elements = htmlElementNames(checker, propsType);
    const attributes = elements.length
      ? `standard ${elements.join(' or ')} attributes`
      : 'standard HTML attributes';
    sections.push(
      `${listed.length ? 'Also accepts' : 'Accepts'} the ${attributes}, such as \`className\`, \`id\`, \`aria-*\` and event handlers.`
    );
  }

  const link = docsLink(name, declaration);
  if (link) sections.push(link);

  return { markdown: sections.join('\n\n'), props };
};

const cvaNameOf = (prop) => {
  const call = cvaVariantOf(prop)?.config.parent;
  const variable = call?.parent;
  if (call && ts.isCallExpression(call) && variable && ts.isVariableDeclaration(variable)) {
    return propertyName(variable.name);
  }
  return undefined;
};

const docCommentOf = (node) => {
  const comment = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);
  return comment?.getText().replace(/\n\s*/g, '\n ');
};

/**
 * Declaration emit drops the doc comments from a `cva` config, so `variant=` would hover blank
 * even when its entry in `variants` is documented. Collected here to be written back.
 */
const collectVariantComments = (props, variants) => {
  for (const prop of props.filter((candidate) => candidate.variant)) {
    for (const symbol of prop.symbols) {
      const cvaName = cvaNameOf(symbol);
      const comment = symbol.declarations?.[0] && docCommentOf(symbol.declarations[0]);
      if (!cvaName || !comment) continue;
      if (!variants.has(cvaName)) variants.set(cvaName, new Map());
      variants.get(cvaName).set(prop.name, comment);
    }
  }
};

/**
 * `components` maps each exported component to the Markdown appended to its doc comment, and
 * `variants` maps each `cva` function to the doc comments of its documented variants.
 */
export const collectDocs = (program = createSourceProgram()) => {
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(resolve(SOURCE_DIRECTORY, 'index.ts'));
  const components = new Map();
  const variants = new Map();

  for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(entry))) {
    if (!isComponentName(exported.name)) continue;
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (!(symbol.flags & ts.SymbolFlags.Value)) continue;

    const described = describeComponent(checker, exported.name, symbol);
    if (!described) continue;
    components.set(exported.name, described.markdown);
    collectVariantComments(described.props, variants);
  }
  return { components, variants };
};

const exportedLocalNames = (sourceFile) => {
  const names = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause) continue;
    if (!ts.isNamedExports(statement.exportClause)) continue;
    for (const specifier of statement.exportClause.elements) {
      if (specifier.isTypeOnly) continue;
      names.set(specifier.name.text, (specifier.propertyName ?? specifier.name).text);
    }
  }
  return names;
};

const declarationStatements = (sourceFile) => {
  const statements = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      if (!statements.has(statement.name.text)) statements.set(statement.name.text, statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) statements.set(declaration.name.text, statement);
      }
    }
  }
  return statements;
};

const commentContent = (comment) =>
  comment
    .slice(3, -2)
    .split('\n')
    .map((line) => line.replace(/^\s*\* ?/, '').trimEnd())
    .join('\n')
    .replace(/^\n+|\n+$/g, '');

/**
 * Text goes before the first block tag, or TypeScript reads it as part of that tag: a trailing
 * `@deprecated` would swallow the whole props list.
 */
const mergeIntoComment = (existing, markdown) => {
  const lines = existing ? commentContent(existing).split('\n') : [];
  const firstTag = lines.findIndex((line) => line.startsWith('@'));
  const description = (firstTag === -1 ? lines : lines.slice(0, firstTag)).join('\n').trim();
  const tags = firstTag === -1 ? [] : lines.slice(firstTag);

  const content = [description, markdown.replace(/\*\//g, '*\\/'), tags.join('\n')]
    .filter(Boolean)
    .join('\n\n');
  const body = content
    .split('\n')
    .map((line) => line.trimEnd())
    .map((line) => (line ? ` * ${line}` : ' *'));
  return ['/**', ...body, ' */'].join('\n');
};

const variantCommentEdits = (text, sourceFile, statements, variants) => {
  const edits = [];
  for (const [cvaName, comments] of variants) {
    const statement = statements.get(cvaName);
    if (!statement) continue;

    const visit = (node) => {
      const name = ts.isPropertySignature(node) ? propertyName(node.name) : undefined;
      const hasComment = name && ts.getJSDocCommentsAndTags(node).some(ts.isJSDoc);
      if (name && comments.has(name) && !hasComment) {
        const start = node.getStart(sourceFile);
        const indent = text.slice(text.lastIndexOf('\n', start - 1) + 1, start);
        const comment = comments.get(name).replace(/\n/g, `\n${indent}`);
        edits.push({ from: start, to: start, insert: `${comment}\n${indent}` });
      }
      ts.forEachChild(node, visit);
    };
    visit(statement);
  }
  return edits;
};

/**
 * Appends each component's Markdown to the doc comment above its declaration, and restores the
 * doc comments of documented `cva` variants.
 */
export const annotateDeclarations = (text, { components, variants = new Map() }) => {
  const sourceFile = ts.createSourceFile('index.d.ts', text, ts.ScriptTarget.Latest, true);
  const localNames = exportedLocalNames(sourceFile);
  const statements = declarationStatements(sourceFile);
  const edits = variantCommentEdits(text, sourceFile, statements, variants);
  const annotated = new Set();

  for (const [exportedName, markdown] of components) {
    const statement = statements.get(localNames.get(exportedName) ?? exportedName);
    if (!statement || annotated.has(statement)) continue;
    annotated.add(statement);

    const comments = ts.getLeadingCommentRanges(text, statement.getFullStart()) ?? [];
    const existing = comments.findLast((range) => text.startsWith('/**', range.pos));

    if (existing) {
      const comment = text.slice(existing.pos, existing.end);
      edits.push({
        from: existing.pos,
        to: existing.end,
        insert: mergeIntoComment(comment, markdown),
      });
    } else {
      const start = statement.getStart(sourceFile);
      edits.push({ from: start, to: start, insert: `${mergeIntoComment(null, markdown)}\n` });
    }
  }

  return edits
    .sort((a, b) => b.from - a.from)
    .reduce(
      (result, edit) => result.slice(0, edit.from) + edit.insert + result.slice(edit.to),
      text
    );
};

const main = () => {
  const docs = collectDocs();
  for (const file of DECLARATION_FILES) {
    const path = resolve(PACKAGE_ROOT, file);
    writeFileSync(path, annotateDeclarations(readFileSync(path, 'utf8'), docs));
  }
  console.log(
    `Documented the props of ${docs.components.size} components in ${DECLARATION_FILES.join(', ')}`
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
