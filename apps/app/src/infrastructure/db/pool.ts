import { Pool } from "pg";

import { serverEnv } from "#/lib/server.env";
import { logger } from "#/observability/logger/logger";

let _pool: Pool | undefined;

export function getPool(): Pool {
  if (!_pool) {
    logger.info({ message: "Creating database connection pool", context: { module: "db" } });

    const url = new URL(serverEnv.DATABASE_URL);
    _pool = new Pool({
      host: url.hostname,
      port: Number(url.port),
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      idleTimeoutMillis: 0,
      pipeline: true,
    });
  }
  return _pool;
}
