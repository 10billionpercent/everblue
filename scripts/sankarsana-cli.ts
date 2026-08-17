import { unstable_dev } from "wrangler";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const worker = await unstable_dev("scripts/test.ts", {
  config: "scripts/wrangler-test.jsonc",
  persist: true,
});

const rl = readline.createInterface({
  input,
  output,
});

console.log("\n💙 Everblue — Sankarsana CLI");
console.log("Type `help` for commands or `exit` to quit.\n");

async function main() {
  while (true) {
    const command = (await rl.question("> ")).trim();

    if (!command) {
      continue;
    }

    if (command === "exit" || command === "quit") {
      break;
    }

    if (command === "help") {
      console.log(`
create <username> <password>
get <userId>
update <userId> <username> <password>
verify <username> <password>
delete <userId>

session <userId>
get-session <token>
delete-session <sessionId>

exit
`);
      continue;
    }

    try {
      const response = await fetch(`http://localhost:${worker.port}`, {
        method: "POST",
        body: command,
      });

      const result = await response.json();

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("💀", error);
    }
  }
}

try {
  await main();
} finally {
  rl.close();
  await worker.stop();
}
