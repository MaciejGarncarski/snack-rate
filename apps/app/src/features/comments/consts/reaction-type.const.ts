import angry from "#/assets/reaction-icons/angry.png";
import thumbsDown from "#/assets/reaction-icons/dislike.png";
import heart from "#/assets/reaction-icons/heart.png";
import laugh from "#/assets/reaction-icons/laugh.png";
import thumbsUp from "#/assets/reaction-icons/like.png";
import frown from "#/assets/reaction-icons/sad.png";

export const REACTION_TYPES = ["like", "dislike", "heart", "laugh", "angry", "sad"] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export const REACTION_TYPE_LABELS: Record<ReactionType, string> = {
  like: "Lubię to",
  dislike: "Nie lubię",
  heart: "Kocham",
  laugh: "Bawi",
  angry: "Wkurza",
  sad: "Smuci",
};

export const REACTION_ICONS: Record<ReactionType, string> = {
  like: thumbsUp,
  dislike: thumbsDown,
  heart: heart,
  laugh: laugh,
  angry: angry,
  sad: frown,
};
