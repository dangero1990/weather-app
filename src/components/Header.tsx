import logo from '../assets/logo.svg'
import unitIcon from '../assets/icon-units.svg'

export default function Header() {
  return (
    <header className="flex justify-between text-neutral-0">
      <img src={logo} alt="App logo" />
      <select className="bg-neutral-600 cursor-pointer">
        <option value="">Unit</option>
        <option value="fahrenheit">Fahrenheit</option>
        <option value="celsius">Celsius</option>
      </select>
    </header>
  )
}