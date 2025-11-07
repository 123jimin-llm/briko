/* eslint-env node */
//@ts-check

import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

async function main() {
    const rl = readline.createInterface({input: stdin, output: stdout});

    while(true) {
        const user_input = await rl.question("You> ");
        if(user_input.match(/^\s\*$/)) break;
    }

    rl.close();
}

main().catch(console.error);