export default function ShortUrlLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="text-sm text-slate-400">Opening short link…</p>
      </div>
    </div>
  );
}
