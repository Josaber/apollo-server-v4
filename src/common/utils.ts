import { GraphQLFormattedError } from "graphql"
import { unwrapResolverError } from '@apollo/server/errors';
import { APP_ENV } from "./constants.js";

export const isProductionEnv = () => APP_ENV === "production"

export const formatError = (formattedError: GraphQLFormattedError, error: unknown) => {
  const unwrappedError = unwrapResolverError(error)
  if (unwrappedError instanceof Error) {
    return { message: `Internal Server Error with ${unwrappedError.message}` }
  }
  if (error instanceof Error) {
    return { message: `Internal Server Error with ${error.message}` }
  }
  return formattedError
}

export const getToken = async (authorization?: string): Promise<string> => {
  return authorization?.toString() ?? ''
}

export const getDynamicContext = async (ctx) => {
  if (ctx.connectionParams.authorization) {
    const token = await getToken(ctx.connectionParams.authorization);
    return { token };
  }
  return { token: null };
};
