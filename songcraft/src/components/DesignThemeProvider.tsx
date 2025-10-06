/**
 * LEGACY: Option 3: Hybrid Approach with Theme Provider
 *
 * ⚠️ THIS FILE IS DEPRECATED - Use ThemeProvider.tsx instead
 *
 * This approach creates a React theme provider that syncs Radix themes
 * with your design tokens, providing the best of both worlds.
 *
 * Replaced by the simpler ThemeProvider.tsx in Phase 1 consolidation.
 */
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@radix-ui/themes";

// Theme configuration types
export type ThemeColor =
	| "ruby"
	| "gray"
	| "gold"
	| "bronze"
	| "brown"
	| "yellow"
	| "amber"
	| "orange"
	| "tomato"
	| "red"
	| "crimson"
	| "pink"
	| "plum"
	| "purple"
	| "violet"
	| "iris"
	| "indigo"
	| "blue"
	| "cyan"
	| "teal"
	| "jade"
	| "green"
	| "grass"
	| "lime"
	| "mint"
	| "sky";

export type GrayColor = "gray" | "mauve" | "slate" | "sage" | "olive" | "sand";
export type Radius = "none" | "small" | "medium" | "large" | "full";
export type Scaling = "90%" | "95%" | "100%" | "105%" | "110%";
export type Appearance = "light" | "dark" | "inherit";

export interface ThemeConfig {
	accentColor: ThemeColor;
	grayColor: GrayColor;
	radius: Radius;
	scaling: Scaling;
	appearance: Appearance;
}

export interface DesignTokenTheme {
	// Brand colors that adapt to Radix accent
	brandPrimary: string;
	brandSecondary: string;
	brandTertiary: string;
	brandHover: string;
	brandActive: string;

	// Semantic colors (fixed)
	destructive: string;
	warning: string;
	success: string;

	// Neutral colors that adapt to Radix gray
	neutral1: string;
	neutral2: string;
	neutral3: string;
	neutral4: string;
	neutral5: string;
	neutral6: string;
	neutral7: string;
	neutral8: string;
	neutral9: string;
	neutral10: string;
	neutral11: string;
	neutral12: string;
}

