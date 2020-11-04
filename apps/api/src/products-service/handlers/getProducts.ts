import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from '../data/products';

export const getProducts: APIGatewayProxyHandler = async (event, _context) => {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    body: JSON.stringify(productList),
  };
};
