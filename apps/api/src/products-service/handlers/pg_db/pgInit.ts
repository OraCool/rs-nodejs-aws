import { APIGatewayProxyHandler } from 'aws-lambda';
import { toNumber } from 'lodash';
import { Client, ClientConfig } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions: ClientConfig = {
  host: PG_HOST,
  port: toNumber(PG_PORT),
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // to avoid warring in this example
  },
  connectionTimeoutMillis: 5000, // time in millisecond for termination of the database query
};

export async function pgInit(
  event,
  _context
): Promise<void | APIGatewayProxyHandler> {
  const client = new Client(dbOptions);
  await client.connect();
  const status = {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    body: `Success`,
  };
  try {
    //make ddl query for creation table
    const ddlResult = await client.query(`
      create table products(
        id uuid primary key default uuid_generate_v4(),
        title varchar(64),
        description text,
        price float
      );`);
    const ddlResult2 = await client.query(`
      create table stocks(
        product_id uuid,
        count integer,
        foreign key ("product_id") references "products" ("id")
      )`);

    // make initial dml queries
    const dmlResult = await client.query(`
      insert into
        products (id, title, description, price)
      values
        (
          'febf406e-dc40-44e0-838a-ca552048a246',
          'ProductOne',
          'Short Product Description1',
          10.5
        ),
        (
          'e38bf509-f303-4114-84a1-bda1561ab828',
          'ProductNew',
          'Short Product Description3',
          15.5
        );`);
    const dmlResult2 = await client.query(`
      insert into
        stocks (product_id, count)
      values
        ('febf406e-dc40-44e0-838a-ca552048a246', 5),
        ('e38bf509-f303-4114-84a1-bda1561ab828', 3)`);
    console.log(JSON.stringify(dmlResult2));

    // make select query
  } catch (err) {
    // you can process error here. In this example just log it to console.
    console.error('Error during database request executing:', err);
    status.statusCode = 500;
    status.body = `Internal error`;
  } finally {
    // in case if error was occurred, connection will not close automatically
    client.end(); // manual closing of connection
  }
  return new Promise(() => status);
}
