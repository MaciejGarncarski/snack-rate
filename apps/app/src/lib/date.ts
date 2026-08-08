const createdAtFormatter = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatCreatedAt(date: Date) {
  return createdAtFormatter.format(date);
}
