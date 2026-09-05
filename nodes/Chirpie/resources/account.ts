import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput } from '../shared/descriptions';

const showOnlyForAccounts = {
	resource: ['account'],
};

const showOnlyForAccountGetMany = {
	...showOnlyForAccounts,
	operation: ['getAll'],
};

export const accountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAccounts,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many accounts',
				description: 'List the social accounts connected to this Chirpie workspace',
				routing: {
					request: {
						method: 'GET',
						url: '/accounts',
					},
					output: unwrapDataOutput,
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: showOnlyForAccountGetMany,
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				...showOnlyForAccountGetMany,
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		routing: {
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
];
