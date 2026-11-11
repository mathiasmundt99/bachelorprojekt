import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="logo">
        <div className="logo-icon">✳</div>
        <span>THREADLY</span>
      </NavLink>

      <nav>
        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/Inventory">Thread stash</NavLink>

        <NavLink to="/canvas">Canvas</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
