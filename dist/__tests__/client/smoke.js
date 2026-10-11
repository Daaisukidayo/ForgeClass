"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSmoke = runSmoke;
const forgescript_1 = require("@tryforge/forgescript");
const DEADLINE = 60_000;
const paint = (codes) => (text) => (process.env.NO_COLOR ? text : `\u001b[${codes}m${text}\u001b[0m`);
const green = paint("32");
const red = paint("31");
const cyan = paint("36");
const grey = paint("90");
function says(expected) {
    return ({ text }) => text === expected ? null : `gave ${JSON.stringify(text)}, expected ${JSON.stringify(expected)}`;
}
function cases(bot) {
    return [
        {
            id: "file-class",
            name: "runs a class added before login, asking Discord for a name",
            code: "$new[p;Profile]$callMethod[p;name]",
            check: says(bot.name),
        },
        {
            id: "id",
            name: "keeps the ID a field default got from Discord exact",
            code: "$new[p;Profile]$getField[p;id]",
            check: says(bot.id),
        },
        {
            id: "fields",
            name: "changes a field across calls",
            code: "$new[p;Profile]$callMethod[p;earn;50]|$callMethod[p;earn;25]",
            check: says("50|75"),
        },
        {
            id: "embed",
            name: "builds an embed inside a method",
            code: "$class[Card;$field[title;Hello]$method[show;$title[$getField[this;title]]$description[from $username[$authorID]]]]" +
                "$new[c;Card]$callMethod[c;show]",
            check: ({ embeds }) => {
                const embed = embeds[0];
                if (embed?.title !== "Hello")
                    return `the embed's title is ${JSON.stringify(embed?.title)}`;
                return embed.description === `from ${bot.name}`
                    ? null
                    : `the embed reads ${JSON.stringify(embed.description)}`;
            },
        },
        {
            id: "inherit",
            name: "calls the parent's method through $super",
            code: "$class[Base;$method[who;base]]$class[Child;$extends[Base]$method[who;$super[who] and child]]$new[c;Child]$callMethod[c;who]",
            check: says("base and child"),
        },
        {
            id: "json",
            name: "brings an instance back from its JSON",
            code: "$new[p;Profile]$let[x;$callMethod[p;earn;10]]$jsonLoad[q;$env[p]]$callMethod[q;earn;5]",
            check: says("15"),
        },
        {
            id: "private",
            name: "fills a # field from Discord, and reads it in a method",
            code: "$new[p;Profile]$callMethod[p;owner]",
            check: says(bot.name),
        },
        {
            id: "private-hidden",
            name: "keeps # fields out of the instance's JSON",
            code: "$new[p;Profile]$env[p]",
            check: ({ text }) => (text.includes("#owner") ? `the JSON shows it: ${text}` : null),
        },
        {
            id: "private-outside",
            name: "refuses a # field outside its class",
            code: "$new[p;Profile]$getField[p;#owner]",
            failing: true,
            check: ({ errors }) => /#owner can only be used inside the methods of its class/.test(errors[0] ?? "")
                ? null
                : `failed with ${JSON.stringify(errors)}`,
        },
        {
            id: "param",
            name: "turns an ID into a user with $param",
            code: `$class[Who;$method[name;$return[$env[u;username]];$param[u;User]]]$new[w;Who]$callMethod[w;name;${bot.id}]`,
            check: says(bot.name),
        },
        {
            id: "param-unknown",
            name: "refuses an ID that is no user",
            code: "$class[Who;$method[name;$return[$env[u;username]];$param[u;User]]]$new[w;Who]$callMethod[w;name;1]",
            failing: true,
            check: ({ errors }) => /is not of type.*User/.test(errors[0] ?? "") ? null : `failed with ${JSON.stringify(errors)}`,
        },
        {
            id: "break",
            name: "stops a $break from leaving a method",
            code: "$class[Shop;$method[buy;$break]]$new[s;Shop]$loop[2;$callMethod[s;buy]]",
            failing: true,
            check: ({ errors }) => /\$break is not inside a loop in Shop\.buy/.test(errors[0] ?? "")
                ? null
                : `failed with ${JSON.stringify(errors)}`,
        },
    ];
}
function chosen(all) {
    const only = process.env.SMOKE_ONLY?.split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    if (!only?.length)
        return all;
    const unknown = only.filter((id) => !all.some((test) => test.id === id));
    if (unknown.length) {
        console.error(red(`No case called "${unknown.join(", ")}". Pick from: ${all.map((test) => test.id).join(", ")}`));
        process.exit(1);
    }
    return all.filter((test) => only.includes(test.id));
}
async function execute(client, place, code) {
    const errors = [];
    const error = forgescript_1.Logger.error;
    forgescript_1.Logger.error = (...parts) => void errors.push(parts.map(String).join(" "));
    try {
        const ctx = new forgescript_1.Context({
            client,
            data: forgescript_1.Compiler.compile(code),
            command: null,
            environment: {},
            obj: place,
            doNotSend: true,
            redirectErrorsToConsole: true,
        });
        const text = await forgescript_1.Interpreter.run(ctx);
        return { text: text?.trim() ?? "", embeds: ctx.container.embeds.map((embed) => embed.toJSON()), errors };
    }
    finally {
        forgescript_1.Logger.error = error;
    }
}
async function runSmoke(client) {
    const deadline = setTimeout(() => {
        console.error(red("ForgeClass live check: ran out of time"));
        process.exit(1);
    }, DEADLINE);
    const id = process.env.SMOKE_CHANNEL;
    const channel = id ? await client.channels.fetch(id).catch(() => null) : null;
    if (!channel?.isTextBased() || channel.isDMBased()) {
        console.error(red("ForgeClass live check: set SMOKE_CHANNEL to a text channel of a guild the bot is in"));
        process.exit(1);
    }
    const member = await channel.guild.members.fetchMe().catch(() => null);
    const place = { author: client.user, member, guild: channel.guild, channel };
    const all = cases({ id: client.user.id, name: client.user.username });
    const tests = chosen(all);
    console.log(cyan("ForgeClass live check") + grey(`, ${tests.length} of ${all.length} cases`));
    const failed = [];
    for (const test of tests) {
        let problem;
        try {
            const result = await execute(client, place, test.code);
            problem = !test.failing && result.errors.length ? `failed: ${result.errors[0]}` : test.check(result);
        }
        catch (err) {
            problem = err instanceof Error ? err.message : String(err);
        }
        if (problem)
            failed.push(test.id);
        console.log(`${problem ? red("FAIL") : green("ok  ")} ${test.name}${problem ? `\n     ${grey(problem)}` : ""}`);
    }
    const passed = tests.length - failed.length;
    console.log("\n" + (failed.length ? red : green)(`${passed}/${tests.length} passed`));
    if (failed.length)
        console.log(grey(`run them again with SMOKE_ONLY=${failed.join(",")}`));
    clearTimeout(deadline);
    await client.destroy();
    process.exit(failed.length ? 1 : 0);
}
//# sourceMappingURL=smoke.js.map