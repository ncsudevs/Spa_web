export default function CustomerFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">SuSpa</h3>
          <p className="max-w-sm text-sm leading-7 text-stone-400">
            A calm, modern spa booking experience inspired by Su. Built for the
            customer side of your SpaBooking project.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            Opening Hours
          </h4>
          <p className="text-sm leading-7 text-stone-400">
            Mon - Fri: 9:00 AM - 8:00 PM
          </p>
          <p className="text-sm leading-7 text-stone-400">
            Sat - Sun: 9:00 AM - 9:00 PM
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            Contact
          </h4>
          <p className="text-sm leading-7 text-stone-400">
            158 ly thuong kiet, p7, go vap, hcm city
          </p>
          <p className="text-sm leading-7 text-stone-400">
            nguyenchisu.10a4@gmail.com
          </p>
          <p className="text-sm leading-7 text-stone-400">(+84) 931246294</p>
        </div>
      </div>
    </footer>
  );
}
