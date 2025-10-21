/**
 * Badge Component
 *
 * Reusable badge component extracted from admin routes patterns.
 * Provides semantic variants that work with the theme system.
 */

import type React from "react";
import { cn } from "../lib/ui-utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "info"
    | "brand"
    | "outline";
  size?: "sm" | "base" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "base",
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full font-medium transition-colors";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    base: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const variantClasses = {
    default:
      "bg-surface-elevated text-fg-secondary border border-border-secondary",
    secondary: "bg-bg-secondary text-fg-secondary",
    success: "bg-bg-success text-fg-on-accent",
    warning: "bg-bg-warning text-fg-primary",
    destructive: "bg-bg-destructive text-fg-on-destructive",
    info: "bg-bg-info text-fg-info",
    brand: "bg-bg-brand text-fg-on-brand",
    outline: "border border-border-primary text-fg-primary bg-transparent",
  };

  return (
    <span
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Semantic helper components for common status patterns
interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
  statusMap?: Record<string, BadgeProps["variant"]>;
}

export function StatusBadge({ status, statusMap, ...props }: StatusBadgeProps) {
  // Default status mappings
  const defaultStatusMap: Record<string, BadgeProps["variant"]> = {
    active: "success",
    inactive: "secondary",
    pending: "warning",
    suspended: "warning",
    cancelled: "destructive",
    archived: "secondary",
    draft: "secondary",
    published: "success",
    error: "destructive",
    success: "success",
    warning: "warning",
    info: "info",
  };

  const finalStatusMap = statusMap || defaultStatusMap;
  const variant = finalStatusMap[status.toLowerCase()] || "default";

  return (
    <Badge variant={variant} {...props}>
      {status}
    </Badge>
  );
}

// Plan/tier badge for admin routes
interface PlanBadgeProps extends Omit<BadgeProps, "variant"> {
  plan: string;
}

export function PlanBadge({ plan, ...props }: PlanBadgeProps) {
  const planVariants: Record<string, BadgeProps["variant"]> = {
    free: "info",
    pro: "success",
    team: "warning",
    enterprise: "destructive",
    basic: "info",
    premium: "brand",
  };

  const variant = planVariants[plan.toLowerCase()] || "default";

  return (
    <Badge variant={variant} {...props}>
      {plan}
    </Badge>
  );
}

// Role badge for user management
interface RoleBadgeProps extends Omit<BadgeProps, "variant"> {
  role: string;
}

export function RoleBadge({ role, ...props }: RoleBadgeProps) {
  const roleVariants: Record<string, BadgeProps["variant"]> = {
    super_admin: "destructive",
    admin: "warning",
    user: "info",
    guest: "secondary",
    moderator: "brand",
    editor: "success",
  };

  const variant = roleVariants[role.toLowerCase()] || "default";

  return (
    <Badge variant={variant} {...props}>
      {role}
    </Badge>
  );
}

// Count badge for showing numbers
interface CountBadgeProps extends Omit<BadgeProps, "variant"> {
  count: number;
  label?: string;
  singular?: string;
  plural?: string;
}

export function CountBadge({
  count,
  label,
  singular = "item",
  plural = "items",
  ...props
}: CountBadgeProps) {
  const displayText = label
    ? `${count} ${label}`
    : `${count} ${count === 1 ? singular : plural}`;

  return (
    <Badge variant="outline" {...props}>
      {displayText}
    </Badge>
  );
}
