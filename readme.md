## Popular Features You Can Add
Inline buttons with ctx.reply() and InlineKeyboard

Middlewares for logging, filtering, throttling

Session handling with @grammyjs/storage

Bot hosting (Render, Vercel, or any VPS)

## Sessions
Add Session Support (TypeScript version)

### Where Is Session Stored?
By default, grammY stores session data in memory (RAM). This is fast and great for testing or small bots, but the data is lost if the bot restarts.

Optional: Use Persistent Storage
For production, you might want to store sessions in:

Redis (@grammyjs/storage-redis)

MongoDB (@grammyjs/storage-mongodb)

File (@grammyjs/storage-file)

## Filtered Wait Calls
If you want to wait for a specific type of update, you can use a filtered wait call.

```ts
Match a filter query like with `bot.on`.
const message = await conversation.waitFor("message");
// Wait for text like with `bot.hears`.
const hears = await conversation.waitForHears(/regex/);
// Wait for commands like with `bot.command`.
const start = await conversation.waitForCommand("start");
// etc
```