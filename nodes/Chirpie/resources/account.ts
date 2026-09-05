import type { INodeProperties } from 'n8n-workflow';
import { unwrapDataOutput } from '../shared/descriptions';

const showOnlyForAccounts = {
	resource: ['account'],
};

const showOnlyForAccountGetMany = {
	...showOnlyForAccounts,
	operation: ['getAll'],
};

const showOnlyForAccountToggle = {
	...showOnlyForAccounts,
	operation: ['activate', 'deactivate'],
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
				name: 'Activate',
				value: 'activate',
				action: 'Activate an account',
				description:
					'Switch a connected account on so it can publish. Fails if the plan account limit is already reached.',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/accounts/{{$parameter.accountId}}',
						body: {
							is_active: true,
						},
					},
					output: unwrapDataOutput,
				},
			},
			{
				name: 'Deactivate',
				value: 'deactivate',
				action: 'Deactivate an account',
				description:
					'Switch a connected account off. It stays connected and can be switched back on.',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/accounts/{{$parameter.accountId}}',
						body: {
							is_active: false,
						},
					},
					output: unwrapDataOutput,
				},
			},
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

	// ----------------------------------
	//   account: activate / deactivate
	// ----------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForAccountToggle,
		},
		description: 'ID of the connected account to switch on or off',
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
