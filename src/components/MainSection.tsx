import dropdownIcon from '../assets/icon-dropdown.svg'
import bgTodayLarge from '../assets/bg-today-large.svg'
import bgTodaySmall from '../assets/bg-today-small.svg'
import { getWeatherIcon } from '../lib/weather-icons'
import type { LocationSearchResult, WeatherResponse } from '../types/weather'

interface MainSectionProps {
  weather: WeatherResponse | null
  selectedLocation: LocationSearchResult | null
  selectedHourlyDate: string | null
  onSelectedHourlyDateChange: (date: string) => void
  isLoading: boolean
}

function formatTemperature(value: number, symbol: string) {
  return `${Math.round(value)}${symbol}`
}

function formatPrecipitation(value: number, unit: string) {
  return `${value.toFixed(unit === 'mm' ? 0 : 2)} ${unit}`
}

function formatWindSpeed(value: number, unit: string) {
  return `${Math.round(value)} ${unit}`
}

export default function MainSection({
  weather,
  selectedLocation,
  selectedHourlyDate,
  onSelectedHourlyDateChange,
  isLoading,
}: MainSectionProps) {
  if (!weather) {
    return (
      <section className="mt-2 rounded-[1.75rem] bg-neutral-800 px-6 py-16 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <p className="text-lg text-neutral-200">
          {isLoading ? 'Loading forecast...' : 'Search for a city to load the forecast.'}
        </p>
      </section>
    )
  }

  const temperatureSymbol = weather.units.temperatureSymbol
  const currentIcon = getWeatherIcon(weather.current.conditionKey)
  const activeHourlyDay =
    weather.hourlyByDay.find((day) => day.date === selectedHourlyDate) ?? weather.hourlyByDay[0]
  const hourlyEntries = activeHourlyDay.entries.slice(0, 8)
  const stats = [
    {
      label: 'Feels Like',
      value: formatTemperature(weather.current.apparentTemperature, temperatureSymbol),
    },
    { label: 'Humidity', value: `${Math.round(weather.current.humidity)}%` },
    {
      label: 'Wind',
      value: formatWindSpeed(weather.current.windSpeed, weather.units.windSpeed),
    },
    {
      label: 'Precipitation',
      value: formatPrecipitation(weather.current.precipitation, weather.units.precipitation),
    },
  ]

  return (
    <section className="mt-2 grid gap-6 pb-2 lg:grid-cols-[minmax(0,1fr)_295px] lg:items-start">
      <div className="space-y-6">
        <article className="relative overflow-hidden rounded-[1.75rem] bg-blue-700 px-5 py-6 sm:px-8 sm:py-7">
          <picture className="pointer-events-none absolute inset-0">
            <source media="(min-width: 640px)" srcSet={bgTodayLarge} />
            <img
              src={bgTodaySmall}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </picture>

          <div className="relative z-10 flex min-h-[286px] flex-col justify-between gap-8 sm:min-h-[220px] sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 pt-2 sm:max-w-[52%]">
              <p className="text-[2rem] font-semibold tracking-[-0.03em] text-neutral-0 sm:text-[2.25rem]">
                {selectedLocation?.label ?? 'Selected location'}
              </p>
              <p className="mt-2 text-lg font-medium text-neutral-200">
                {weather.daily[0]?.fullDate ?? 'Weather forecast'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
              <img src={currentIcon.src} alt={currentIcon.alt} className="h-16 w-16 object-contain" />
              <p className="font-display text-6xl leading-none text-neutral-0 sm:text-[5rem] lg:text-[5.5rem]">
                {formatTemperature(weather.current.temperature, temperatureSymbol)}
              </p>
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl bg-neutral-800 px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              <p className="text-base font-medium text-neutral-200">{stat.label}</p>
              <p className="mt-4 text-[2rem] font-medium tracking-[-0.03em] text-neutral-0">
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <section>
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-neutral-0">
            Daily forecast
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {weather.daily.map((day) => {
              const icon = getWeatherIcon(day.conditionKey)

              return (
                <article
                  key={day.date}
                  className="rounded-3xl bg-neutral-800 px-4 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                >
                  <p className="text-lg font-medium text-neutral-0">{day.dayLabel}</p>
                  <img
                    src={icon.src}
                    alt={icon.alt}
                    className="mx-auto my-4 h-14 w-14 object-contain"
                  />
                  <div className="flex items-center justify-center gap-4 text-base">
                    <span className="font-semibold text-neutral-0">
                      {formatTemperature(day.temperatureMax, temperatureSymbol)}
                    </span>
                    <span className="text-neutral-300">
                      {formatTemperature(day.temperatureMin, temperatureSymbol)}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <aside className="rounded-[1.75rem] bg-neutral-800 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-neutral-0">
            Hourly forecast
          </h2>

          <label className="relative">
            <span className="sr-only">Select day for hourly forecast</span>
            <select
              value={activeHourlyDay?.date ?? ''}
              onChange={(event) => onSelectedHourlyDateChange(event.target.value)}
              className="appearance-none rounded-xl bg-neutral-700 px-4 py-3 pr-10 text-base font-medium text-neutral-0 outline-none"
            >
              {weather.hourlyByDay.map((day) => (
                <option key={day.date} value={day.date}>
                  {day.dayLabel}
                </option>
              ))}
            </select>
            <img
              src={dropdownIcon}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          {hourlyEntries.map((entry) => {
            const icon = getWeatherIcon(entry.conditionKey)

            return (
              <article
                key={entry.time}
                className="flex items-center justify-between rounded-2xl bg-neutral-700 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img src={icon.src} alt={icon.alt} className="h-8 w-8 object-contain" />
                  <span className="text-lg font-medium text-neutral-0">{entry.label}</span>
                </div>

                <span className="text-lg font-medium text-neutral-200">
                  {formatTemperature(entry.temperature, temperatureSymbol)}
                </span>
              </article>
            )
          })}
        </div>
      </aside>
    </section>
  )
}
