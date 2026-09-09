import { REACTION_TYPES } from "#/features/comments/consts/reaction-type.const";
import { ReactionTypeVo } from "#/features/comments/value-objects/reaction-type.vo";

describe("ReactionType value object", () => {
  it("should create a valid reaction type", () => {
    for (const type of REACTION_TYPES) {
      const vo = ReactionTypeVo.create(type);
      expect(vo.getValue()).toBe(type);
    }
  });

  it("should throw for invalid type (legacy fire/meh)", () => {
    expect(() => ReactionTypeVo.create("fire")).toThrow("Invalid reaction type");
    expect(() => ReactionTypeVo.create("meh")).toThrow("Invalid reaction type");
    expect(() => ReactionTypeVo.create("wow")).toThrow("Invalid reaction type");
  });

  it("should expose 6 reaction types: like, dislike, heart, laugh, angry, sad", () => {
    expect(REACTION_TYPES).toEqual(["like", "dislike", "heart", "laugh", "angry", "sad"]);
  });

  it("should check equality", () => {
    const a = ReactionTypeVo.create("like");
    const b = ReactionTypeVo.create("like");
    const c = ReactionTypeVo.create("dislike");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
