/**
 * Navigation Components
 * 
 * Reusable navigation components extracted from route patterns.
 * Provides consistent styling for links and navigation elements.
 */

import React from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { cn } from "../../lib/ui-utils";

interface NavLinkProps extends LinkProps {
  variant?: "primary" | "secondary" | "brand" | "muted";
  size?: "sm" | "base" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ 
  variant = "primary",
  size = "base",
  className,
  children,
  ...props 
}: NavLinkProps) {
  const baseClasses = "inline-flex items-center font-medium transition-colors hover:underline";
  
  const sizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg"
  };
  
  const variantClasses = {
    primary: "text-fg-primary hover:text-fg-brand",
    secondary: "text-fg-secondary hover:text-fg-primary", 
    brand: "text-fg-brand hover:text-brand-hover",
    muted: "text-fg-tertiary hover:text-fg-secondary"
  };

  return (
    <Link
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

interface ActionLinkProps extends NavLinkProps {
  icon?: React.ReactNode;
  description?: string;
}

export function ActionLink({ 
  icon, 
  description,
  children,
  className,
  ...props 
}: ActionLinkProps) {
  return (
    <NavLink 
      className={cn(
        "flex items-center gap-3 p-3 rounded-md",
        "hover:bg-surface-hover hover:no-underline",
        "border border-transparent hover:border-border-secondary",
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <div className="flex-1">
        <div className="font-medium">{children}</div>
        {description && (
          <div className="text-sm text-fg-tertiary mt-1">{description}</div>
        )}
      </div>
    </NavLink>
  );
}

interface NavMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function NavMenu({ children, className }: NavMenuProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

interface NavGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function NavGroup({ title, children, className }: NavGroupProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <div className="px-3 py-2 text-xs font-semibold text-fg-tertiary uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    to?: string;
  }>;
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ 
  items, 
  separator = "/",
  className 
}: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && (
            <span className="text-fg-tertiary">{separator}</span>
          )}
          {item.to || item.href ? (
            item.to ? (
              <Link 
                to={item.to}
                className="text-fg-secondary hover:text-fg-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <a 
                href={item.href}
                className="text-fg-secondary hover:text-fg-primary hover:underline"
              >
                {item.label}
              </a>
            )
          ) : (
            <span className="text-fg-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Back link for navigation
interface BackLinkProps extends NavLinkProps {
  label?: string;
}

export function BackLink({ label = "Back", className, ...props }: BackLinkProps) {
  return (
    <NavLink 
      variant="secondary"
      size="sm"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      <svg 
  
        className="w-4 h-4" 
        fill="none" 
        aria-hidden="true"
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      {label}
    </NavLink>
  );
}

// Tab-style navigation
interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ children, className }: TabsProps) {
  return (
    <div className={cn(
      "border-b border-border-secondary", 
      className
    )}>
      <nav className="flex space-x-8">
        {children}
      </nav>
    </div>
  );
}

interface TabProps extends NavLinkProps {
  active?: boolean;
}

export function Tab({ active, className, children, ...props }: TabProps) {
  return (
    <NavLink
      className={cn(
        "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
        active 
          ? "border-brand-primary text-fg-brand" 
          : "border-transparent text-fg-secondary hover:text-fg-primary hover:border-border-secondary hover:no-underline",
        className
      )}
      {...props}
    >
      {children}
    </NavLink>
  );
}