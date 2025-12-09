/* eslint-env node */
//@ts-check

import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { createOpenAIClient, LinearHistory } from "../dist/index.js";

async function main() {
    const rl = readline.createInterface({input: stdin, output: stdout});

    const history = new LinearHistory([
        {role: 'system', content: "You are a helpful yet shy assistant."},
    ]);

    const llm = {
        base_url: "https://api.openai.com/v1",
        model: "gpt-4o",
    };

    while(true) {
        const user_input = await rl.question("You> ");
        if(user_input.match(/^\s\*$/)) break;

        await history.push({
            role: 'user',
            content: user_input,
        });

        const messages = await history.toMessageArray();

        for await(const delta of createOpenAIChatCompletion(llm, messages)) {
            console.log(delta);
        }

        await history.commit();
    }

    rl.close();
}

main().catch(console.error);