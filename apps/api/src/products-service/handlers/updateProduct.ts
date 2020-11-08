import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as _ from 'lodash';
import { Client, ClientConfig } from 'pg';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Product } from '../../../../../libs/api-interfaces/src/lib/product';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions: ClientConfig = {
  host: PG_HOST,
  port: _.toNumber(PG_PORT),
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // to avoid warring in this example
  },
  connectionTimeoutMillis: 5000, // time in millisecond for termination of the database query
};

export const updateProduct: APIGatewayProxyHandler = async (event, _context) => {
  if (event && event.body && event.pathParameters && event.pathParameters.productId) {
    const client = new Client(dbOptions);
    await client.connect();
    const productId: string = event.pathParameters.productId;
    const resp = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 200,
      body: 'Updated',
    };
    try {
      const product: Product = JSON.parse(event.body);
      const queryResult = await client.query(
        `update products set title=$1, description=$2, cost=$3 where id=$4;`,
        [product.title, product.description, product.price, productId]
      );
      if (product.count) {
        const queryResult = await client.query(
          `update stocks set count=$1 where product_id=$2`,
          [product.count, productId]
        );
      }
    }
    catch (err) {
      resp.statusCode = 401;
      resp.body = JSON.stringify(err);
    } finally {
      // in case if error was occurred, connection will not close automatically
      client.end(); // manual closing of connection
    }
    return resp;
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
