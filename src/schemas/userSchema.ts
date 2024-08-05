import { FastifySchema } from 'fastify';

export const registerUserSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['id', 'first_name', 'language_code'],
    properties: {
      id: { type: 'number' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      language_code: { type: 'string' },
    },
  },
};

export const addCoinsSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'number' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      coins: { type: 'number' },
    },
    required: ['coins'],
  },
};

export const getUserReferralsSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      userId: { type: 'number' },
    },
    required: ['userId'],
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          language_code: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          coins: { type: 'number' },
          referredBy: { type: 'string' },
          referrals: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};
