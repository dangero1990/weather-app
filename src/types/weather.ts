export type UnitsSystem = 'metric' | 'imperial'

export type ConditionKey =
  | 'sunny'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm'

export interface LocationSearchResult {
  id: number
  name: string
  country: string
  countryCode: string
  admin1: string
  latitude: number
  longitude: number
  timezone: string
  label: string
}

export interface WeatherUnits {
  system: UnitsSystem
  temperatureSymbol: string
  windSpeed: string
  precipitation: string
}

export interface CurrentWeather {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  weatherCode: number
  conditionKey: ConditionKey
}

export interface DailyWeather {
  date: string
  dayLabel: string
  fullDate: string
  temperatureMax: number
  temperatureMin: number
  weatherCode: number
  conditionKey: ConditionKey
}

export interface HourlyWeatherEntry {
  time: string
  label: string
  temperature: number
  weatherCode: number
  conditionKey: ConditionKey
}

export interface HourlyWeatherDay {
  date: string
  dayLabel: string
  fullDate: string
  entries: HourlyWeatherEntry[]
}

export interface WeatherResponse {
  location: {
    latitude: number
    longitude: number
    timezone: string
  }
  units: WeatherUnits
  current: CurrentWeather
  daily: DailyWeather[]
  hourlyByDay: HourlyWeatherDay[]
}
