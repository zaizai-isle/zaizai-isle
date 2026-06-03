export function BananaFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>{new Date().getFullYear()} Everything is Banana</p>
        </div>
      </div>
    </footer>
  );
}
