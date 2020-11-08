import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    functionsBasePath: 'apps/api',
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-functions-base-path'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: 'rs-aws-db.coxauduykchc.eu-west-1.rds.amazonaws.com',
      PG_PORT: 5432,
      PG_DATABASE: 'rsnodedb',
      PG_USERNAME: 'postgres',
      PG_PASSWORD: 'ssg23121995'
    },
  },
  functions: {
    getProducts: {
      handler: 'handler.getProducts',
      events: [
        {
          http: {
            path: 'products',
            method: 'get',
            cors: true,
          },
        },
      ],
    },
    getProduct: {
      handler: 'handler.getProduct',
      events: [
        {
          http: {
            path: 'products/{productId}',
            method: 'get',
            cors: true,
            request: {
              parameters: {
                paths: {
                  productId: true,
                },
              },
            },
          },
        },
      ],
    },
    createProduct: {
      handler: 'handler.createProduct',
      events: [
        {
          http: {
            path: 'product',
            method: 'put',
            cors: true
          },
        },
      ],
    },
    updateProduct: {
      handler: 'handler.updateProduct',
      events: [
        {
          http: {
            path: 'product/{productId}',
            method: 'put',
            cors: true,request: {
              parameters: {
                paths: {
                  productId: true,
                },
              },
            },
          },
        },
      ],
    },
    pgInit: {
      handler: 'handler.pgInit',
      events: [
        {
          http: {
            path: 'init',
            method: 'get',
            cors: true,
          },
        },
      ],
    },
    ssgTest: {
      handler: 'handler.ssgTest',
      events: [
        {
          http: {
            path: 'test',
            method: 'get',
            cors: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
