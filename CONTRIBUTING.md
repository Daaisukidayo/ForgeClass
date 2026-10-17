# Contributing to ForgeClass

Thanks for helping out. Bug reports, ideas and pull requests are all welcome.

## Reporting a bug

Open an issue with:

- the ForgeScript, ForgeClass and Node.js versions,
- the smallest code that shows the bug, as a `$class` or a class file,
- what you expected, and the output or error you got.

## Setting up

You need **Node.js 22** or newer.

```bash
git clone https://github.com/Daaisukidayo/ForgeClass.git
cd ForgeClass
npm i
```

| Script | What it does |
|---|---|
| `npm test` | Builds and runs every test. |
| `npm run lint` | Checks the code with ESLint and Prettier. |
| `npm run tidy` | Fixes what ESLint and Prettier can. |
| `npm run build` | Builds `dist` without the tests. |
| `npm run client` | Starts the test bot. |
| `npm run smoke` | Runs the live checks with the test bot. |
| `npm run commit` | Regenerates `dist`, `docs` and `metadata`, adds the message to the changelog, commits and pushes. |

The test bot and the live checks need a `.env` file next to `package.json`:

```
TOKEN=your bot token
SMOKE_CHANNEL=id of a text channel the bot can see
```

## Where things are

| Folder | What's in it |
|---|---|
| `src/native` | The functions, one per file: `definition`, `instance`, `static` and `registry`. |
| `src/structures` | `ClassDefinition`, instances and `ForgeClassBuilder`. |
| `src/managers` | `ClassManager`, the registry behind `client.classes`. |
| `src/functions` | Running methods, access checks, params, values. |
| `src/__tests__` | The tests, the test harness and the test bot. |

## Writing a function

- Export a `NativeFunction` as `default` from a file in `src/native/<group>`. It's loaded on its own.
- Keep `description` and the arg descriptions short: `"Returns the parent class name"`, `"The class name"`. End a boolean one with `, returns bool`.
- Do not define `version`.
- Reach the registry with `ctx.client.classes`.
- Return errors with `this.customError()`, written the way the others are: `Account.balance is private.`
- Use `optionalRest()` from `src/functions/args` instead of `Arg.restString()`, which makes every rest argument required in ForgeScript 2.3.0.

## Compatibility

ForgeClass works with every ForgeScript release from **1.4.0**. Before using something from ForgeScript that the code doesn't use yet, check that 1.4.0 has it too. CI runs the tests on 1.4.0, 2.0.0, 2.3.0 and the latest release.

## Tests

Every change comes with tests. They use `node:test` and the bot in `src/__tests__/support/harness.ts`:

```ts
import assert from "node:assert/strict"
import { beforeEach, it } from "node:test"
import { bot, failure, output } from "./support/harness"

beforeEach(() => bot.ext.classes.clear())

it("returns what the method returns", async () => {
    await output("$class[A;$method[m;$return[ok]]]")
    assert.equal(await output("$new[a;A]$callMethod[a;m]"), "ok")
})
```

- `output(code)` runs code and fails the test on any error.
- `failure(code)` expects exactly one error and returns its message.
- `json(code)` parses the output as JSON.

Write the code on one line, or join the lines with `+`. A line break inside a method's code ends up in its output.

If the change can only be seen in Discord, add a case to `src/__tests__/client/smoke.ts` too.

## Style

- Prettier settles the formatting: 4 spaces, no semicolons, 120 columns. Run `npm run tidy` before committing.
- Every class, function, method and exported type gets a short JSDoc saying what it does. Other comments explain why, not what.
- The README is for people who already know ForgeScript. Describe what ForgeClass adds or does differently, and don't mention other extensions.

## Pull requests

1. Branch from `dev`, and open the pull request against `dev`.
2. Make sure `npm run lint` and `npm test` pass.
3. Describe what changes for someone using ForgeClass. The commit message goes into the changelog as it is.
4. New functions or options bump the minor version, fixes bump the patch one.

## License

By contributing, you agree that your work is licensed under [GPL-3.0](LICENSE), like the rest of ForgeClass.
