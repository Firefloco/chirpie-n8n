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
];
