import logo from '../assets/logo.svg'

export default function Header () {
    return (
        <header className='flex'>
            <img src={logo} alt="" />
            <select>
                <option>select unit</option>
                <option value="">Farienheit</option>
                <option value="">Celcius</option>
            </select>
        </header>
    )
}