import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class ChirpieApi implements ICredentialType {
	name = 'chirpieApi';

	displayName = 'Chirpie API';

	icon: Icon = {
		light: 'file:../nodes/Chirpie/chirpie.svg',
		dark: 'file:../nodes/Chirpie/chirpie.dark.svg',
	};

	documentationUrl = 'https://chirpie.ai/docs/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Chirpie API key. Create one at https://chirpie.ai/dashboard/keys. Starts with "chirpie_sk_".',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://chirpie.ai',
			description: 'Base URL of the Chirpie API. Leave as is unless you were told otherwise.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.baseUrl.endsWith("/") ? $credentials.baseUrl.slice(0, -1) : $credentials.baseUrl }}',
			url: '/api/v1/accounts',
			method: 'GET',
		},
	};
}
