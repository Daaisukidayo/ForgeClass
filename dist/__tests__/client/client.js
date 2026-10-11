"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const smoke_1 = require("./smoke");
process.loadEnvFile();
const smoke = process.argv.includes("smoke");
const client = new forgescript_1.ForgeClient({
    logLevel: forgescript_1.LogPriority.High,
    intents: ["Guilds", "MessageContent", "GuildMessages"],
    events: ["clientReady", "messageCreate"],
    extensions: [new __1.ForgeClass()],
    prefixes: ["!", "<@$botID>"],
    token: process.env.TOKEN,
});
client.classes.add({
    name: "Profile",
    fields: { id: "$authorID", coins: 0, "#owner": "$username[$getField[this;id]]" },
    methods: {
        name: "$username[$getField[this;id]]",
        owner: "$getField[this;#owner]",
        earn: {
            params: ["amount"],
            code: `
            $setField[this;coins;$math[$getField[this;coins]+$env[amount]]]
            $return[$getField[this;coins]]
            `,
        },
    },
});
client.commands.add({
    type: discord_js_1.Events.ClientReady,
    code: `$logger[Info;Ready on client $username[$botID]]`,
});
client.commands.add({
    name: "eval",
    aliases: ["e"],
    type: discord_js_1.Events.MessageCreate,
    code: `
    $onlyIf[$authorID==$botOwnerID]
    $let[text;$eval[$message;false]]
    $if[$charCount[$get[text]]>1950;$attachment[$get[text];result.json;true];$codeBlock[$get[text];JSON]]
    `,
});
if (smoke)
    client.once(discord_js_1.Events.ClientReady, () => void (0, smoke_1.runSmoke)(client));
client.login();
//# sourceMappingURL=client.js.map