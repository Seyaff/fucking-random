export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex size-5 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
              R
            </div>
            Relay
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Relay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
