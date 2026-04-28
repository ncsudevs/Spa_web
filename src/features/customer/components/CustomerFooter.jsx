import { Sparkles } from "lucide-react";

export default function CustomerFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-[linear-gradient(180deg,#1d1312,#120c0b)] text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#342220,#7f3446_58%,#d98b57)] text-white shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-3xl text-white">SuSpa</h3>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
                  Signature Calm Rituals
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-8 text-stone-400">
              A warm, modern place to slow down, choose your treatment, and
              book a visit that already feels restorative before you arrive.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              Opening Hours
            </h4>
            <div className="mt-4 space-y-2 text-sm leading-7 text-stone-300">
              <p>Mon - Fri: 9:00 AM - 8:00 PM</p>
              <p>Sat - Sun: 9:00 AM - 9:00 PM</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              Contact
            </h4>
            <div className="mt-4 space-y-2 text-sm leading-7 text-stone-300">
              <p>158 Ly Thuong Kiet, Ward 7, Go Vap, Ho Chi Minh City</p>
              <p>nguyenchisu.10a4@gmail.com</p>
              <p>(+84) 931246294</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
