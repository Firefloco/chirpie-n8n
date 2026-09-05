import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { accountDescription } from './resources/account';
import { analyticsDescription } from './resources/analytics';
import { postDescription } from './resources/post';
import { threadDescription } from './resources/thread';

export class Chirpie implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chirpie',
		name: 'chirpie',
		// Same Chirpie mark; the dark variant brightens the amber gradient so it
		// keeps its contrast against the dark editor canvas.
		icon: { light: 'file:chirpie.svg', dark: 'file:chirpie.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Post to X, Bluesky, LinkedIn, Threads, Mastodon, Instagram, Facebook, Telegram and more through the Chirpie API',
		defaults: {
			name: 'Chirpie',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'chirpieApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{ $credentials.baseUrl.endsWith("/") ? $credentials.baseUrl.slice(0, -1) : $credentials.baseUrl }}/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Analytic',
						value: 'analytics',
					},
					{
						name: 'Post',
						value: 'post',
					},
					{
						name: 'Thread',
						value: 'thread',
					},
				],
				default: 'post',
			},
			...postDescription,
			...threadDescription,
			...accountDescription,
			...analyticsDescription,
		],
	};
}
