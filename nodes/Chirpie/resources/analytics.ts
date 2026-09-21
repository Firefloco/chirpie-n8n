import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput } from '../shared/descriptions';

const showOnlyForAnalytics = {
	resource: ['analytics'],
};

export const analyticsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAnalytics,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get analytics for a post',
				description: 'Retrieve engagement metrics for a published post',
				routing: {
					request: {
						method: 'GET',
						url: '=/analytics/posts/{{$parameter.postId}}',
					},
					output: unwrapDataOutput,
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
		displayOptions: {
			show: {
				...showOnlyForAnalytics,
				operation: ['get'],
			},
		},
		description: 'ID of the published post to fetch metrics for',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForAnalytics,
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Refresh',
				name: 'refresh',
				type: 'boolean',
				default: false,
				description:
					'Whether to ask the platform for the current numbers instead of reading the stored snapshot. Allowed once per post every 30 minutes; past that the step fails with a Retry-After.',
				routing: {
					send: {
						type: 'query',
						property: 'refresh',
						// Only ever sent as the literal the API looks for, and
						// dropped entirely when the toggle is off, so an
						// untouched option never spends a platform call.
						value: '={{ $value ? "true" : undefined }}',
					},
				},
			},
		],
	},
];
