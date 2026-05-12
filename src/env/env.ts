import { clientEnv } from "#/env/client";
import { serverEnv } from "#/env/server";

const nodeEnv = clientEnv.NODE_ENV;

export const env = Object.freeze({
	client: clientEnv,
	server: serverEnv,
	isDevelopment: nodeEnv === "development",
	isProduction: nodeEnv === "production",
	isTesting: nodeEnv === "test",
});
