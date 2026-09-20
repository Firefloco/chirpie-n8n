import type { INodeProperties } from 'n8n-workflow';
import {
	accountIdsField,
	draftField,
	firstCommentField,
	keepDraftField,
	mediaIdsField,
	mediaUrlsField,
	scheduleAtField,
	singleOrMultiAccountIdField,
	unwrapDataOutput,
} from '../shared/descriptions';

const showOnlyForPosts = {
	resource: ['post'],
};

const showOnlyForPostCreate = {
	...showOnlyForPosts,
	operation: ['create'],
};

const showOnlyForPostUpdate = {
	...showOnlyForPosts,
	operation: ['update'],
};

const showOnlyForPostGetMany = {
	...showOnlyForPosts,
	operation: ['getAll'],
};

const showOnlyForPostPublish = {
	...showOnlyForPosts,
	operation: ['publish'],
};

const updateTextField: INodeProperties = {
	displayName: 'Text',
	name: 'text',
	type: 'string',
	typeOptions: {
		rows: 4,
	},
	default: '',
	description:
		'Replacement content for the post. The maximum length depends on the platform the account belongs to.',
	routing: {
		send: {
			type: 'body',
			property: 'text',
		},
	},
};

export const postDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPosts,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a post',
				description: 'Publish a post now, or schedule it for later',
				routing: {
					request: {
						method: 'POST',
						url: '/posts',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a post',
				description:
					'Take a post down from the social platform. Chirpie keeps the post, marked deleted. Instagram and TikTok offer no delete API and refuse with delete_unsupported.',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/posts/{{$parameter.postId}}',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Retry First Comment',
				value: 'retryFirstComment',
				action: 'Retry a first comment',
				description:
					'Post a first comment that failed, again. It re-sends the text the post already carries, so change that with Update first if it needs changing.',
				routing: {
					request: {
						method: 'POST',
						url: '=/posts/{{$parameter.postId}}/first-comment',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Hide',
				value: 'hide',
				action: 'Hide a post',
				description:
					'Hide a post from your Chirpie listings. Nothing reaches the social platform and Unhide puts it back.',
				routing: {
					request: {
						method: 'POST',
						url: '=/posts/{{$parameter.postId}}/hide',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a post',
				description: 'Retrieve a single post by its ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/posts/{{$parameter.postId}}',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many posts',
				description: 'Retrieve many posts, optionally filtered by status or account',
				routing: {
					request: {
						method: 'GET',
						url: '/posts',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Publish',
				value: 'publish',
				action: 'Publish a draft',
				description: 'Send a saved draft now, checking it in full and charging it as a post',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/posts/{{$parameter.postId}}',
						body: {
							publish: true,
						},
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Unhide',
				value: 'unhide',
				action: 'Unhide a post',
				description:
					'Put a hidden post back in your Chirpie listings. Nothing reaches the social platform.',
				routing: {
					request: {
						method: 'POST',
						url: '=/posts/{{$parameter.postId}}/unhide',
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a post',
				description:
					'Edit a post that has not published yet, or move it to a new time',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/posts/{{$parameter.postId}}',
					},
					output: unwrapDataOutput,
				},
			},
		],
		default: 'create',
	},

	// ----------------------------------
	//             post: create
	// ----------------------------------
	{
		...singleOrMultiAccountIdField,
		displayOptions: {
			show: showOnlyForPostCreate,
		},
	},
	{
		...accountIdsField,
		displayOptions: {
			show: showOnlyForPostCreate,
		},
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForPostCreate,
		},
		description:
			'Content of the post. The maximum length depends on the platform the account belongs to.',
		routing: {
			send: {
				type: 'body',
				property: 'text',
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
			show: showOnlyForPostCreate,
		},
		options: [
			draftField,
			firstCommentField,
			mediaIdsField,
			mediaUrlsField,
			scheduleAtField,
		],
	},

	// ----------------------------------
	//             post: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: {
			show: showOnlyForPostUpdate,
		},
		// Everything is optional and only what is added is sent. In particular,
		// leaving Schedule At out keeps the time a queued post already has. On
		// a draft, Schedule At queues it unless Keep Draft is turned on: the
		// flag means the opposite of the one on Create, so it has its own name.
		options: [
			firstCommentField,
			keepDraftField,
			mediaIdsField,
			mediaUrlsField,
			scheduleAtField,
			updateTextField,
		],
	},

	// ----------------------------------
	//  post: get / update / delete / hide / unhide
	// ----------------------------------
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
		displayOptions: {
			show: {
				...showOnlyForPosts,
				operation: [
					'get',
					'update',
					'delete',
					'publish',
					'hide',
					'unhide',
					'retryFirstComment',
				],
			},
		},
		description: 'ID of the post, as returned when it was created',
	},

	// ----------------------------------
	//            post: publish
	// ----------------------------------
	{
		displayName: 'Publish Fields',
		name: 'publishFields',
		type: 'collection',
		placeholder: 'Add field',
		default: {},
		displayOptions: {
			show: showOnlyForPostPublish,
		},
		options: [updateTextField],
	},

	// ----------------------------------
	//            post: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForPostGetMany,
		},
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
			},
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter: 'limit',
						offsetParameter: 'offset',
						pageSize: 100,
						type: 'query',
						rootProperty: 'data',
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				...showOnlyForPostGetMany,
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add filter',
		default: {},
		displayOptions: {
			show: showOnlyForPostGetMany,
		},
		options: [
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'Return only posts published through this connected account',
				routing: {
					send: {
						type: 'query',
						property: 'account_id',
					},
				},
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				placeholder: '550e8400-e29b-41d4-a716-446655440000',
				description:
					'Return only the posts of one multi-account publish, using the group ID that call returned',
				routing: {
					send: {
						type: 'query',
						property: 'group_id',
					},
				},
			},
			{
				displayName: 'Include Hidden',
				name: 'includeHidden',
				type: 'boolean',
				default: false,
				description:
					'Whether to include posts you have hidden. Off by default on every filter.',
				routing: {
					send: {
						type: 'query',
						property: 'include_hidden',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'published',
				description: 'Return only posts in this state',
				options: [
					{ name: 'Deleted', value: 'deleted' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Published', value: 'published' },
					{ name: 'Publishing', value: 'publishing' },
					{ name: 'Scheduled', value: 'scheduled' },
				],
				routing: {
					send: {
						type: 'query',
						property: 'status',
					},
				},
			},
		],
	},
];
