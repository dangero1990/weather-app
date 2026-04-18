import logo from '../assets/logo.svg'
import dropdownIcon from '../assets/icon-dropdown.svg'
import unitIcon from '../assets/icon-units.svg'
import type { UnitsSystem } from '../types/weather'

interface HeaderProps {
  units: UnitsSystem
  onUnitsChange: (units: UnitsSystem) => void
}

export default function Header({ units, onUnitsChange }: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
        <img
          src={logo}
          alt="Weather Now"
          className="h-8 w-auto sm:h-10"
        />

        <label className="relative">
          <span className="sr-only">Select temperature units</span>
          <img
            src={unitIcon}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <img
            src={dropdownIcon}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 h-2 w-3 -translate-y-1/2"
          />
          <select
            value={units}
            onChange={(event) => onUnitsChange(event.target.value as UnitsSystem)}
            className="cursor-pointer appearance-none rounded-xl bg-neutral-700 py-3 pr-10 pl-9 text-sm font-medium text-neutral-0 outline-none transition hover:bg-neutral-600 focus:bg-neutral-600"
          >
            <option value="imperial">Units (F)</option>
            <option value="metric">Units (C)</option>
          </select>
        </label>
    </header>
  )
}
