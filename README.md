# @chirpie/n8n-nodes-chirpie

An [n8n](https://n8n.io) community node for [Chirpie](https://chirpie.ai): one node that posts to every account you have connected, with scheduling, threads, drafts, and analytics. X/Twitter, Bluesky, LinkedIn, Mastodon and Telegram connect today; Threads, Instagram, Facebook and more are coming soon.

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

n8n Cloud only allows installing community nodes that n8n has verified. This node isn't verified yet. Once it is, it will be installable straight from the nodes panel on Cloud, with no npm step. Until then, use a self-hosted instance.

## Credentials

1. Create an API key at [chirpie.ai/dashboard/keys](https://chirpie.ai/dashboard/keys). Keys start with `chirpie_sk_`.
2. In n8n, add a new **Chirpie API** credential and paste the key.
3. Leave **Base URL** at `https://chirpie.ai`.
4. Select **Test**. The credential calls `GET /api/v1/accounts` and confirms the key works.

Connect your social accounts once at [chirpie.ai/dashboard/accounts](https://chirpie.ai/dashboard/accounts); the node uses whatever is connected there.

## Operations

| Resource | Operation | What it does |
|---|---|---|
| Media | Upload | Upload an image or video from the item's binary data, and get the ID a post can attach. **Options → Idempotency Key** makes a retried item safe |
| Post | Create | Publish a post immediately, or schedule it with **Schedule At**, to one account or to several at once. **Options → First Comment** publishes a comment under the post as soon as it goes out, **Options → Instagram Placement** and **Options → Facebook Placement** publish it as a story or a reel instead of a feed post, **Options → Timezone** reads a **Schedule At** with no offset in an IANA zone such as `America/New_York`, and **Options → Idempotency Key** stops a retried item publishing twice |
| Post | Get | Fetch a single post by ID |
| Post | Get Many | List posts, filtered by status, account, or group, with pagination. Turn on **Include Hidden** for the ones you hid |
| Post | Update | Edit a post that has not published yet, or finish a draft and schedule it |
| Post | Publish | Send a saved draft now, checking it in full and charging it as a post |
| Post | Retry First Comment | Post a first comment that failed, again. It re-sends the text the post already carries |
| Post | Delete | Take a post down from the social platform. Chirpie keeps it, marked deleted. A published TikTok post cannot be deleted, and nor can an Instagram post on an account connected by signing in with Instagram rather than through a Facebook Page; both refuse with `delete_unsupported` |
| Post | Hide | Hide a post from your Chirpie listings. Nothing reaches the social platform |
| Post | Unhide | Put a hidden post back in your listings |
| Thread | Create | Publish a 2–25 post thread, immediately or scheduled, with an optional **First Comment** published under its last part. A thread is atomic: if any part fails, the parts already published are deleted and the quota refunded. A thread publishes to the feed, so it takes the feed options (**Instagram Collaborators**, **Facebook Link**) and no placement. **Timezone** and **Idempotency Key** work as they do on a post |
| Account | Get Many | List the social accounts connected to your Chirpie workspace |
| Analytic | Get | Fetch engagement metrics for a published post. **Options → Refresh** asks the platform now instead of reading the stored snapshot, allowed once per post every 30 minutes |

**Post → Create** takes an **Account ID** (from Account → Get Many), the **Text**, and optionally **Media IDs** (from Media → Upload), **Media URLs** (a comma-separated list of public image or video URLs) and **Schedule At**. Use Media IDs or Media URLs, not both.

**Schedule At** accepts any n8n datetime. A value carrying an offset, which is what the date picker and `$now` both produce, is converted to UTC before sending. A value with no offset is sent exactly as written and read by Chirpie in **Options → Timezone**, or in the timezone saved on the account, with daylight saving worked out for the date you named. Set **Options → Idempotency Key** from something stable across a retry of the same item, such as the execution ID plus the item index, and a retried item replays the first answer for 24 hours rather than publishing again.

To publish the same post to several accounts in one call, leave **Account ID** empty and fill **Account IDs** instead: a comma-separated list of up to 25 account IDs. The output item is then a `group_id` plus one `results` entry per account, in the order they were named, so an account the platform refused is reported there while the others stay published. Pass that `group_id` to **Post → Get Many**'s **Group ID** filter to read the whole group back.

**Options → Draft** on **Post → Create** and **Thread → Create** saves the content without sending it: nothing reaches the platform and nothing counts against your monthly quota. Find what is waiting with **Post → Get Many** and a **Status** of `draft`, then send it with **Post → Publish**, or queue it with **Post → Update** and a **Schedule At**. Switch **Update Fields → Draft** on as well to change only the time a draft remembers. Everything a create checks is checked at that point, so a draft that would be refused stays a draft, untouched.

**Media → Upload** reads the file from the item's binary data, so a file that arrived from an earlier node can be attached without ever having a public URL. The file type is read from the file itself, so a wrong extension does not matter.

**Thread → Create** takes an **Account ID** and a list of posts, each with its own text and optional media, given as Media URLs or as Media IDs from **Media -> Upload**. On X, Bluesky, Threads, Mastodon, and Telegram each post replies to the one before it; on platforms without native threading each is published standalone.

Every operation returns the unwrapped Chirpie response, so `id`, `status`, `platform_post_id`, and the rest are available directly on the output item.

## Example workflow

[`examples/ai-agent-social-posting.json`](examples/ai-agent-social-posting.json) wires a chat-triggered AI Agent to two Chirpie tool nodes: one that lists connected accounts and one that publishes. Ask it "post 'shipping today' to my X account" and it looks up the account ID and posts.

Import it with **Workflows → Import from File**, then set your OpenAI and Chirpie credentials on the nodes.

## Compatibility

Requires n8n 1.x or later with community nodes enabled, and Node.js 22 or later. The package has no runtime dependencies: it talks to the Chirpie REST API through n8n's built-in HTTP helper.

## Development

```bash
npm install
npm run dev      # boots a local n8n with this node loaded, hot reload
npm run build
npm run lint
```

`dev` starts n8n at <http://localhost:5678> with the node already installed, so you can drag it onto a canvas and run it against a real API key. It needs Node.js 22 or later.

Each release is published to npm by GitHub Actions with an [npm provenance](https://docs.npmjs.com/generating-provenance-statements) statement, so every version on npm links back to the commit and workflow run that built it.

## Resources

- [Chirpie n8n documentation](https://chirpie.ai/docs/n8n)
- [Chirpie API reference](https://chirpie.ai/docs/api/posts)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE.md)

---

> This repository is an automatically maintained source mirror of `packages/n8n-nodes-chirpie` in the Chirpie monorepo. Pull requests opened here cannot be merged. The npm package `@chirpie/n8n-nodes-chirpie` is published from this repository, so its npm provenance statement points at a public source.
