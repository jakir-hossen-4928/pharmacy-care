
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarUserMenuProps {
  currentUser: any;
  userDetails: User | null;
  onLogout: () => Promise<void>;
}

const NavbarUserMenu = ({ currentUser, userDetails, onLogout }: NavbarUserMenuProps) => {
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Login</Link>
        </Button>

      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center">
          <UserIcon size={16} className="mr-2" />
          {/* {userDetails?.name || "Account"} */}
          {/* <span className="ml-1">{userDetails?.role === "admin" ? "Admin" : "User"}</span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          Dashboard
        </DropdownMenuItem>
        {userDetails?.role === "admin" && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard/orders")}>
          My Orders
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUserMenu;
