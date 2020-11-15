import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';

import 'source-map-support/register';
import * as _ from 'lodash';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BUCKET, REGION } from '../utils/constants';

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
  const resp = {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    body: 'imported',
  };
  if (
    event &&
    event.queryStringParameters &&
    event.queryStringParameters.name
  ) {
    const s3 = new S3({ region: REGION });
    try {
      const params = {
        Bucket: BUCKET,
        Key: `uploaded/${event.queryStringParameters.name}`,
        ContentType: 'text/csv',
        Expires: 60
      };
      const signedUrl = await s3.getSignedUrl('putObject', params);
      resp.body = JSON.stringify({ fileUploadURL: signedUrl });
    } catch (err) {
      console.log(`Internal server error: ${JSON.stringify(err)}`);
      resp.statusCode = 500;
      resp.body = `Internal server error: ${JSON.stringify(err)}`;
    }
  } else {
    resp.statusCode = 400;
    resp.body = `Bad request`;
  }
  return resp;
};
