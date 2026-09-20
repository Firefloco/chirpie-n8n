import type { INodeProperties } from 'n8n-workflow';

/**
 * Splits a comma-separated list of URLs typed by the user into the string array
 * the Chirpie API expects for `media_urls`.
 */
export const mediaUrlsExpression =
	'={{ ($value ?? "").split(",").map((url) => url.trim()).filter((url) => url !== "") }}';

/**
 * The Chirpie API only accepts UTC ISO 8601 timestamps (`...Z`). n8n's dateTime
 * parameters carry an explicit offset instead (`2026-04-01T14:00:00+02:00`), and
 * expressions that produce a Luxon DateTime serialise the same way, so normalise
 * to UTC before sending or every scheduled post would come back a 400.
 */
export const scheduleAtExpression =
	'={{ $value ? DateTime.fromISO($value.toString()).toUTC().toISO() : undefined }}';

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
