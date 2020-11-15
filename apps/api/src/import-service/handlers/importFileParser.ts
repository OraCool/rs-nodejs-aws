import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import 'source-map-support/register';
import * as _ from 'lodash';
import * as csv from 'csv-parser';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Product } from '../../../../../libs/api-interfaces/src/lib/product';
import { BUCKET, REGION } from '../utils/constants';

const s3 = new S3({ region: REGION });
export const importFileParser = async (event, _context) => {
  const resp = {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    body: 'imported',
  };
  if (event && event.Records) {
    _.forEach(event.Records, async (record) => {
      parseCsvProductFile(record.s3.object.key);
    });
  } else {
    resp.statusCode = 500;
    resp.body = `Internal error`;
  }
  return resp;
};

async function parseCsvProductFile(key: string): Promise<boolean> {
  const params = {
    Bucket: BUCKET,
    Key: `${BUCKET}/${key}`,
  };
  console.log(
    `importFileParser. File to parse: ${JSON.stringify({ path: key })}`
  );
  const results = [];
  const stream = s3.getObject(params).createReadStream();
  console.log(
    `importFileParser. After get object: ${JSON.stringify({ obj: stream })}`
  );
  const status = stream
    // .pipe(csv())
    .on('data', (data) => {
      console.log(`GotData: ${JSON.stringify({ data: data })}`);
      results.push(data);
      _.forEach(results, (result) => console.log(result));
      return new Promise((resolve) => resolve(true));
    })
    .on('error', (error) => {
      console.log(`File parse error: ${JSON.stringify(error)}`);
      return new Promise((resolve) => resolve(false));
    })
    .on('end', () => {
      return status;
    });
  if (status) {
    await moveParsedFile(key);
  }
  return new Promise((resolve) => resolve(status));
}

async function moveParsedFile(key: string): Promise<boolean> {
  await s3
    .copyObject({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${key}`,
      Key: `${BUCKET}/${key.replace('uploaded', 'parsed')}`,
    })
    .promise();
  await s3
    .deleteObject({
      Bucket: BUCKET,
      Key: `${BUCKET}/${key}`,
    })
    .promise();
  return new Promise((resolve) => resolve(true));
}
