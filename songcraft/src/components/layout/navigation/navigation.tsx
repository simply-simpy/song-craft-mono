import {
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/clerk-react";
import { SiSuperuser } from "react-icons/si";
import { NavItem } from "./nav-item";

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
				<ul className="menu bg-base-200 rounded-box w-56">
					<li>
						<NavItem to="/songs">Songs</NavItem>
					</li>
					<li>
						<NavItem to="/songs/new">New Song</NavItem>
					</li>
					<li>
						<NavItem to="/projects">Projects</NavItem>
					</li>
					<li>
						<NavItem to="/sessions">Sessions</NavItem>
					</li>
					<li>
						<NavItem to="/theme">Theme Showcase</NavItem>
					</li>
					<li>
						<details open>
							<summary>Admin</summary>
							<ul>
								<li>
									<NavItem to="/admin/orgs">
										<SiSuperuser /> Organizations
									</NavItem>
								</li>
								<li>
									<NavItem to="/admin/accounts">Accounts</NavItem>
								</li>
								<li>
									<NavItem to="/admin/users">Users</NavItem>
								</li>
								<li>{/* <NavItem to="/admin/stats">Stats</NavItem> */}</li>
								<li>
									{/* <NavItem to="/admin/audit-logs">Audit Logs</NavItem> */}
								</li>
							</ul>
						</details>
					</li>
				</ul>
			</nav>
		</>
	);
}

export default Navigation;
