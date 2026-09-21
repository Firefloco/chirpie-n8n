import type { INodeProperties } from 'n8n-workflow';
import {
	accountIdField,
	draftField,
	facebookLinkField,
	firstCommentField,
	idempotencyKeyField,
	instagramCollaboratorsField,
	sendIdempotencyKey,
	scheduleAtField,
	timezoneField,
	unwrapDataOutput,
} from '../shared/descriptions';

const showOnlyForThreads = {
	resource: ['thread'],
};

const showOnlyForThreadCreate = {
	...showOnlyForThreads,
	operation: ['create'],
};

/**
 * Maps the fixed collection the editor produces onto the `posts` array the
 * Chirpie API expects, splitting the comma-separated media URLs per post.
 */
const threadPostsExpression = [
	'={{ ($value.post ?? []).map((entry) => {',
	'const urls = (entry.mediaUrls ?? "").split(",").map((url) => url.trim()).filter((url) => url !== "");',
	'return urls.length > 0 ? { text: entry.text, media_urls: urls } : { text: entry.text };',
	'}) }}',
].join(' ');

export const threadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForThreads,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a thread',
				description: 'Publish a multi-post thread now, or schedule it for later',
				routing: {
					request: {
						method: 'POST',
						url: '/threads',
					},
					send: {
						preSend: [sendIdempotencyKey],
					},
					output: unwrapDataOutput,
				},
			},
		],
		default: 'create',
	},
	{
		...accountIdField,
		displayOptions: {
			show: showOnlyForThreadCreate,
		},
	},
	{
		displayName: 'Posts',
		name: 'posts',
		type: 'fixedCollection',
		placeholder: 'Add post',
		typeOptions: {
			multipleValues: true,
			sortable: true,
			// The API rejects threads outside 2-25 posts; enforce it in the editor
			// so the workflow fails validation instead of round-tripping a 400.
			minRequiredFields: 2,
			maxAllowedFields: 25,
		},
		default: {},
		displayOptions: {
			show: showOnlyForThreadCreate,
		},
		description:
			'Between 2 and 25 posts, published in order. On platforms with native threading each post replies to the one before it.',
		options: [
			{
				displayName: 'Post',
				name: 'post',
				values: [
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						required: true,
						description: 'Content of this post in the thread',
					},
					{
						displayName: 'Media URLs',
						name: 'mediaUrls',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/one.png, https://example.com/two.png',
						description:
							'Comma-separated list of public image or video URLs to attach to this post',
					},
				],
			},
		],
		routing: {
			send: {
				type: 'body',
				property: 'posts',
				value: threadPostsExpression,
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: showOnlyForThreadCreate,
		},
		// A thread publishes to the feed, so it carries the options a feed post
		// carries and no placement field: an Instagram story or reel, and a
		// Facebook Page story, are each a single post, and a thread asking for
		// one of those placements is refused.
		options: [
			draftField,
			facebookLinkField,
			firstCommentField,
			idempotencyKeyField,
			instagramCollaboratorsField,
			scheduleAtField,
			timezoneField,
		],
	},
];
