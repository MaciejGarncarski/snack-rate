import { serverEnv } from "#/lib/server.env";
import { Pool } from "pg";

let _pool: Pool | undefined;

export function getPool(): Pool {
  if (!_pool) {
    const url = new URL(serverEnv.DATABASE_URL);
    _pool = new Pool({
      host: url.hostname,
      port: Number(url.port),
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
    });
  }
  return _pool;
}
