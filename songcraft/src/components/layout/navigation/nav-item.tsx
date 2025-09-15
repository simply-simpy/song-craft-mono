import { Link, type LinkProps } from "@tanstack/react-router";

interface NavItemProps extends Omit<LinkProps, "children"> {
  children: React.ReactNode;
  className?: string;
}

function NavItem({ to, children, ...props }: NavItemProps) {
  return (
    <Link to={to} className="px-3 py-2 rounded-md hover:bg-gray-50" {...props}>
        {children}
    </Link>
  );
}

export { NavItem };
