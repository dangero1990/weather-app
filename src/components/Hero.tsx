import searchIcon from '../assets/icon-search.svg'

interface HeroProps {
  searchValue: string
  onSearchValueChange: (value: string) => void
  onSearchSubmit: () => void
  isLoading: boolean
  errorMessage: string | null
}

export default function Hero({
  searchValue,
  onSearchValueChange,
  onSearchSubmit,
  isLoading,
  errorMessage,
}: HeroProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center py-12 text-center sm:py-16">
      <h1 className="font-display max-w-4xl text-balance text-4xl font-bold tracking-[-0.04em] text-neutral-0 sm:text-5xl lg:text-[3.5rem]">
        How&apos;s the sky looking today?
      </h1>

      <form
        className="mt-10 flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault()
          onSearchSubmit()
        }}
      >
        <label className="relative block flex-1">
          <span className="sr-only">Search for a place</span>
          <img
            src={searchIcon}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2"
          />
          <input
            type="search"
            placeholder="Search for a place..."
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            className="w-full rounded-2xl border border-transparent bg-neutral-700 py-4 pr-5 pl-13 text-base text-neutral-0 outline-none placeholder:text-neutral-300 transition focus:border-blue-500 focus:bg-neutral-800"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-blue-500 px-8 py-4 text-base font-semibold text-neutral-0 transition hover:bg-[hsl(233,67%,60%)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
          {isLoading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-4 text-sm font-medium text-orange-500">{errorMessage}</p>
      ) : null}
    </section>
  )
}
