import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import 'source-map-support/register';
import * as _ from 'lodash';
import * as csv from 'csv-parser';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Product } from '../../../../../libs/api-interfaces/src/lib/product';
import { BUCKET, REGION } from '../utils/constants';

const s3 = new S3({ region: REGION });
export const importFileParser = async (event) => {
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
    _.forEach(event.Records, async (record) => {
      parseCsvProductFile(record);
    });
    const resp = await s3.listObjectsV2();
  } else {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 400,
      body: `Bad request`,
    };
  }
};

async function parseCsvProductFile(key: string): Promise<boolean> {
  const params = {
    Bucket: BUCKET,
    Key: key,
  };
  const results = [];
  const stream = s3.getObject(params).createReadStream();
  const status = await stream
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
      return new Promise((resolve) => resolve(true));
    })
    .on('error', (error) => {
      console.log(`File parse error: ${JSON.stringify(error)}`);
      return new Promise((resolve) => resolve(false));
    })
    .on('end', () => {
      return status;
    });
  return new Promise((resolve) => resolve(status));
}

async function moveParsedFiles(key: string): Promise<boolean> {
  await s3
    .copyObject({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${key}`,
      Key: `${BUCKET}/parsed/${key}`,
    })
    .promise();
  await s3
    .deleteObject({
      Bucket: BUCKET,
      Key: `${BUCKET}/parsed/${key}`,
    })
    .promise();
  return new Promise((resolve) => resolve(true));
}
