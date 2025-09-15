import { NavItem } from "./nav-item";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";

function Navigation() {
  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <nav className="grid gap-2">
        <NavItem to="/songs">Songs</NavItem>
        <NavItem to="/songs/new">New Song</NavItem>
        <NavItem to="/admin">Admin</NavItem>
      </nav>
    </>
  );
}

export default Navigation;
