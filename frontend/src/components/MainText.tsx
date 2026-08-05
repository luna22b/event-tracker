const MainText = () => {
  return (
    <section className="mx-auto mt-20 flex max-w-4xl flex-col items-center px-4 text-center text-white">
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
        Know the wait time
        <br />
        before you go.
      </h1>

      <p className="mt-6 text-base text-zinc-400 sm:text-lg">
        Enable your location to discover nearby places with live wait times.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button className="w-full rounded-xl border border-zinc-700 px-6 py-3 font-semibold cursor-pointer text-white transition hover:bg-zinc-900 sm:w-auto">
          Enable Location
        </button>

        <span className="flex items-center">or</span>

        <button className="w-full rounded-xl border border-zinc-700 px-6 py-3 font-semibold cursor-pointer text-white transition hover:bg-zinc-900 sm:w-auto">
          Enter Postal Code
        </button>
      </div>
    </section>
  );
};

export default MainText;
