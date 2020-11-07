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

export const getProduct: APIGatewayProxyHandler = async (event, _context) => {
  if (event && event.pathParameters && event.pathParameters.productId) {
    const client = new Client(dbOptions);
    await client.connect();
    const productId = event.pathParameters.productId;
    const queryResult = await client.query(
      `select p.*, s.count from products p left join stocks s on p.id=s.product_id where p.id=$1`,
      [productId]
    );
    let product: Product;
    const row = queryResult.rows[0];
    if (row) {
      product = new Product(
        row.id,
        row.title,
        row.description,
        row.price,
        row.count
      );
    }

    if (product) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify(product),
      };
    } else {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: 404,
        body: `Product with id=${productId} is not found`,
      };
    }
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
