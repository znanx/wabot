# @znan/wabot

[![NPM Version](https://img.shields.io/npm/v/@znan/wabot?style=flat-square)](https://www.npmjs.com/package/@znan/wabot)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)

An unofficial socket-based WhatsApp bot framework built on [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys). It handles the socket connection, session persistence and recovery, plugin loading, message serialization, and media conversion, so a bot project only writes its command plugins.

<p align="center">
   <img src="https://raw.githubusercontent.com/znanx/znanx/refs/heads/main/wabot.png" alt="@znan/wabot">
</p>

A working bot built with this framework is available at [znanx/moon-bot](https://github.com/znanx/moon-bot).

## Requirements

- Node.js 20 or newer (the framework calls the global `fetch` API and uses `node:util` for terminal color detection).
- `ffmpeg` installed and available on `PATH` for audio and video conversion.

## Installation

```bash
npm install @znan/wabot
```

## Quick Start

```javascript
const { Connection } = require('@znan/wabot')

const conn = new Connection({
   plugins_dir: 'plugins',
   session_dir: './session',
   online: true,
   presence: true
})

conn.on('prepare', x => console.log(x.message))
conn.on('error', x => console.error(x.message))
```

On first run the framework prints a QR code in the terminal. Scan it with the WhatsApp account you want the bot to use. To log in with a pairing code instead, set `pairing.state: true` and `pairing.number`.

## Connection Configuration

```javascript
new Connection(options, extraBaileysConfig?)
```

`extraBaileysConfig` is passed straight into the Baileys socket config, so any Baileys option (browser description, `syncFullHistory`, `markOnlineOnConnect`, and others) can be set through the second argument.

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `plugins_dir` | `string` | `'plugins'` | Directory the command plugins are loaded from |
| `session_dir` | `string` / `object` | `'./session'` | Path to the credentials store, or a custom session handler |
| `online` | `boolean` | `false` | Keep the account marked as online |
| `presence` | `boolean` | `false` | Enable automatic presence updates |
| `bypass_ephemeral` | `boolean` | `false` | Skip message auto-delete limits |
| `pairing.state` | `boolean` | `false` | Log in with a pairing code instead of the QR code |
| `pairing.number` | `string` | `''` | Phone number the 8-character pairing code is generated for |
| `pairing.code` | `string` | `''` | Supply your own 8-character pairing code |
| `version` | `array` | Baileys default | WhatsApp web version override |
| `bot` | `function` | `() => false` | Hook that marks selected chats as bot-owned |
| `custom_id` | `string` | `''` | Custom identifier for the connection |

## Events

The connection emits resolved custom events and proxies every raw Baileys event with a `baileys:` prefix.

### Custom Events

- **`connect`**: emitted on every socket link or reconnection. Payload: `{ display, message }`.
- **`prepare`**: emitted once when the session is registered and plugins are ready. Payload: `{ display, message }`.
- **`import`**: emitted for every incoming message after serialization. The payload carries the parsed command structure:
  ```javascript
  conn.on('import', x => {
     if (x.isCommand) {
        console.log(`Command: ${x.command} from ${x.m.sender}`)
     }
  })
  ```
- **`error`**: emitted on connection failures, bans, session problems, and invalid pairing codes. Payload: `{ display, message }`.
- **`stories`**: emitted when a contact posts a status update.
- **`call`**: emitted on incoming WhatsApp calls.
- **`group.add` / `group.remove` / `group.promote` / `group.demote`**: participant status changes. Payload: `{ action, jid, author, subject, member, groupMetadata }`.
- **`group.subject` / `group.desc` / `group.announce` / `group.restrict` / `group.memberAddMode` / `group.joinApprovalMode`**: group metadata changes.
- **`group.request`**: emitted when a user requests to join a group.
- **`presence.update`**: contact presence changes.
- **`messages.update` / `message.delete`**: message state changes and deletions.

### Raw Events (Baileys Passthrough)

Any Baileys event can be intercepted by adding the `baileys:` prefix:

```javascript
conn.on('baileys:connection.update', update => {
   const { connection, lastDisconnect } = update
   console.log('Socket link state:', connection)
})

conn.on('baileys:messages.reaction', reaction => {
   console.log('Emoji interaction:', reaction)
})
```

## Sending Messages

`Connection` carries utility methods for message assembly. All of them return the Baileys send result.

### Text

```javascript
// Reply to a quoted message
await conn.reply(jid, 'Hello back!', quotedMessage)

// Text with link preview metadata
await conn.sendMessageModify(jid, 'Check this link', quotedMessage, {
   title: 'Link Title',
   body: 'Preview description text',
   thumbnail: bufferOrUrl,
   url: 'https://example.com'
})

// Send a poll, minimum two options
await conn.sendPoll(jid, 'Choose database:', { options: ['JSON', 'MongoDB', 'SQLite'] }, quotedMessage)
```

### Media

```javascript
// Automatic type detection for images, videos, audio notes, and documents
await conn.sendFile(jid, 'https://example.com/sound.mp3', 'sound.mp3', 'Listen to this', quotedMessage)

// Send a WebP sticker with metadata
await conn.sendSticker(jid, stickerBufferOrPath, quotedMessage, { packname: 'MyPack', author: 'BotAuthor' })

// Post a broadcast status (story)
await conn.groupStatus(jid, { text: 'New release!', background: '#25C3DC' })
```

Additional methods on the connection include `sendReact` (emoji reactions), `sendContact` (vCard), `sendLinkPreview`, `sendPtv` (video notes), `sendAlbumMessage` (multi-image albums), `sendProgress` (upload progress replies), `replyAI` (quoted-reply helper), `copyNForward`, and `downloadMediaMessage`.

On every serialized message `m` (the `import` payload and plugin context) there are also `m.reply(text)`, `m.react(emoji)`, and `m.download()`.

## System Helpers

### `Function`

Common processing utilities.

```javascript
const { Function: Func } = require('@znan/wabot')

await Func.delay(1000)                          // Sleep routine
const mentions = Func.mention('Hello @628123456789') // Extract target JIDs
Func.formatSize(2048)                           // '2.00 KB'
```

Other utilities include `Func.uuid`, `Func.getFile`, `Func.isUrl`, `Func.createThumb`, `Func.jsonFormat`, `Func.makeId`, and `Func.fetch` wrappers.

### `Converter`

Converts media buffers through `ffmpeg` into WhatsApp-compliant formats.

```javascript
const { Converter } = require('@znan/wabot')

const opusBuffer = await Converter.toPTT(mp3Buffer, 'mp3')
```

Also available: `toAudio`, `toVideo`, and `webpToMp4`.

### `Exif`

Turns images and videos into WhatsApp WebP stickers with metadata.

```javascript
const { Exif } = require('@znan/wabot')

const webpSticker = await Exif.writeExifImg(jpgBuffer, { packname: 'Pack', author: 'Me' })
```

Also available: `writeExifVid`, `writeExifWebp`, `imageToWebp`, and `videoToWebp`.

### `Spam`

Rate limit checking with ban handling and cooldowns.

```javascript
const { Spam } = require('@znan/wabot')

const spamCheck = new Spam({ mode: 'command', messageLimit: 5 })
const result = spamCheck.check(conn, m, users[m.sender], isCommand, command, setting)
```

Constructor options: `mode` (`'command'`, `'msg'`, or `'all'`), `messageLimit`, `timeWindowSeconds`, `commandCooldownSeconds`, `cooldownSeconds`, `banCooldownSeconds`, `maxBanTimes`, and `banDecayTime`.

### `Scraper`

URL shorteners and file upload helpers.

### `Config`

Reads `./config.json` from the working directory at import time.

### `AlyaApi`

Re-export of [`@alyachan/api`](https://www.npmjs.com/package/@alyachan/api).

## Database Integration

`Database.create(url, name)` resolves the storage driver from the URL protocol and returns `{ database, session }`. Pass a MongoDB, Redis, PostgreSQL, MySQL, or SQLite URL to pick the driver. Call it without a URL to use the local JSON driver.

The `database` object exposes `fetch()` and `save(data)`. For external drivers it also exposes `getSession()`, whose result can be passed as `session_dir` so the Baileys session is stored in the same database.

```javascript
const { Connection, Database } = require('@znan/wabot')

const start = async () => {
   const { database, session } = Database.create('mongodb://localhost:27017', 'wabot')

   const conn = new Connection({
      plugins_dir: 'plugins',
      session_dir: session || './session'
   })

   conn.on('connect', async () => {
      global.db = { users: {}, groups: {}, setting: {}, ...(await database.fetch() || {}) }
   })

   setInterval(async () => {
      if (global.db) await database.save(global.db)
   }, 30000)
}

start()
```

## Optional Peer Dependencies

Install the driver that matches your database URL:

- MongoDB: `npm install mongodb`
- Redis: `npm install ioredis`
- MySQL: `npm install mysql2`
- PostgreSQL: `npm install pg`
- SQLite: `npm install better-sqlite3`

## Community & Support

- **Issues**: bug reports and feature requests go to [GitHub Issues](https://github.com/znanx/wabot/issues).
- **Repository**: [znanx/wabot](https://github.com/znanx/wabot).
- **Author**: znan.

## License

[Apache-2.0](LICENSE)
