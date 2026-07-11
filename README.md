# @znan/wabot

[![NPM Version](https://img.shields.io/npm/v/@znan/wabot?style=flat-square)](https://www.npmjs.com/package/@znan/wabot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An unofficial socket-based WhatsApp bot framework built on top of [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys). It streamlines socket connection handshakes, multi-database storage integration, automatic session persistence/recovery, and common media utilities.

---

## Installation

```bash
npm install @znan/wabot
```

---

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

---

## Connection Configuration

```javascript
new Connection(options, extraBaileysConfig?)
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `plugins_dir` | `string` | `'plugins'` | Target directory for command plugins |
| `session_dir` | `string` / `object` | `'./session'` | Path to credentials store or a custom session handler |
| `online` | `boolean` | `false` | Keep account online |
| `presence` | `boolean` | `false` | Enable automatic presence notification |
| `bypass_ephemeral` | `boolean` | `false` | Skip message auto-delete limits |
| `pairing.state` | `boolean` | `false` | Use pairing code authentication instead of QR code |
| `pairing.number` | `string` | `''` | Phone number to generate the 8-character pairing code |

---

## Events

The connection router emits custom resolved events and proxies raw events directly from Baileys.

### 1. Custom Events

Pre-deserialized, formatted, and JID-resolved event payloads.

- **`prepare`**: Triggered once when the session initializes and plugins are ready.
- **`connect`**: Triggered on every socket link or reconnection attempt.
- **`import`**: Formatted message wrapper containing parsed command structure.
  ```javascript
  conn.on('import', x => {
     if (x.isCommand) {
        console.log(`Command: ${x.command} from ${x.m.sender}`)
     }
  })
  ```
- **`poll`**: Decrypted user vote updates.
- **`group.add` / `group.remove` / `group.promote` / `group.demote`**: Specialized group participant status events.

### 2. Original Events (Baileys Passthrough)

All default Baileys event emitters can be intercepted by adding the `baileys:` prefix to the event name.

```javascript
// Monitor socket states
conn.on('baileys:connection.update', update => {
   const { connection, lastDisconnect } = update
   console.log('Socket link state:', connection)
})

// Monitor user actions
conn.on('baileys:messages.reaction', reaction => {
   console.log('Emoji interaction:', reaction)
})
```

---

## Sending Messages

`Connection` implements several utility methods to ease message payload assembly.

### 1. Basic Text & Custom Modification
```javascript
// Simple message reply
await conn.reply(jid, 'Hello back!', quotedMessage)

// Custom text with metadata/context info
await conn.sendMessageModify(jid, 'Check this link', quotedMessage, {
   title: 'Link Title',
   body: 'Preview description text',
   thumbnail: bufferOrUrl,
   url: 'https://example.com'
})
```

### 2. Media Upload & Stream Handling
`sendFile` handles automatic type mapping, stream parsing, and extension conversions.
```javascript
// Send images, videos, audio notes, or documents
await conn.sendFile(jid, 'https://example.com/sound.mp3', 'sound.mp3', 'Listen to this', quotedMessage)
```

### 3. Interactive Options & Actions
```javascript
// Create poll messages
await conn.sendPoll(jid, 'Choose database:', ['JSON', 'MongoDB', 'SQLite'], quotedMessage)

// Send WebP sticker with customized metadata
await conn.sendSticker(jid, stickerBufferOrPath, quotedMessage, { packname: 'MyPack', author: 'BotAuthor' })

// Update broadcast status (stories)
await conn.groupStatus(jid, { text: 'New release!', background: '#25C3DC' })
```

---

## System Helpers

`@znan/wabot` exposes a set of utility classes for formatting, conversion, and metadata management.

### `Function`
Common processing utilities (e.g. scaling, parsing, and delay loops).
```javascript
const { Function: Func } = require('@znan/wabot')

Func.delay(1000) // Sleep routine
const mentions = Func.mention('Hello @628123456789') // Extract target JIDs
```

### `Converter`
Translates media streams via `ffmpeg` into compliant WhatsApp media structures.
```javascript
const { Converter } = require('@znan/wabot')

const opusBuffer = await Converter.toPTT(mp3Buffer, 'mp3')
```

### `Exif`
Processes images and videos into WhatsApp-compliant WebP stickers, carrying metadata.
```javascript
const { Exif } = require('@znan/wabot')

const webpSticker = await Exif.writeExifImg(jpgBuffer, { packname: 'Pack', author: 'Me' })
```

### `Spam`
Rate limit checking utility to handle bans, temporary cooling periods, and message speeds.
```javascript
const { Spam } = require('@znan/wabot')

const spamCheck = new Spam({ mode: 'command', messageLimit: 5 })
const result = spamCheck.check(conn, m, global.db.users[m.sender], isCmd, cmd, global.db.setting)
```

---

## Database Integration

`Database.create` configures the driver storage interface and extracts session sync paths automatically. It returns an object `{ database, session }`.

```javascript
const { Connection, Database } = require('@znan/wabot')

const start = async () => {
   // Supported engines: 'json' | 'mongodb' | 'redis' | 'mysql' | 'postgresql' | 'sqlite'
   const { database, session } = Database.create('mongodb://localhost:27017', 'wabot')

   const conn = new Connection({
      plugins_dir: 'plugins',
      session_dir: session || './session'
   })

   conn.on('connect', async () => {
      global.db = { users: {}, groups: {}, setting: {}, ...(await database.fetch() || {}) }
   })

   // Save loop handler
   setInterval(async () => {
      if (global.db) await database.save(global.db)
   }, 30000)
}

start()
```

---

## Support & Peer Dependencies

Install optional peer database drivers depending on your connection configuration:

- **MongoDB**: `npm install mongodb`
- **Redis**: `npm install ioredis`
- **MySQL**: `npm install mysql2`
- **PostgreSQL**: `npm install pg`
- **SQLite**: `npm install better-sqlite3`

---

## Community & Support

If you encounter issues, need clarification, or want to connect with the maintainers and community:

- **Issues**: Submit bug reports or feature requests on our [GitHub Issues](https://github.com/znanx/wabot/issues).
- **GitHub Repository**: [znanx/wabot](https://github.com/znanx/wabot).
- **Author**: Reach out to the developer **znan**.

---

## License

[MIT](LICENSE)
