import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    functionsBasePath: 'apps/api/import-service',
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
      PG_PASSWORD: 'ssg23121995',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: 'arn:aws:s3:::rolling-scopes-oracool',
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: 'arn:aws:s3:::rolling-scopes-oracool/*',
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            path: 'import',
            method: 'get',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: 'arn:aws:s3:::rolling-scopes-oracool',
            event: 's3:ObjectCreated:*',
            existing: true,
            rules: [{ prefix: 'uploaded/', suffix: '*' }],
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
