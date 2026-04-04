import logo from '../assets/logo.svg'

export default function Header() {
  return (
    <header className="flex justify-between text-neutral-0">
      <img src={logo} alt="App logo" />
      <select className="bg-netural-600 cursor-pointer">
        <option value="">Select unit</option>
        <option value="fahrenheit">Fahrenheit</option>
        <option value="celsius">Celsius</option>
      </select>
    </header>
  )
}