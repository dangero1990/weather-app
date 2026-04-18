import drizzleIcon from '../assets/icon-drizzle.webp'
import fogIcon from '../assets/icon-fog.webp'
import overcastIcon from '../assets/icon-overcast.webp'
import partlyCloudyIcon from '../assets/icon-partly-cloudy.webp'
import rainIcon from '../assets/icon-rain.webp'
import snowIcon from '../assets/icon-snow.webp'
import stormIcon from '../assets/icon-storm.webp'
import sunnyIcon from '../assets/icon-sunny.webp'
import type { ConditionKey } from '../types/weather'

const iconMap: Record<ConditionKey, { src: string; alt: string }> = {
  sunny: { src: sunnyIcon, alt: 'Sunny' },
  'partly-cloudy': { src: partlyCloudyIcon, alt: 'Partly cloudy' },
  overcast: { src: overcastIcon, alt: 'Overcast' },
  fog: { src: fogIcon, alt: 'Foggy' },
  drizzle: { src: drizzleIcon, alt: 'Drizzle' },
  rain: { src: rainIcon, alt: 'Rain' },
  snow: { src: snowIcon, alt: 'Snow' },
  storm: { src: stormIcon, alt: 'Thunderstorm' },
}

export function getWeatherIcon(conditionKey: ConditionKey) {
  return iconMap[conditionKey]
}
