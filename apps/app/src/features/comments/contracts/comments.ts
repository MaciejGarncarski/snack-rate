import type { ReactionType } from "#/features/comments/consts/reaction-type.const";

export type SnackCommentReply = {
  id: string;
  authorName: string;
  body: string | null;
  createdAt: Date;
};

export type SnackComment = {
  id: string;
  rating: number;
  body: string | null;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  hasReplies: boolean;
  reactions: Record<ReactionType, number>;
  userReaction: ReactionType | null;
};
