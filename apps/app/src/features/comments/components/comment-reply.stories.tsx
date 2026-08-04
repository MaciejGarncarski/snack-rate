import preview from "$/preview";

import { CommentReply } from "./comment-reply";

const meta = preview.meta({
  title: "Features/Comments/CommentReply",
  component: CommentReply,
  args: {
    userName: "Anna Nowak",
    body: "Super produkt, polecam!",
    createdAt: new Date("2026-07-15T14:30:00.000Z"),
  },
  argTypes: {
    userName: {
      control: "text",
    },
    body: {
      control: "text",
    },
    createdAt: {
      control: "date",
    },
  },
});

export default meta;

export const Default = meta.story({});

export const LongBody = meta.story({
  args: {
    body: "To jest bardzo długa treść komentarza, która powinna się zawijać na kolejne linie, żeby sprawdzić jak komponent radzi sobie z dłuższym tekstem.",
  },
});

export const NullBody = meta.story({
  args: {
    body: null,
  },
});
