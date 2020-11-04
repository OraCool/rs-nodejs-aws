export const displayName = 'api';
export const preset = '../../jest.preset.js';
export const globals = {
  'ts-jest': {
    tsConfig: '<rootDir>/tsconfig.spec.json',
  },
};
export const transform = {
  '^.+\\.[tj]s$': 'ts-jest',
};
export const moduleFileExtensions = ['ts', 'js', 'html'];
export const coverageDirectory = '../../coverage/apps/api';
