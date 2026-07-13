import { hash, verify } from "argon2";
import { argon2id } from "argon2";

const MEMORY_COST = 131072;
const TIME_COST = 3;
const PARALLELISM = 2;
const HASH_LENGTH = 32;

export const argon2Options = {
  type: argon2id,
  memoryCost: MEMORY_COST,
  timeCost: TIME_COST,
  parallelism: PARALLELISM,
  hashLength: HASH_LENGTH,
};

export function hashPassword(password: string) {
  return hash(password, argon2Options);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
