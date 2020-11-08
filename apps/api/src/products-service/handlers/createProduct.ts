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

export const createProduct: APIGatewayProxyHandler = async (event, _context) => {
  if (event && event.body) {
    const client = new Client(dbOptions);
    await client.connect();
    const product: Product = JSON.parse(event.body);
    const queryResult = await client.query(
      `insert into
          products (title, description, price)
        values
          (
            $1,
            $2,
            $3
          ) RETURNING id;`,
      [product.title, product.description, product.price ]
    );
    let productId: string;
    const row = queryResult.rows[0];
    if (row) {
      productId = row.id
    }

    if (productId) {
      if (product.count) {
        const queryResult = await client.query(
          `insert into
            stocks (product_id, count)
          values
            (
              $1,
              $2
            )`,
          [productId, product.count]
        );
      }
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: productId,
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
