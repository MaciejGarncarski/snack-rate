import preview from "$/preview";

import { CommentReply } from "./comment-reply";

const meta = preview.meta({
  title: "Features/Comments/CommentReply",
  component: CommentReply,
  args: {
    reply: {
      id: "reply-1",
      authorName: "Anna Nowak",
      body: "Super produkt, polecam!",
      createdAt: new Date("2026-07-15T14:30:00.000Z"),
      updatedAt: new Date("2026-07-15T14:30:00.000Z"),
      isEdited: false,
      isUserAuthor: false,
    },
    snackItemId: "snack-1",
    parentCommentId: "comment-1",
  },
});

export default meta;

export const Default = meta.story({});

export const OwnReply = meta.story({
  args: {
    reply: {
      id: "reply-2",
      authorName: "Jan Kowalski",
      body: "Zgadzam się, świetny smak!",
      createdAt: new Date("2026-07-15T14:30:00.000Z"),
      updatedAt: new Date("2026-07-16T10:00:00.000Z"),
      isEdited: true,
      isUserAuthor: true,
    },
  },
});

export const LongBody = meta.story({
  args: {
    reply: {
      id: "reply-3",
      authorName: "Anna Nowak",
      body: "To jest bardzo długa treść komentarza, która powinna się zawijać na kolejne linie, żeby sprawdzić jak komponent radzi sobie z dłuższym tekstem.",
      createdAt: new Date("2026-07-15T14:30:00.000Z"),
      updatedAt: new Date("2026-07-15T14:30:00.000Z"),
      isEdited: false,
      isUserAuthor: false,
    },
  },
});

export const NullBody = meta.story({
  args: {
    reply: {
      id: "reply-4",
      authorName: "Anna Nowak",
      body: null,
      createdAt: new Date("2026-07-15T14:30:00.000Z"),
      updatedAt: new Date("2026-07-15T14:30:00.000Z"),
      isEdited: false,
      isUserAuthor: false,
    },
  },
});
