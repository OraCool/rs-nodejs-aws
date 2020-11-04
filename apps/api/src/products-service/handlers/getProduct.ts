import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from '../data/products';
import * as _ from 'lodash';

export const getProduct: APIGatewayProxyHandler = async (event, _context) => {
  if (
    event &&
    event.pathParameters &&
    event.pathParameters.productId
  ) {
    const productId = event.pathParameters.productId;
    const product = _.find(productList, (product) => product.id === productId);

    if (product) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify(productList[0]),
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
