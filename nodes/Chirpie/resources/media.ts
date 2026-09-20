import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { unwrapDataOutput } from '../shared/descriptions';

const showOnlyForMedia = {
	resource: ['media'],
};

/**
 * Send the item's binary data as the JSON body the upload endpoint accepts.
 *
 * Base64 rather than multipart, deliberately. Declarative routing builds a
 * JSON body and nothing else, so a multipart request would mean hand-rolling
 * an encoder and a boundary here and hoping the HTTP helper left them alone.
 * The endpoint takes either shape and validates both identically: the bytes
 * are sniffed and measured after decoding, so nothing is trusted that would
 * not be trusted from a file part.
 *
 * The cost is the third that base64 adds to the request, which is why the
 * endpoint's own ceiling is stated in the field description.
 */
async function sendBinaryFile(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const propertyName = this.getNodeParameter('binaryPropertyName') as string;
	const binary = this.helpers.assertBinaryData(propertyName);
	const buffer = await this.helpers.getBinaryDataBuffer(propertyName);

	return {
		...requestOptions,
		body: {
			data: buffer.toString('base64'),
			filename: binary.fileName ?? 'upload',
		},
	};
}

export const mediaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMedia,
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload a media file',
				description: 'Upload an image or video and get the ID a post can attach',
				routing: {
					request: {
						method: 'POST',
						url: '/media',
					},
					send: {
						preSend: [sendBinaryFile],
					},
					output: unwrapDataOutput,
				},
			},
		],
		default: 'upload',
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		hint: 'The name of the input binary field containing the file to upload',
		displayOptions: {
			show: {
				...showOnlyForMedia,
				operation: ['upload'],
			},
		},
		description:
			'Name of the binary field holding the image or video. The file type is read from the file itself, so a wrong extension does not matter. Uploads are limited to 3 MB; attach a larger file with Media URLs on the post instead.',
	},
];
