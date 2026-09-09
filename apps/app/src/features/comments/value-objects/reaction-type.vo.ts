import { REACTION_TYPES, type ReactionType } from "#/features/comments/consts/reaction-type.const";

export class ReactionTypeVo {
  private constructor(private readonly value: ReactionType) {}

  static create(value: string): ReactionTypeVo {
    if (!REACTION_TYPES.includes(value as ReactionType)) {
      throw new Error(
        `Invalid reaction type: ${value}. Must be one of: ${REACTION_TYPES.join(", ")}`,
      );
    }
    return new ReactionTypeVo(value as ReactionType);
  }

  getValue(): ReactionType {
    return this.value;
  }

  equals(other: ReactionTypeVo): boolean {
    return this.value === other.value;
  }
}
