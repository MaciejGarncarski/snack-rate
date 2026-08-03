export type SnackReviewReply = {
  id: string;
  authorName: string;
  body: string | null;
  createdAt: Date;
};

export type SnackReview = {
  id: string;
  rating: number;
  body: string | null;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  repliesCount: number;
  replies: SnackReviewReply[];
};
