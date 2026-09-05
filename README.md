# @chirpie/n8n-nodes-chirpie

An [n8n](https://n8n.io) community node for [Chirpie](https://chirpie.ai) — one node that posts to X/Twitter, Bluesky, LinkedIn, Threads, Mastodon, Instagram, Facebook, and Telegram, with scheduling, threads, and analytics. More platforms coming soon.

The node is available to n8n AI Agents as a tool, so an agent can list your connected accounts and publish on its own.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Example workflow](#example-workflow) · [Resources](#resources)

## Installation

### Self-hosted (GUI)

1. Go to **Settings → Community Nodes**.
2. Select **Install**.
3. Enter `@chirpie/n8n-nodes-chirpie`.
4. Agree to the risks of using community nodes and select **Install**.

### Self-hosted (manual)

```bash
cd ~/.n8n/nodes
npm install @chirpie/n8n-nodes-chirpie
```

Restart n8n. "Chirpie" then appears in the nodes panel.

### n8n Cloud

n8n Cloud only allows installing community nodes that n8n has verified. This node isn't verified yet — once it is, it will be installable straight from the nodes panel on Cloud, with no npm step. Until then, use a self-hosted instance.

## Credentials

1. Create an API key at [chirpie.ai/dashboard/keys](https://chirpie.ai/dashboard/keys). Keys start with `chirpie_sk_`.
2. In n8n, add a new **Chirpie API** credential and paste the key.
3. Leave **Base URL** at `https://chirpie.ai`.
4. Select **Test** — the credential calls `GET /api/v1/accounts` and confirms the key works.

Connect your social accounts once at [chirpie.ai/dashboard/accounts](https://chirpie.ai/dashboard/accounts); the node uses whatever is connected there.

## Operations

| Resource | Operation | What it does |
|---|---|---|
| Post | Create | Publish a post immediately, or schedule it with **Schedule At** |
| Post | Get | Fetch a single post by ID |
| Post | Get Many | List posts, filtered by status or account, with pagination |
| Post | Delete | Delete a post from Chirpie and from the social platform |
| Thread | Create | Publish a 2–25 post thread, immediately or scheduled |
| Account | Get Many | List the social accounts connected to your Chirpie workspace |
| Analytic | Get | Fetch engagement metrics for a published post |

**Post → Create** takes an **Account ID** (from Account → Get Many), the **Text**, and optionally **Media URLs** (a comma-separated list of public image or video URLs) and **Schedule At**.

**Thread → Create** takes an **Account ID** and a list of posts, each with its own text and optional media URLs. On X, Bluesky, Threads, Mastodon, and Telegram each post replies to the one before it; on platforms without native threading each is published standalone.

Every operation returns the unwrapped Chirpie response, so `id`, `status`, `platform_post_id`, and the rest are available directly on the output item.

## Example workflow

[`examples/ai-agent-social-posting.json`](examples/ai-agent-social-posting.json) wires a chat-triggered AI Agent to two Chirpie tool nodes: one that lists connected accounts and one that publishes. Ask it "post 'shipping today' to my X account" and it looks up the account ID and posts.

Import it with **Workflows → Import from File**, then set your OpenAI and Chirpie credentials on the nodes.

## Compatibility

Requires n8n 1.x or later with community nodes enabled, and Node.js 22 or later. The package has no runtime dependencies — it talks to the Chirpie REST API through n8n's built-in HTTP helper.

## Development

```bash
pnpm install
pnpm --filter @chirpie/n8n-nodes-chirpie dev     # boots a local n8n with this node loaded, hot reload
pnpm --filter @chirpie/n8n-nodes-chirpie build
pnpm --filter @chirpie/n8n-nodes-chirpie lint
```

`dev` starts n8n at <http://localhost:5678> with the node already installed, so you can drag it onto a canvas and run it against a real API key.

## Resources

- [Chirpie n8n documentation](https://chirpie.ai/docs/n8n)
- [Chirpie API reference](https://chirpie.ai/docs/api/posts)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE.md)

---

> This repository is an automatically maintained source mirror of `packages/n8n-nodes-chirpie` in the Chirpie monorepo. Pull requests opened here cannot be merged. The npm package `@chirpie/n8n-nodes-chirpie` is published from this repository, so its npm provenance statement points at a public source.
