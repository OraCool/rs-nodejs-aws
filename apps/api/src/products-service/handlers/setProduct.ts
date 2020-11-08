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

export const setProduct: APIGatewayProxyHandler = async (event, _context) => {
  const resp = {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    body: 'created',
  };
  let productId: string;
  if (event && event.body) {
    const client = new Client(dbOptions);
    try {
      const product: Product = JSON.parse(event.body);
      console.log(`setProduct incoming request: ${event.body}`);
      if (!(product && product.title)) {
        console.log(`setProduct bad request`);
        resp.statusCode = 400;
        resp.body = `Bad request`;
        return resp;
      }
      await client.connect();
      if (!product.id) {
        console.log(`setProduct insert product request`);
        const queryResult = await client.query(
          `insert into
          products (title, description, price)
        values
          (
            $1,
            $2,
            $3
          ) RETURNING id;`,
          [product.title, product.description, product.price]
        );

        const row = queryResult.rows[0];
        if (row) {
          productId = row.id;
        }
      } else {
        console.log(`setProduct update product request: ${JSON.stringify(product)}`);
        productId = product.id;
        const queryResult = await client.query(
          `update products set title=$1, description=$2, price=$3 where id=$4;`,
          [product.title, product.description, product.price, product.id]
        );
      }
      if (product.count) {
        console.log(`setProduct update stocks request`);
        const queryResult = await client.query(
          `select * from stocks where product_id=$1`,
          [productId]
        );
        console.log(
          `Stocks count=${queryResult.rows.length} for product_id=${productId}`
        );
        if (queryResult.rows.length > 0) {
          console.log(`Stocks update for product_id=${productId}`);
          const queryResult = await client.query(
            `update stocks set count=$1 where product_id=$2`,
            [product.count, product.id]
          );
        } else {
          console.log(`Stocks insert for product_id=${productId}`);
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
      }
      resp.statusCode = 200;
      resp.body = productId;
    } catch (err) {
      resp.statusCode = 500;
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
