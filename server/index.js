import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3001

const geocodingBaseUrl = 'https://geocoding-api.open-meteo.com/v1/search'
const forecastBaseUrl = 'https://api.open-meteo.com/v1/forecast'

const weatherCodeToCondition = {
  0: 'sunny',
  1: 'partly-cloudy',
  2: 'partly-cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'drizzle',
  57: 'drizzle',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  85: 'snow',
  86: 'snow',
  95: 'storm',
  96: 'storm',
  99: 'storm',
}

function badRequest(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

function getUnitsConfig(units) {
  if (units === 'imperial') {
    return {
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
      temperatureSymbol: '°F',
      windSpeedUnitLabel: 'mph',
      precipitationUnitLabel: 'in',
    }
  }

  return {
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    temperatureSymbol: '°C',
    windSpeedUnitLabel: 'km/h',
    precipitationUnitLabel: 'mm',
  }
}

function getConditionKey(weatherCode, isDay = 1) {
  if ((weatherCode === 0 || weatherCode === 1) && !isDay) {
    return 'overcast'
  }

  return weatherCodeToCondition[weatherCode] ?? 'overcast'
}

function getLocationLabel(result) {
  const parts = [result.name, result.admin1, result.country].filter(Boolean)
  return parts.join(', ')
}

function toDayLabel(dateString, timezone) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: timezone,
  }).format(new Date(`${dateString}T12:00:00`))
}

function toReadableDate(dateString, timezone) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(`${dateString}T12:00:00`))
}

function toHourLabel(dateTimeString, timezone) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(dateTimeString))
}

function groupHourlyForecast(hourly, dailyDates, timezone) {
  return dailyDates.map((date) => {
    const entries = hourly.time
      .map((time, index) => ({
        time,
        temperature: hourly.temperature_2m[index],
        weatherCode: hourly.weather_code[index],
        isDay: hourly.is_day[index],
      }))
      .filter((entry) => entry.time.startsWith(date))
      .map((entry) => ({
        time: entry.time,
        label: toHourLabel(entry.time, timezone),
        temperature: entry.temperature,
        weatherCode: entry.weatherCode,
        conditionKey: getConditionKey(entry.weatherCode, entry.isDay),
      }))

    return {
      date,
      dayLabel: toDayLabel(date, timezone),
      fullDate: toReadableDate(date, timezone),
      entries,
    }
  })
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    const error = new Error(`Upstream request failed with ${response.status}: ${text}`)
    error.statusCode = 502
    throw error
  }

  return response.json()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/locations', async (req, res, next) => {
  try {
    const query = String(req.query.q ?? '').trim()

    if (query.length < 2) {
      throw badRequest('Query parameter "q" must be at least 2 characters long.')
    }

    const count = Math.min(Number(req.query.count) || 8, 20)
    const countryCode = String(req.query.countryCode ?? '').trim()

    const params = new URLSearchParams({
      name: query,
      count: String(count),
      language: 'en',
      format: 'json',
    })

    if (countryCode) {
      params.set('countryCode', countryCode)
    }

    const data = await fetchJson(`${geocodingBaseUrl}?${params.toString()}`)
    const results = (data.results ?? []).map((result) => ({
      id: result.id,
      name: result.name,
      country: result.country,
      countryCode: result.country_code,
      admin1: result.admin1 ?? '',
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
      label: getLocationLabel(result),
    }))

    res.json({ results })
  } catch (error) {
    next(error)
  }
})

app.get('/api/weather', async (req, res, next) => {
  try {
    const latitude = Number(req.query.latitude)
    const longitude = Number(req.query.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw badRequest('Query parameters "latitude" and "longitude" are required numbers.')
    }

    const timezone = String(req.query.timezone ?? 'auto')
    const units = String(req.query.units ?? 'metric') === 'imperial' ? 'imperial' : 'metric'
    const unitsConfig = getUnitsConfig(units)

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      timezone,
      forecast_days: '7',
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'precipitation',
        'weather_code',
        'is_day',
        'wind_speed_10m',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
      ].join(','),
      hourly: [
        'temperature_2m',
        'weather_code',
        'is_day',
      ].join(','),
      temperature_unit: unitsConfig.temperature_unit,
      wind_speed_unit: unitsConfig.wind_speed_unit,
      precipitation_unit: unitsConfig.precipitation_unit,
    })

    const data = await fetchJson(`${forecastBaseUrl}?${params.toString()}`)

    const daily = data.daily.time.map((date, index) => ({
      date,
      dayLabel: toDayLabel(date, data.timezone),
      fullDate: toReadableDate(date, data.timezone),
      temperatureMax: data.daily.temperature_2m_max[index],
      temperatureMin: data.daily.temperature_2m_min[index],
      weatherCode: data.daily.weather_code[index],
      conditionKey: getConditionKey(data.daily.weather_code[index]),
    }))

    const hourlyByDay = groupHourlyForecast(data.hourly, data.daily.time, data.timezone)

    res.json({
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
      units: {
        system: units,
        temperatureSymbol: unitsConfig.temperatureSymbol,
        windSpeed: unitsConfig.windSpeedUnitLabel,
        precipitation: unitsConfig.precipitationUnitLabel,
      },
      current: {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        conditionKey: getConditionKey(data.current.weather_code, data.current.is_day),
      },
      daily,
      hourlyByDay,
    })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500
  res.status(statusCode).json({
    error: true,
    message: error.message || 'Unexpected server error.',
  })
})

app.listen(port, () => {
  console.log(`Weather API listening on http://localhost:${port}`)
})
