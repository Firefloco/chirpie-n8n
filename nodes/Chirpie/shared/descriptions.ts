import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Splits a comma-separated list of URLs typed by the user into the string array
 * the Chirpie API expects for `media_urls`.
 */
export const mediaUrlsExpression =
	'={{ ($value ?? "").split(",").map((url) => url.trim()).filter((url) => url !== "") }}';

/**
 * How a Schedule At value reaches the API.
 *
 * n8n's own date picker always produces a timestamp carrying an offset, and
 * that is normalized to UTC here so a workflow's own timezone is handled for
 * the user. A value with **no** offset is passed through untouched, because
 * converting it would resolve it in whatever zone the n8n runtime happens to
 * be in, silently and invisibly: the server resolves it instead, in the
 * Timezone option or the zone saved on the account, which is the whole point
 * of sending a wall time rather than an instant. Without this the Timezone
 * option could never apply to anything.
 *
 * Only a value with a time on it and no offset after it is passed through:
 * the offset test covers `Z`, `+02:00`, `+0200` and the hour-only `+02`, and
 * requiring the time first is what keeps a date on its own (`2026-04-01`) on
 * the converting path, where it has always been. Its trailing `-01` would
 * otherwise read as an hour-only offset, and the API takes no date without a
 * time.
 */
export const scheduleAtExpression =
	'={{ $value ? (/T\\d/.test($value.toString()) && !/(Z|[+-]\\d{2}(:?\\d{2})?)$/.test($value.toString()) ? $value.toString() : DateTime.fromISO($value.toString()).toUTC().toISO()) : undefined }}';

/** Unwraps the `{ "data": ... }` envelope every Chirpie endpoint returns. */
export const unwrapDataOutput = {
	postReceive: [
		{
			type: 'rootProperty' as const,
			properties: {
				property: 'data',
			},
		},
	],
};

export const accountIdField: INodeProperties = {
	displayName: 'Account ID',
	name: 'accountId',
	type: 'string',
	default: '',
	required: true,
	placeholder: '550e8400-e29b-41d4-a716-446655440000',
	description:
		'ID of the connected social account to publish through. Use the Account -> Get Many operation to list them.',
	routing: {
		send: {
			type: 'body',
			property: 'account_id',
		},
	},
};

/**
 * Splits the comma-separated Account IDs into the `account_ids` array, and
 * sends nothing at all when the field is empty.
 *
 * An empty array would still be a fan-out, and the API refuses one naming no
 * accounts, so an untouched field has to drop out of the body entirely.
 */
export const accountIdsExpression =
	'={{ (($value ?? "").split(",").map((id) => id.trim()).filter((id) => id !== "")).length ? ($value ?? "").split(",").map((id) => id.trim()).filter((id) => id !== "") : undefined }}';

/**
 * Account ID, for the operations that can also address several accounts.
 *
 * Both spellings cannot travel together, so this one steps aside as soon as
 * Account IDs carries anything. An empty field sends nothing rather than an
 * empty string, so a workflow that filled in neither is told the account is
 * missing instead of being told the empty string is not a UUID.
 */
export const singleOrMultiAccountIdField: INodeProperties = {
	...accountIdField,
	required: false,
	description:
		'ID of the connected social account to publish through. Leave it empty and fill Account IDs instead to publish to several accounts at once.',
	routing: {
		send: {
			type: 'body',
			property: 'account_id',
			value: '={{ ((($parameter.accountIds ?? "").trim() !== "") || ($value ?? "").trim() === "") ? undefined : $value }}',
		},
	},
};

export const accountIdsField: INodeProperties = {
	displayName: 'Account IDs',
	name: 'accountIds',
	type: 'string',
	default: '',
	placeholder: '550e8400-e29b-41d4-a716-446655440000, 7c9e6679-7425-40de-944b-e07fc1f90ae7',
	description:
		'Comma-separated list of connected account IDs to publish the same content to, up to 25. Fill this instead of Account ID. The response is then a group ID plus one result per account, so an account the platform refused is reported there while the others stay published.',
	routing: {
		send: {
			type: 'body',
			property: 'account_ids',
			value: accountIdsExpression,
		},
	},
};

/**
 * Turns a comma-separated list of upload IDs into the `media_ids` array.
 */
export const mediaIdsExpression =
	'={{ ($value ?? "").split(",").map((id) => id.trim()).filter((id) => id !== "") }}';

export const mediaIdsField: INodeProperties = {
	displayName: 'Media IDs',
	name: 'mediaIds',
	type: 'string',
	default: '',
	placeholder: '550e8400-e29b-41d4-a716-446655440000',
	description:
		'Comma-separated list of IDs from the Media -> Upload operation. Use this or Media URLs, not both. IDs are valid for 7 days.',
	routing: {
		send: {
			type: 'body',
			property: 'media_ids',
			value: mediaIdsExpression,
		},
	},
};

