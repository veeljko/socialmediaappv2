export function MessagesEmptyState() {
  return (
    <section className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-6">
      <div className="max-w-sm text-center">
        <p className="text-xl font-semibold tracking-tight">No messages found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try another search term or start a new conversation.
        </p>
      </div>
    </section>
  );
}
