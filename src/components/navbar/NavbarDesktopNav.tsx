
import React from "react";
import { Link } from "react-router-dom";

const NavbarDesktopNav = () => {
  return (
    <nav className="bg-pharmacy-primary text-white px-4 py-3 hidden md:block">
      <ul className="flex justify-between max-w-6xl mx-auto">
        <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
          <Link to="/categories/dilutions">DILUTIONS & POTENCIES</Link>
        </li>
        <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
          <Link to="/categories/tinctures">MOTHER TINCTURES</Link>
        </li>
        <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
          <Link to="/categories/biochemics">BIOCHEMICS</Link>
        </li>
        <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
          <Link to="/categories/tablets">TABLETS</Link>
        </li>
        <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
          <Link to="/categories/cosmetics">COSMETICS ITEMS</Link>
        </li>
        <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
          <Link to="/categories/other">OTHER PRODUCTS</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarDesktopNav;
