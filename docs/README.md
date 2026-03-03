# NativeDB API Documentation

This document provides comprehensive documentation for all API endpoints in the NativeDB application.

## Base URL

```
https://veyvy.space/api
```

---

## Table of Contents

1. [Rockstar APIs](#rockstar-apis)
   - [Avatar Lookup](#avatar-lookup)
   - [Profile Lookup](#profile-lookup)
   - [Career Tracker](#career-tracker)
2. [Natives APIs](#natives-apis)
   - [Get All Games](#get-all-games)
   - [Get Game Natives](#get-game-natives)
3. [Bot APIs](#bot-apis)
   - [Commands](#commands)

---

## Rockstar APIs

### Avatar Lookup

Retrieve profile avatars from Rockstar Social Club IDs.

**Endpoint:** `/api/rockstar/avatar`

**Method:** `GET`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes* | Rockstar ID (numeric) or username |
| `username` | string | Yes* | Rockstar username |
| `name` | string | Yes* | Rockstar username (alias) |
| `rid` | string | Yes* | Rockstar ID (alias) |

*At least one parameter is required.

**Example Request:**

```bash
curl "https://veyvy.space/api/rockstar/avatar?id=248069453"

curl "https://veyvy.space/api/rockstar/avatar?username=XIFI_POS"
```

**Success Response (200):**

```json
{
  "success": true,
  "rid": "248069453",
  "username": "XIFI_POS",
  "legacy": {
    "primary": "https://prod.cloud.rockstargames.com/members/sc/6266/248069453/publish/gta5/mpchars/0.png",
    "secondary": "https://prod.cloud.rockstargames.com/members/sc/6266/248069453/publish/gta5/mpchars/1.png"
  },
  "enhanced": {
    "primary": "https://prod.cloud.rockstargames.com/members/sc/0807/248069453/publish/gta5/mpchars/0_pcrosalt.png",
    "secondary": null
  },
  "profileUrl": "https://socialclub.rockstargames.com/member/248069453"
}
```

**Error Response (400):**

```json
{
  "error": "Rockstar ID or username is required"
}
```

**Error Response (200 - Not Found):**

```json
{
  "success": false,
  "error": "User not found or RID not available",
  "rid": null,
  "username": null,
  "legacy": { "primary": null, "secondary": null },
  "enhanced": { "primary": null, "secondary": null }
}
```

---

### Profile Lookup

View detailed player profiles from Rockstar Social Club.

**Endpoint:** `/api/rockstar/profile`

**Method:** `GET`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes* | Rockstar ID (numeric) or username |
| `username` | string | Yes* | Rockstar username |

*At least one parameter is required.

**Example Request:**

```bash
curl "https://veyvy.space/api/rockstar/profile?id=248069453"

curl "https://veyvy.space/api/rockstar/profile?username=XIFI_POS"
```

**Success Response (200):**

```json
{
  "rid": "248069453",
  "username": "XIFI_POS",
  "profileUrl": "https://socialclub.rockstargames.com/member/248069453",
  "games": {
    "gta5": {
      "name": "GTA Online",
      "available": true
    },
    "rdr2": {
      "name": "Red Dead Online",
      "available": true
    }
  },
  "lastSeen": "2026-03-03T13:15:34.356Z",
  "social": {
    "rockstar": "https://socialclub.rockstargames.com/member/248069453"
  }
}
```

**Error Response (400):**

```json
{
  "error": "Rockstar ID or username is required"
}
```

**Error Response (404):**

```json
{
  "error": "Player not found"
}
```

---

### Career Tracker

Track GTA Online player progress, stats, and DLC completion.

**Endpoint:** `/api/rockstar/career`

**Method:** `GET`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Rockstar ID (numeric) |
| `dlcs` | string | No | Set to `true` to get DLC list only |

**Example Request:**

```bash
# Get full career data
curl "https://veyvy.space/api/rockstar/career?id=248069453"

# Get DLC list only
curl "https://veyvy.space/api/rockstar/career?dlcs=true"
```

**Success Response (200):**

```json
{
  "username": "Player_6953",
  "rockstarId": "248069453",
  "games": {
    "gta5": {
      "name": "GTA Online",
      "totalMoney": 2500000000,
      "totalTimePlayed": 1250,
      "level": 1350,
      "kdRatio": "2.45",
      "wins": 4523,
      "losses": 2100,
      "achievements": 78,
      "totalAchievements": 126,
      "dlcCompleted": [
        { "id": "heists", "name": "Heists", "color": "#FFD700", "completed": true, "progress": 100 },
        { "id": "doomsday", "name": "Doomsday Heist", "color": "#FF6B6B", "completed": true, "progress": 100 }
      ],
      "missions": { "completed": 1247, "inProgress": 5 },
      "properties": 12,
      "vehicles": 87
    },
    "rdr2": {
      "name": "Red Dead Online",
      "totalMoney": 250000,
      "totalTimePlayed": 500,
      "level": 150,
      "kdRatio": "1.25",
      "achievements": 45,
      "totalAchievements": 89
    }
  },
  "lastUpdated": "2026-03-03T13:00:00.000Z"
}
```

**Error Response (400):**

```json
{
  "error": "Rockstar ID is required"
}
```

**DLC List Response:**

```json
{
  "success": true,
  "data": { ... },
  "defaults": [
    { "id": "heists", "name": "Heists", "color": "#FFD700" },
    { "id": "doomsday", "name": "Doomsday Heist", "color": "#FF6B6B" }
  ]
}
```

---

## Natives APIs

### Get All Games

Retrieve a list of all games that have natives available.

**Endpoint:** `/api/natives`

**Method:** `GET`

**Example Request:**

```bash
curl "https://veyvy.space/api/natives"
```

**Success Response (200):**

```json
{
  "games": [
    {
      "game": "gta5",
      "gameName": "GTA V",
      "count": 3000,
      "namespaces": [
        { "name": "AUDIO", "count": 150 },
        { "name": "NETWORK", "count": 200 }
      ]
    },
    {
      "game": "rdr2",
      "gameName": "RDR 2",
      "count": 4500,
      "namespaces": [
        { "name": "AUDIO", "count": 180 },
        { "name": "NETWORK", "count": 250 }
      ]
    },
    {
      "game": "rdr",
      "gameName": "RDR",
      "count": 1200,
      "namespaces": [...]
    },
    {
      "game": "mp3",
      "gameName": "Max Payne 3",
      "count": 800,
      "namespaces": [...]
    },
    {
      "game": "gta4",
      "gameName": "GTA IV",
      "count": 2500,
      "namespaces": [...]
    }
  ],
  "total": 5
}
```

**Supported Games:**

| Game ID | Game Name | Data Type |
|---------|-----------|-----------|
| `gta5` | GTA V | JSON |
| `rdr2` | RDR 2 | JSON |
| `rdr` | Red Dead Redemption | Header (Native DB) |
| `mp3` | Max Payne 3 | Header |
| `gta4` | GTA IV | Header |

---

### Get Game Natives

Retrieve natives for a specific game.

**Endpoint:** `/api/natives`

**Method:** `GET`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `game` | string | Yes | Game ID (e.g., `gta5`, `rdr2`) |
| `namespace` | string | No | Filter by namespace |
| `hash` | string | No | Filter by native hash |
| `search` | string | No | Search by native name or description |
| `random` | string | No | Get random native(s). Use number or `true` for 1 |
| `namespaces` | string | No | Set to `true` to get only namespaces list |
| `limit` | string | No | Number of results to return (default: 100) |
| `offset` | string | No | Offset for pagination (default: 0) |
| `refresh` | string | No | Set to `true` to bypass cache |

**Example Request:**

```bash
# Get all natives for GTA V
curl "https://veyvy.space/api/natives?game=gta5"

# Get natives by namespace
curl "https://veyvy.space/api/natives?game=gta5&namespace=NETWORK"

# Get native by hash
curl "https://veyvy.space/api/natives?game=gta5&hash=0x5064656e"

# Search natives
curl "https://veyvy.space/api/natives?game=gta5&search=PLAYER"

# Get random native
curl "https://veyvy.space/api/natives?game=gta5&random=true"

# Get 5 random natives
curl "https://veyvy.space/api/natives?game=gta5&random=5"

# Get namespaces list only
curl "https://veyvy.space/api/natives?game=gta5&namespaces=true"

# Paginated results
curl "https://veyvy.space/api/natives?game=gta5&limit=50&offset=0"

# Bypass cache
curl "https://veyvy.space/api/natives?game=gta5&refresh=true"
```

**Success Response (200):**

```json
{
  "game": "gta5",
  "gameName": "GTA V",
  "count": 50,
  "total": 3000,
  "offset": 0,
  "limit": 100,
  "namespaces": [
    { "name": "NETWORK", "count": 50 }
  ],
  "natives": {
    "NETWORK": {
      "0x5064656e": {
        "name": "NETWORK_CAN_REGISTER_MISSION_FOR_AUDIO",
        "hash": "0x5064656e",
        "params": [...],
        "returnType": "BOOL"
      }
    }
  }
}
```

**Random Native Response:**

```json
{
  "game": "gta5",
  "gameName": "GTA V",
  "count": 3,
  "natives": [
    {
      "namespace": "PLAYER",
      "hash": "0x12345678",
      "name": "PLAYER_GET_ID",
      "returnType": "PLAYER"
    }
  ]
}
```

**Namespaces List Response:**

```json
{
  "game": "gta5",
  "gameName": "GTA V",
  "namespaces": [
    { "name": "AUDIO", "count": 150 },
    { "name": "NETWORK", "count": 200 }
  ]
}
```

**Error Response (404):**

```json
{
  "error": "Game not found or does not have natives"
}
```

---

## Bot APIs

### Commands

Get all Discord bot commands with descriptions and usage.

**Endpoint:** `/api/bot/commands`

**Method:** `GET`

**Authentication:** Requires `DISCORD_BOT_TOKEN` environment variable.

**Example Request:**

```bash
curl "https://veyvy.space/api/bot/commands"
```

**Success Response (200):**

```json
[
  {
    "id": "general",
    "category": "General",
    "items": [
      {
        "name": "/info",
        "description": "Get bot information",
        "usage": "/info"
      }
    ]
  },
  {
    "id": "natives",
    "category": "Natives",
    "items": [
      {
        "name": "/native-namespace",
        "description": "Get natives by namespace",
        "usage": "/native-namespace <namespace>"
      },
      {
        "name": "/native-random",
        "description": "Get a random native",
        "usage": "/native-random"
      }
    ]
  }
]
```

**Error Response (500):**

```json
{
  "error": "Bot token not set"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing required parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Rate Limits

- No rate limits are currently enforced
- External APIs (sc-cache.com, Rockstar CDN) may have their own limits

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_BOT_TOKEN` | For bot commands | Discord bot authentication token |

---

## External APIs Used

- **sc-cache.com** - Rockstar Social Club username/RID lookup
- **prod.cloud.rockstargames.com** - Avatar image hosting
- **media-rockstargames-com.akamaized.net** - DLC data
- **discord.com** - Discord API for bot commands
