import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import MainSection from './components/MainSection'
import type { LocationSearchResult, UnitsSystem, WeatherResponse } from './types/weather'

const defaultLocation: LocationSearchResult = {
  id: 2950159,
  name: 'Berlin',
  country: 'Germany',
  countryCode: 'DE',
  admin1: 'Berlin',
  latitude: 52.52437,
  longitude: 13.41053,
  timezone: 'Europe/Berlin',
  label: 'Berlin, Germany',
}

function App() {
  const [units, setUnits] = useState<UnitsSystem>('metric')
  const [searchValue, setSearchValue] = useState(defaultLocation.name)
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(defaultLocation)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [selectedHourlyDate, setSelectedHourlyDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function fetchWeather(location: LocationSearchResult, nextUnits: UnitsSystem) {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: location.timezone,
      units: nextUnits,
    })

    const response = await fetch(`/api/weather?${params.toString()}`)
    const data = (await response.json()) as WeatherResponse | { message?: string }

    if (!response.ok) {
      throw new Error('message' in data ? data.message ?? 'Failed to load weather.' : 'Failed to load weather.')
    }

    return data as WeatherResponse
  }

  async function searchLocation(query: string) {
    const params = new URLSearchParams({ q: query })
    const response = await fetch(`/api/locations?${params.toString()}`)
    const data = (await response.json()) as { results?: LocationSearchResult[]; message?: string }

    if (!response.ok) {
      throw new Error(data.message ?? 'Failed to search for a location.')
    }

    const match = data.results?.[0]

    if (!match) {
      throw new Error('No matching location was found.')
    }

    return match
  }

  async function loadForecast(location: LocationSearchResult, nextUnits: UnitsSystem) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const nextWeather = await fetchWeather(location, nextUnits)
      setSelectedLocation(location)
      setWeather(nextWeather)
      setSelectedHourlyDate(nextWeather.hourlyByDay[0]?.date ?? null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedLocation) {
      return
    }

    void loadForecast(selectedLocation, units)
  }, [units])

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1100px] flex-col rounded-[2rem] bg-neutral-900 px-6 py-6 text-neutral-0 shadow-[0_28px_70px_rgba(4,5,24,0.45)] sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      <Header units={units} onUnitsChange={setUnits} />
      <Hero
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        onSearchSubmit={() => {
          const query = searchValue.trim()

          if (!query) {
            setErrorMessage('Enter a city name to search.')
            return
          }

          void (async () => {
            setIsLoading(true)
            setErrorMessage(null)

            try {
              const location = await searchLocation(query)
              setSearchValue(location.name)
              await loadForecast(location, units)
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.')
            } finally {
              setIsLoading(false)
            }
          })()
        }}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
      <MainSection
        weather={weather}
        selectedLocation={selectedLocation}
        selectedHourlyDate={selectedHourlyDate}
        onSelectedHourlyDateChange={setSelectedHourlyDate}
        isLoading={isLoading}
      />
    </main>
  )
}

export default App
