import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-white bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_40%),linear-gradient(135deg,_#07111f_0%,_#0b1628_45%,_#050816_100%)]">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/6 p-8 shadow-2xl shadow-cyan-950/25 backdrop-blur-md sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_80px_rgba(34,211,238,0.18)] sm:h-60 sm:w-60">
            <div className="absolute inset-5 rounded-full border border-white/10 bg-slate-950/40" />
            <div className="relative text-center">
              <div className="text-7xl font-black tracking-tight text-cyan-300 sm:text-8xl">404</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-100/70">
                Not found
              </div>
            </div>
          </div>

          <div className="mt-7">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Page not found</h1>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm leading-6 text-slate-300 sm:text-base">
          <p>
            The page you’re looking for isn’t available right now.
          </p>
          <p>
            It may have moved, been removed, or the link may be incorrect.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <span className="material-icons text-[18px]">arrow_back</span>
            Go back
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <span className="material-icons text-[18px]">home</span>
            Home
          </button>
        </div>
      </div>
    </main>
  );
};

export default PageNotFound;