// Theme mapping configurations
const THEME_MAPPINGS: Record<ThemeColor, DesignTokenTheme> = {
	blue: {
		brandPrimary: "hsl(217 91% 60%)",
		brandSecondary: "hsl(213 94% 68%)",
		brandTertiary: "hsl(212 96% 78%)",
		brandHover: "hsl(221 83% 53%)",
		brandActive: "hsl(224 76% 48%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	green: {
		brandPrimary: "hsl(142 76% 36%)",
		brandSecondary: "hsl(142 69% 58%)",
		brandTertiary: "hsl(142 77% 73%)",
		brandHover: "hsl(142 72% 29%)",
		brandActive: "hsl(142 69% 24%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	red: {
		brandPrimary: "hsl(0 84% 60%)",
		brandSecondary: "hsl(0 91% 71%)",
		brandTertiary: "hsl(0 94% 82%)",
		brandHover: "hsl(0 72% 51%)",
		brandActive: "hsl(0 74% 42%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	purple: {
		brandPrimary: "hsl(262 83% 58%)",
		brandSecondary: "hsl(262 69% 68%)",
		brandTertiary: "hsl(262 77% 78%)",
		brandHover: "hsl(262 72% 48%)",
		brandActive: "hsl(262 74% 38%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	// Add more theme mappings as needed...
	ruby: {
		brandPrimary: "hsl(0 84% 60%)",
		brandSecondary: "hsl(0 91% 71%)",
		brandTertiary: "hsl(0 94% 82%)",
		brandHover: "hsl(0 72% 51%)",
		brandActive: "hsl(0 74% 42%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	gray: {
		brandPrimary: "hsl(210 7% 56%)",
		brandSecondary: "hsl(210 14% 83%)",
		brandTertiary: "hsl(210 16% 93%)",
		brandHover: "hsl(210 11% 15%)",
		brandActive: "hsl(210 12% 8%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	gold: {
		brandPrimary: "hsl(38 92% 50%)",
		brandSecondary: "hsl(43 74% 66%)",
		brandTertiary: "hsl(46 87% 65%)",
		brandHover: "hsl(32 95% 44%)",
		brandActive: "hsl(26 90% 37%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	bronze: {
		brandPrimary: "hsl(21 92% 14%)",
		brandSecondary: "hsl(26 90% 37%)",
		brandTertiary: "hsl(46 87% 65%)",
		brandHover: "hsl(21 92% 14%)",
		brandActive: "hsl(21 92% 14%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	brown: {
		brandPrimary: "hsl(21 92% 14%)",
		brandSecondary: "hsl(26 90% 37%)",
		brandTertiary: "hsl(46 87% 65%)",
		brandHover: "hsl(21 92% 14%)",
		brandActive: "hsl(21 92% 14%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	yellow: {
		brandPrimary: "hsl(48 100% 96%)",
		brandSecondary: "hsl(58 86% 65%)",
		brandTertiary: "hsl(46 87% 65%)",
		brandHover: "hsl(32 95% 44%)",
		brandActive: "hsl(26 90% 37%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	amber: {
		brandPrimary: "hsl(38 92% 50%)",
		brandSecondary: "hsl(43 74% 66%)",
		brandTertiary: "hsl(46 87% 65%)",
		brandHover: "hsl(32 95% 44%)",
		brandActive: "hsl(26 90% 37%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	orange: {
		brandPrimary: "hsl(38 92% 50%)",
		brandSecondary: "hsl(43 74% 66%)",
		brandTertiary: "hsl(46 87% 65%)",
		brandHover: "hsl(32 95% 44%)",
		brandActive: "hsl(26 90% 37%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	tomato: {
		brandPrimary: "hsl(0 84% 60%)",
		brandSecondary: "hsl(0 91% 71%)",
		brandTertiary: "hsl(0 94% 82%)",
		brandHover: "hsl(0 72% 51%)",
		brandActive: "hsl(0 74% 42%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	crimson: {
		brandPrimary: "hsl(0 84% 60%)",
		brandSecondary: "hsl(0 91% 71%)",
		brandTertiary: "hsl(0 94% 82%)",
		brandHover: "hsl(0 72% 51%)",
		brandActive: "hsl(0 74% 42%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	pink: {
		brandPrimary: "hsl(320 70% 50%)",
		brandSecondary: "hsl(320 70% 60%)",
		brandTertiary: "hsl(320 70% 70%)",
		brandHover: "hsl(320 70% 40%)",
		brandActive: "hsl(320 70% 30%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	plum: {
		brandPrimary: "hsl(292 70% 50%)",
		brandSecondary: "hsl(292 70% 60%)",
		brandTertiary: "hsl(292 70% 70%)",
		brandHover: "hsl(292 70% 40%)",
		brandActive: "hsl(292 70% 30%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	violet: {
		brandPrimary: "hsl(262 83% 58%)",
		brandSecondary: "hsl(262 69% 68%)",
		brandTertiary: "hsl(262 77% 78%)",
		brandHover: "hsl(262 72% 48%)",
		brandActive: "hsl(262 74% 38%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	iris: {
		brandPrimary: "hsl(262 83% 58%)",
		brandSecondary: "hsl(262 69% 68%)",
		brandTertiary: "hsl(262 77% 78%)",
		brandHover: "hsl(262 72% 48%)",
		brandActive: "hsl(262 74% 38%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	indigo: {
		brandPrimary: "hsl(217 91% 60%)",
		brandSecondary: "hsl(213 94% 68%)",
		brandTertiary: "hsl(212 96% 78%)",
		brandHover: "hsl(221 83% 53%)",
		brandActive: "hsl(224 76% 48%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	cyan: {
		brandPrimary: "hsl(188 85% 53%)",
		brandSecondary: "hsl(188 85% 63%)",
		brandTertiary: "hsl(188 85% 73%)",
		brandHover: "hsl(188 85% 43%)",
		brandActive: "hsl(188 85% 33%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	teal: {
		brandPrimary: "hsl(142 76% 36%)",
		brandSecondary: "hsl(142 69% 58%)",
		brandTertiary: "hsl(142 77% 73%)",
		brandHover: "hsl(142 72% 29%)",
		brandActive: "hsl(142 69% 24%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	jade: {
		brandPrimary: "hsl(142 76% 36%)",
		brandSecondary: "hsl(142 69% 58%)",
		brandTertiary: "hsl(142 77% 73%)",
		brandHover: "hsl(142 72% 29%)",
		brandActive: "hsl(142 69% 24%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	grass: {
		brandPrimary: "hsl(142 76% 36%)",
		brandSecondary: "hsl(142 69% 58%)",
		brandTertiary: "hsl(142 77% 73%)",
		brandHover: "hsl(142 72% 29%)",
		brandActive: "hsl(142 69% 24%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	lime: {
		brandPrimary: "hsl(75 85% 47%)",
		brandSecondary: "hsl(75 85% 57%)",
		brandTertiary: "hsl(75 85% 67%)",
		brandHover: "hsl(75 85% 37%)",
		brandActive: "hsl(75 85% 27%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	mint: {
		brandPrimary: "hsl(142 76% 36%)",
		brandSecondary: "hsl(142 69% 58%)",
		brandTertiary: "hsl(142 77% 73%)",
		brandHover: "hsl(142 72% 29%)",
		brandActive: "hsl(142 69% 24%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
	sky: {
		brandPrimary: "hsl(188 85% 53%)",
		brandSecondary: "hsl(188 85% 63%)",
		brandTertiary: "hsl(188 85% 73%)",
		brandHover: "hsl(188 85% 43%)",
		brandActive: "hsl(188 85% 33%)",
		destructive: "hsl(0 84% 60%)",
		warning: "hsl(38 92% 50%)",
		success: "hsl(142 76% 36%)",
		neutral1: "hsl(210 20% 98%)",
		neutral2: "hsl(210 20% 95%)",
		neutral3: "hsl(210 16% 93%)",
		neutral4: "hsl(210 20% 95%)",
		neutral5: "hsl(210 16% 93%)",
		neutral6: "hsl(210 14% 89%)",
		neutral7: "hsl(210 14% 83%)",
		neutral8: "hsl(210 11% 71%)",
		neutral9: "hsl(210 7% 56%)",
		neutral10: "hsl(210 11% 15%)",
		neutral11: "hsl(210 12% 8%)",
		neutral12: "hsl(210 12% 8%)",
	},
};

// Theme context
interface ThemeContextType {
	config: ThemeConfig;
	designTokens: DesignTokenTheme;
	setTheme: (config: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme
export function useDesignTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useDesignTheme must be used within a DesignThemeProvider");
	}
	return context;
}

// Theme provider component
interface DesignThemeProviderProps {
	children: React.ReactNode;
	defaultConfig?: Partial<ThemeConfig>;
}

export function LegacyDesignThemeProvider({
	children,
	defaultConfig = {},
}: DesignThemeProviderProps) {
	const [config, setConfig] = useState<ThemeConfig>({
		accentColor: "blue",
		grayColor: "gray",
		radius: "medium",
		scaling: "100%",
		appearance: "inherit",
		...defaultConfig,
	});

	const designTokens = THEME_MAPPINGS[config.accentColor];

	// Update CSS custom properties when theme changes
	useEffect(() => {
		const root = document.documentElement;

		// Update brand colors
		root.style.setProperty("--brand-primary", designTokens.brandPrimary);
		root.style.setProperty("--brand-secondary", designTokens.brandSecondary);
		root.style.setProperty("--brand-tertiary", designTokens.brandTertiary);
		root.style.setProperty("--brand-hover", designTokens.brandHover);
		root.style.setProperty("--brand-active", designTokens.brandActive);

		// Update semantic colors
		root.style.setProperty("--bg-destructive", designTokens.destructive);
		root.style.setProperty("--bg-warning", designTokens.warning);
		root.style.setProperty("--bg-success", designTokens.success);

		// Update neutral colors
		root.style.setProperty("--surface-base", designTokens.neutral1);
		root.style.setProperty("--surface-elevated", designTokens.neutral2);
		root.style.setProperty("--surface-hover", designTokens.neutral3);
		root.style.setProperty("--surface-active", designTokens.neutral4);
		root.style.setProperty("--border-secondary", designTokens.neutral5);
		root.style.setProperty("--border-primary", designTokens.neutral6);
		root.style.setProperty("--border-hover", designTokens.neutral7);
		root.style.setProperty("--fg-tertiary", designTokens.neutral8);
		root.style.setProperty("--fg-secondary", designTokens.neutral9);
		root.style.setProperty("--fg-primary", designTokens.neutral10);
		root.style.setProperty("--fg-hover", designTokens.neutral11);
		root.style.setProperty("--fg-active", designTokens.neutral12);
	}, [designTokens]);

	const setTheme = (newConfig: Partial<ThemeConfig>) => {
		setConfig((prev) => ({ ...prev, ...newConfig }));
	};

	return (
		<ThemeContext.Provider value={{ config, designTokens, setTheme }}>
			<Theme
				accentColor={config.accentColor}
				grayColor={config.grayColor}
				radius={config.radius}
				scaling={config.scaling}
				appearance={config.appearance}
			>
				{children}
			</Theme>
		</ThemeContext.Provider>
	);
}

// Utility function to get theme-aware classes
export function getThemeClasses(
	variant: "primary" | "secondary" | "destructive" | "success" | "warning",
) {
	const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";

	switch (variant) {
		case "primary":
			return `${baseClasses} bg-brand-primary text-fg-on-brand hover:bg-brand-hover`;
		case "secondary":
			return `${baseClasses} bg-surface-hover text-fg-primary hover:bg-surface-active`;
		case "destructive":
			return `${baseClasses} bg-bg-destructive text-fg-on-destructive hover:bg-bg-destructive/90`;
		case "success":
			return `${baseClasses} bg-bg-success text-fg-on-brand hover:bg-bg-success/90`;
		case "warning":
			return `${baseClasses} bg-bg-warning text-fg-on-brand hover:bg-bg-warning/90`;
		default:
			return baseClasses;
	}
}
