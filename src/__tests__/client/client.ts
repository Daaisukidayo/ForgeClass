import { ForgeClient, LogPriority } from "@tryforge/forgescript"
import { Events } from "discord.js"
import { ForgeClass } from "../.."
import { runSmoke } from "./smoke"

process.loadEnvFile()

const smoke = process.argv.includes("smoke")

const client = new ForgeClient({
    logLevel: LogPriority.High,
    intents: ["Guilds", "MessageContent", "GuildMessages"],
    events: ["clientReady", "messageCreate"],
    extensions: [new ForgeClass()],
    prefixes: ["!", "<@$botID>"],
    token: process.env.TOKEN,
})

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
})

client.commands.add({
    type: Events.ClientReady,
    code: `$logger[Info;Ready on client $username[$botID]]`,
})

client.commands.add({
    name: "eval",
    aliases: ["e"],
    type: Events.MessageCreate,
    code: `
    $onlyIf[$authorID==$botOwnerID]
    $let[text;$eval[$message;false]]
    $if[$charCount[$get[text]]>1950;$attachment[$get[text];result.json;true];$codeBlock[$get[text];JSON]]
    `,
})

if (smoke) client.once(Events.ClientReady, () => void runSmoke(client))

client.login()