/**
 * The comment published under a post the moment it goes out.
 *
 * Four platforms take one (X, Threads, Instagram, Facebook). Anywhere else the
 * API refuses the request outright rather than dropping the comment, so the
 * description says which, and there is no silent success to be surprised by.
 */
export const firstCommentField: INodeProperties = {
	displayName: 'First Comment',
	name: 'firstComment',
	type: 'string',
	typeOptions: {
		rows: 2,
	},
	default: '',
	description:
		'A comment to publish under the post as soon as it goes out, the link-in-the-first-comment pattern. X, Threads, Instagram and Facebook only: anywhere else the request is refused rather than the comment dropped. It counts as one post against your monthly quota.',
	routing: {
		send: {
			type: 'body',
			property: 'first_comment',
		},
	},
};

export const mediaUrlsField: INodeProperties = {
	displayName: 'Media URLs',
	name: 'mediaUrls',
	type: 'string',
	default: '',
	placeholder: 'https://example.com/one.png, https://example.com/two.png',
	description:
		'Comma-separated list of public image or video URLs to attach. Limits vary by platform.',
	routing: {
		send: {
			type: 'body',
			property: 'media_urls',
			value: mediaUrlsExpression,
		},
	},
};

export const draftField: INodeProperties = {
	displayName: 'Draft',
	name: 'draft',
	type: 'boolean',
	default: false,
	description:
		'Whether to save the content without sending it. Nothing reaches the platform, nothing counts against the monthly quota, and the response lists anything that would stop it publishing.',
	routing: {
		send: {
			type: 'body',
			property: 'draft',
			// Sent only when it is on: a false flag is the same request as no
			// flag at all, and leaving it out keeps the body clean.
			value: '={{ $value ? true : undefined }}',
		},
	},
};

export const keepDraftField: INodeProperties = {
	displayName: 'Keep Draft',
	name: 'draft',
	type: 'boolean',
	default: false,
	description:
		'Whether to leave a draft as a draft. Without it, giving a draft a Schedule At time queues it to publish. Only meaningful on a post that is already a draft.',
	routing: {
		send: {
			type: 'body',
			property: 'draft',
			value: '={{ $value ? true : undefined }}',
		},
	},
};

/**
 * The IANA timezone a naive `schedule_at` is read in.
 *
 * n8n's own date picker always carries an offset, so a picked Schedule At
 * never needs this. It is for a workflow that builds the timestamp itself, as
 * an expression producing a local wall time, which is the form that survives a
 * daylight-saving change: `scheduleAtExpression` passes such a value through
 * untouched so this zone is what resolves it.
 */
export const timezoneField: INodeProperties = {
	displayName: 'Timezone',
	name: 'timezone',
	type: 'string',
	default: '',
	placeholder: 'America/New_York',
	description:
		'IANA timezone a Schedule At with no offset is read in. Ignored when the time already carries one. Leave it empty to use the timezone saved on the Chirpie account.',
	routing: {
		send: {
			type: 'body',
			property: 'timezone',
			// Dropped rather than sent as an empty string when the option was
			// added and then left blank. The API validates the field whether or
			// not it is used, so `""` would fail the whole step.
			value: '={{ $value || undefined }}',
		},
	},
};

/**
 * A caller-chosen key that makes retrying the same request safe.
 *
 * It travels as a header, and declarative `routing.send` writes only the body
 * or the query string, so this field carries no routing of its own: each
 * operation that offers it attaches the header in a `preSend`, through
 * `sendIdempotencyKey` below.
 */
export const idempotencyKeyField: INodeProperties = {
	displayName: 'Idempotency Key',
	name: 'idempotencyKey',
	type: 'string',
	default: '',
	placeholder: 'order-4821-post',
	description:
		'A key of your own making that makes retrying this step safe. The same key with the same request replays the first answer for 24 hours instead of sending it again.',
};

/**
 * Put the `Idempotency-Key` header on a request, when the option carries one.
 *
 * A `preSend` hook rather than an expression on `request.headers`, because an
 * expression that resolves to nothing is not reliably dropped: a header sent
 * as an empty string, or as the literal "undefined", is worse than no header
 * at all now that the API refuses an unusable key with `400
 * idempotency_key_invalid`. Reading the parameter here makes "absent" really
 * absent.
 */
export async function sendIdempotencyKey(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const options = this.getNodeParameter('options', {}) as {
		idempotencyKey?: string;
	};
	const key = options?.idempotencyKey?.trim();
	if (!key) return requestOptions;

	return {
		...requestOptions,
		headers: { ...requestOptions.headers, 'Idempotency-Key': key },
	};
}

export const scheduleAtField: INodeProperties = {
	displayName: 'Schedule At',
	name: 'scheduleAt',
	type: 'dateTime',
	default: '',
	description:
		'Publish at this future time instead of immediately. Scheduled content goes out within about five minutes of this time.',
	routing: {
		send: {
			type: 'body',
			property: 'schedule_at',
			value: scheduleAtExpression,
		},
	},
};
