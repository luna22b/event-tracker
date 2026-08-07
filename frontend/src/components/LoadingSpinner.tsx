const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-400" />

      <p className="mt-4 text-sm text-zinc-400">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
