# @znan/wabot

[![NPM Version](https://img.shields.io/npm/v/@znan/wabot?color=blue&style=flat-square)](https://www.npmjs.com/package/@znan/wabot)
[![NPM Downloads](https://img.shields.io/npm/dt/@znan/wabot?color=blue&style=flat-square)](https://www.npmjs.com/package/@znan/wabot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Socket-based WhatsApp bot module built on [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) v7. Handles LID migration, session management, and event processing out of the box.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Connection](#connection)
- [Events](#events)
  - [Custom Events](#custom-events)
  - [Raw Events](#raw-events)
  - [Payload Details](#payload-details)
- [Plugin System](#plugin-system)
- [Session Management](#session-management)
- [Database](#database)
- [Migration Guide](#migration-guide)
- [Error Handling](#error-handling)
- [Advanced Examples](#advanced-examples)
- [License](#license)

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
   presence: true,
   bypass_ephemeral: true,
})

conn.on('connect', x => console.log(x.message))
conn.on('prepare', x => console.log(x.message))
conn.on('error', x => console.error(x.message))
```

---

## Connection

### Constructor

```javascript
new Connection(options, extra?)
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `plugins_dir` | `string` | `'plugins'` | Plugin directory path |
| `session_dir` | `string` | `'./session'` | Session storage path |
| `online` | `boolean` | `false` | Maintain online presence |
| `presence` | `boolean` | `false` | Emit presence updates |
| `bypass_ephemeral` | `boolean` | `false` | Ignore ephemeral message settings |
| `pairing.state` | `boolean` | `false` | Enable pairing code mode (instead of QR) |
| `pairing.number` | `string` | `''` | Phone number for pairing code |
| `pairing.code` | `string` | `''` | Custom 8-character pairing code |

### Extra Options

Passed directly to Baileys `makeWASocket`. Common options:

```javascript
const conn = new Connection(options, {
   browser: ['Ubuntu', 'Firefox', '20.0.00'],
   version: [2, 3000, 1029030078],          // Baileys version override
   shouldIgnoreJid: jid => /(newsletter|bot)/.test(jid),  // Ignore specific JIDs
   getMessage: async key => { /* custom message retrieval */ },
   groupMetadata: async jid => { /* custom group cache */ },
   // ... any Baileys SocketConfig option
})
```

---

## Events

Events are split into two categories: **Custom Events** (processed, LID-resolved) and **Raw Events** (passthrough from Baileys with `baileys:` prefix).

### Custom Events

#### Connection Lifecycle

| Event | Listener Count | Description |
|---|---|---|
| `connect` | `on` | Fires on every connection attempt (includes reconnects) |
| `prepare` | `once` | Bot is ready — session loaded, plugins watching |
| `error` | `on` | Connection or runtime error |

```javascript
conn.on('connect', ({ display, message }) => console.log(display, message))
conn.on('prepare', ({ display, message }) => {
   console.log(display, message)
   // Bot is ready — start your services here
})
conn.on('error', ({ display, message }) => console.error(display, message))
```

#### Messages

| Event | Description |
|---|---|
| `import` | Message received, serialized, and parsed (includes command parsing) |
| `poll` | Poll vote detected and decrypted |
| `stories` | Status broadcast received |
| `messages.update` | Raw message update (emit passthrough) |
| `message.delete` | Message deleted or revoked |
| `message.receipt` | Message receipt update (read status) |

```javascript
conn.on('import', x => {
   // x.m — serialized message with sender, body, command, args, etc.
   // x.isCommand — boolean if message matches prefix
   // x.command — command name (e.g. 'menu', 'help')
   // x.args — array of arguments
   // x.text — full text after command
   // x.prefix — detected prefix
   // x.prefixes — all active prefixes
   // x.store — global store reference
   if (x.isCommand) {
      console.log(`Command: ${x.command} from ${x.m.sender}`)
   }
})

conn.on('poll', x => {
   console.log(`Poll vote: ${x.selected} by ${x.sender}`)
})

conn.on('message.delete', x => {
   if (x) console.log(`Message deleted in ${x.jid}`)
})
```

#### Groups

| Event | Description |
|---|---|
| `group.add` | Participant added to group |
| `group.remove` | Participant removed from group |
| `group.promote` | Participant promoted to admin |
| `group.demote` | Participant demoted from admin |
| `group.subject` | Group name changed |
| `group.desc` | Group description changed |
| `group.announce` | Group opened or closed |
| `group.restrict` | Edit info permission changed |
| `group.memberAddMode` | Member add mode toggled |
| `group.joinApprovalMode` | Join approval mode toggled |
| `group.request` | Join request created, approved, or rejected |
| `groups.update` | Legacy — any group metadata change |

```javascript
conn.on('group.add', x => {
   // x.jid — group ID
   // x.author — who added (resolved to PN)
   // x.member — who was added (resolved to PN)
   // x.subject — group name
   // x.groupMetadata — full group metadata
   console.log(`${x.member} added to ${x.subject} by ${x.author}`)
})

conn.on('group.remove', x => {
   console.log(`${x.member} removed from ${x.subject}`)
})

conn.on('group.request', x => {
   if (x.action === 'created') {
      console.log(`Join request from ${x.participant}`)
   } else if (x.action === 'approved') {
      console.log(`Request approved by ${x.author}`)
   } else if (x.action === 'rejected') {
      console.log(`Request rejected by ${x.author}`)
   }
})
```

#### Other

| Event | Description |
|---|---|
| `presence.update` | User presence changed (resolved to PN) |
| `call` | Incoming call event |
| `lid-mapping.update` | New LID→PN mapping received |

```javascript
conn.on('presence.update', ({ id, presences }) => {
   for (const [jid, data] of Object.entries(presences)) {
      if (data.lastKnownPresence === 'composing') {
         console.log(`${jid} is typing in ${id}`)
      }
   }
})

conn.on('call', async calls => {
   for (const call of calls) {
      if (call.status === 'offer') {
         await conn.sock.rejectCall(call.id, call.from)
      }
   }
})
```

### Raw Events

All Baileys native events are forwarded with `baileys:` prefix. This gives you access to every event Baileys emits, even ones not covered by custom events:

```javascript
conn.on('baileys:connection.update', state => { ... })
conn.on('baileys:messaging-history.set', data => { ... })
conn.on('baileys:messaging-history.status', status => { ... })
conn.on('baileys:chats.upsert', chats => { ... })
conn.on('baileys:chats.update', updates => { ... })
conn.on('baileys:chats.delete', ids => { ... })
conn.on('baileys:chats.lock', data => { ... })
conn.on('baileys:contacts.upsert', contacts => { ... })
conn.on('baileys:contacts.update', updates => { ... })
conn.on('baileys:messages.upsert', data => { ... })
conn.on('baileys:messages.update', updates => { ... })
conn.on('baileys:messages.delete', data => { ... })
conn.on('baileys:messages.media-update', updates => { ... })
conn.on('baileys:messages.reaction', reactions => { ... })
conn.on('baileys:message-receipt.update', receipts => { ... })
conn.on('baileys:groups.upsert', groups => { ... })
conn.on('baileys:groups.update', updates => { ... })
conn.on('baileys:group-participants.update', update => { ... })
conn.on('baileys:group.join-request', request => { ... })
conn.on('baileys:group.member-tag.update', update => { ... })
conn.on('baileys:blocklist.set', data => { ... })
conn.on('baileys:blocklist.update', data => { ... })
conn.on('baileys:labels.edit', label => { ... })
conn.on('baileys:labels.association', data => { ... })
conn.on('baileys:newsletter.reaction', data => { ... })
conn.on('baileys:newsletter.view', data => { ... })
conn.on('baileys:newsletter-participants.update', data => { ... })
conn.on('baileys:newsletter-settings.update', data => { ... })
conn.on('baileys:message-capping.update', data => { ... })
conn.on('baileys:settings.update', data => { ... })
```

Events **not** forwarded as raw (managed internally):
- `connection.update` — handled by connection lifecycle
- `creds.update` — handled by session persistence
- `contacts.upsert` — handled by contact store

### Payload Details

#### `import` — Full Message Object

After serialization, `x.m` includes:

| Property | Type | Description |
|---|---|---|
| `m.id` | `string` | Unique message ID |
| `m.chat` | `string` | Chat JID |
| `m.sender` | `string` | Sender JID (resolved to PN) |
| `m.fromMe` | `boolean` | Sent by self |
| `m.isGroup` | `boolean` | Is group chat |
| `m.mtype` | `string` | Message type (e.g. `extendedTextMessage`, `imageMessage`) |
| `m.msg` | `object` | Message content (text, caption, media metadata) |
| `m.text` | `string` | Extracted text content |
| `m.mentionedJid` | `string[]` | Mentioned JIDs (resolved to PN) |
| `m.isMedia` | `boolean` | Has media attachment |
| `m.isBot` | `boolean` | Sent by bot |
| `m.device` | `string` | Sender device (`web`, `android`, `ios`, `desktop`) |
| `m.quoted` | `object` | Quoted/replied message (if any) |
| `m.quoted.sender` | `string` | Quoted sender (resolved to PN) |
| `m.quoted.mentionedJid` | `string[]` | Quoted mentions (resolved to PN) |
| `m.key` | `object` | Raw Baileys message key |
| `m.reply(text, opts?)` | `function` | Quick reply helper |
| `m.react(emoji, key?)` | `function` | Quick reaction helper |
| `m.download()` | `function` | Download media |

#### `group.*` — Group Events

```javascript
conn.on('group.add', {
   action: 'add',           // 'add' | 'remove' | 'promote' | 'demote'
   jid: '...@g.us',        // Group JID
   author: '...@s.whatsapp.net',  // Who performed the action (resolved)
   subject: 'Group Name',   // Group subject
   member: '...@s.whatsapp.net',  // Target member (resolved)
   groupMetadata: { ... }   // Full GroupMetadata object
})
```

#### `group.request`

```javascript
conn.on('group.request', {
   id: '...@g.us',
   author: '...@s.whatsapp.net',     // Admin who approved/rejected (null on 'created')
   participant: '...@s.whatsapp.net', // User who requested
   action: 'created',                 // 'created' | 'approved' | 'rejected'
   method: 'invite_link'              // Request method
})
```

---

## Plugin System

### Structure

```
plugins/
├── menu.js
├── group.js
├── owner/
│   ├── ban.js
│   └── eval.js
└── ...
```

### Plugin Format

Each plugin file exports an object:

```javascript
module.exports = {
   command: 'menu',
   alias: ['help', 'h'],
   category: 'main',
   description: 'Show bot menu',
   loading: true,
   async run(m, { sock, Func, config, db, plugins }) {
      // m — serialized message
      // sock — Baileys socket
      // Func — utility functions
      // config — environment config
      // db — global database
      // plugins — all loaded plugins
      m.reply('Hello from menu plugin!')
   }
}
```

### Plugin Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `command` | `string` | required | Command name (without prefix) |
| `alias` | `string[]` | `[]` | Alternative names |
| `category` | `string` | `'main'` | Grouping category |
| `description` | `string` | `''` | Help text |
| `loading` | `boolean` | `true` | Show typing indicator |
| `run` | `function` | required | Command handler |

### Event Plugins

```javascript
module.exports = {
   command: 'antilink',
   event: 'group.add',     // Listen to a custom event instead of commands
   async run(x, { sock, db }) {
      // x — event payload
      // Runs automatically when 'group.add' fires
   }
}
```

---

## Session Management

### File-Based Session (Default)

```javascript
const conn = new Connection({
   session_dir: './session'  // Multi-file auth state stored here
})
```

### Custom Session Provider

Pass an async object implementing the auth state interface:

```javascript
const { Connection } = require('@znan/wabot')
const customSession = {
   state: { creds: {}, keys: {} },
   saveCreds: () => {},
   deleteCreds: () => {},
   restoreCreds: async () => {},
}

const conn = new Connection({
   session_dir: customSession  // Custom session provider
})
```

### Auto-Backup & Restore

Module automatically:
- Backs up session when connected
- Detects session corruption on `badSession` disconnect
- Restores from backup if available
- Reconnects with restored session

### Session Cleanup

Auto-delete old session files (midnight cron):

```javascript
const conn = new Connection({
   session_dir: './session',
   // Auto-delete old data at midnight
})
```

---

## Database

The module supports multiple database backends via `Database.create()`:

### Supported Drivers

| Driver | Connection String |
|---|---|
| **MongoDB** | `mongodb://user:pass@host:port/db` |
| **MySQL** | `mysql://user:pass@host:port/db` |
| **PostgreSQL** | `postgresql://user:pass@host:port/db` |
| **SQLite** | File path (e.g. `./database.db`) |
| **JSON** | File path (e.g. `./database.json`) |

### Usage

```javascript
const { Connection, Database } = require('@znan/wabot')

const start = async () => {
   const db = Database.create(process.env.DATABASE_URL, {
      type: 'json',   // or 'mongodb', 'mysql', 'postgresql', 'sqlite'
      dir: './db'
   })

   const conn = new Connection({
      plugins_dir: 'plugins',
      session_dir: db.session || './session',
   })

   conn.on('connect', async () => {
      global.db = { users: {}, groups: {}, setting: {}, ...(await db.fetch() || {}) }
      await db.save(global.db)
   })

   // Auto-save every 30 seconds
   setInterval(() => {
      if (global.db) db.save(global.db)
   }, 30000)
}
```

---

## Migration Guide

### From v0.x to v1.x (Baileys v7 LID)

#### Breaking Changes

1. **Event name changes**

   | Old | New | Reason |
   |---|---|---|
   | `group-participants.update` | `group.add` / `.remove` / `.promote` / `.demote` | Split per action |
   | `groups.update` | `group.subject` / `.desc` / `.announce` / `.restrict` / `.memberAddMode` / `.joinApprovalMode` | Split per field |
   | — | `group.request` | New Baileys v7 event |
   | — | `poll` | New — poll decryption added |
   | — | `baileys:<event>` | Raw event forwarding (new) |

2. **`getRealJid` is now async**

   ```javascript
   // Old
   const jid = conn.getRealJid(lid)

   // New
   const jid = await conn.getRealJid(lid)
   ```

3. **`conn.user.lid`** — may be undefined in v7. Use `conn.user.id` instead.

4. **`getUserId`** — no longer returns `lid` field:

   ```javascript
   // Old
   const { jid, lid } = await conn.getUserId('62812...')

   // New
   const { jid } = await conn.getUserId('62812...')
   ```

5. **`onWhatsApp`** — no longer returns LID in results. Use `signalRepository.lidMapping.getPNForLID()` for reverse lookups.

#### What Changed Internally

- Custom XMPP node parsing for LID mapping (`CB:message` listener) removed — Baileys v7 handles this internally via `signalRepository.lidMapping`
- `lid_map` storage removed — mapping persisted in auth state automatically
- `lidMap` cache removed — group participant data already includes `phoneNumber`
- All sender/participant resolution uses Baileys built-in `Alt` fields + `getPNForLID()`

---

## Error Handling

### Disconnect Reasons

The module automatically handles all Baileys disconnect reasons:

| Reason | Behavior |
|---|---|
| `connectionClosed` | Auto-reconnect |
| `connectionLost` | Auto-reconnect |
| `connectionReplaced` | Exit (session active elsewhere) |
| `timedOut` | Auto-reconnect |
| `loggedOut` | Clear session, exit |
| `badSession` | Restore from backup, reconnect |
| `restartRequired` | Auto-reconnect |
| `multideviceMismatch` | Clear session, reconnect |
| `forbidden` (403) | Clear session, exit (banned) |

### Custom Error Handling

```javascript
conn.on('error', x => {
   console.error(x.message)
   // Log to file, send notification, etc.
})
```

### Session Corruption Recovery

When `badSession` is detected, the module:
1. Checks for session backup
2. Restores from backup if available
3. Clears corrupted session
4. Reconnects automatically

---

## Advanced Examples

### AI Bot Reply

```javascript
// Requires AI module integration
conn.on('import', async x => {
   if (!x.isCommand && !x.m.fromMe) {
      const reply = await generateAIResponse(x.m.text)
      x.m.reply(reply)
   }
})
```

### Anti-Delete

```javascript
conn.on('message.delete', x => {
   if (x && !x.msg.key.fromMe && !x.msg.isBot) {
      const groupSet = global.db.groups[x.jid]
      if (groupSet?.antidelete) {
         conn.sock.copyNForward(x.jid, x.msg)
      }
   }
})
```

### Auto-React to Stories

```javascript
conn.on('stories', x => {
   conn.sock.sendMessage('status@broadcast', {
      react: { text: '👍', key: x.key }
   }, { statusJidList: [x.sender] })
})
```

### Welcome Card with Canvas

```javascript
conn.on('group.add', async x => {
   const avatar = await conn.sock.profilePictureUrl(x.member, 'image')
   const card = await welcomeCard(avatar, x.member.split('@')[0], x.subject)
   conn.sock.sendFile(x.jid, card, 'welcome.jpg', `Welcome @${x.member.split('@')[0]}!`, null)
})
```

### AFK Detection via Presence

```javascript
conn.on('presence.update', ({ id, presences }) => {
   for (const [jid, data] of Object.entries(presences)) {
      if (data.lastKnownPresence === 'composing') {
         const groupSet = global.db.groups[id]
         const member = groupSet?.member?.[jid]
         if (member && member.afk > -1) {
            conn.sock.reply(id, `@${jid.split('@')[0]} back from AFK (${member.afkReason})`, null)
            member.afk = -1
         }
      }
   }
})
```

### Using Raw Events for Newsletter Tracking

```javascript
conn.on('baileys:newsletter.reaction', data => {
   console.log(`Newsletter ${data.id} got reaction:`, data.reaction)
})

conn.on('baileys:newsletter.view', data => {
   console.log(`Newsletter ${data.id} has ${data.count} views`)
})
```

---

## License

MIT
