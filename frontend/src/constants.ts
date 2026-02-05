export const PROGRAM_ID = "H4NT2729csGPRYkaCobwD6K5yiWJYzKj18NYQ926qwKK";
export const NETWORK = "devnet";
export const RPC_URL = "https://api.devnet.solana.com";

export const IDL = {
  "version": "0.1.0",
  "name": "agenttask",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        { "name": "marketplace", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "register",
      "accounts": [
        { "name": "agent", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [{ "name": "name", "type": "string" }]
    },
    {
      "name": "post",
      "accounts": [
        { "name": "marketplace", "isMut": true, "isSigner": false },
        { "name": "task", "isMut": true, "isSigner": false },
        { "name": "poster", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "title", "type": "string" },
        { "name": "budget", "type": "u64" }
      ]
    }
  ],
  "accounts": {
    "Marketplace": {
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "authority", "type": "publicKey" },
          { "name": "taskCount", "type": "u64" }
        ]
      }
    },
    "Agent": {
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "type": "publicKey" },
          { "name": "name", "type": "string" }
        ]
      }
    },
    "Task": {
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "id", "type": "u64" },
          { "name": "poster", "type": "publicKey" },
          { "name": "title", "type": "string" },
          { "name": "budget", "type": "u64" }
        ]
      }
    }
  }
};
