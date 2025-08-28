// src/types/skin.ts
export type Skin = {
	id: string;
	name: string;
	domains: string[];
	config: unknown;
	createdAt?: string;
	updatedAt?: string;
};
