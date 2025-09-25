import { z } from "zod";

export const orderDirectionSchema = z.enum(["asc", "desc"]);

export type OrderDirection = z.infer<typeof orderDirectionSchema>;

export const createPaginationSchema = <
	SortValues extends readonly [string, ...string[]],
>(options: {
	sortOptions: SortValues;
	defaultSort?: SortValues[number];
	defaultLimit?: number;
	maxLimit?: number;
}) => {
	const {
		sortOptions,
		defaultLimit = 20,
		maxLimit = 100,
		defaultSort,
	} = options;

	return z.object({
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce
			.number()
			.int()
			.positive()
			.max(maxLimit, { message: `limit must be <= ${maxLimit}` })
			.default(defaultLimit),
		sort: z.enum(sortOptions).default(defaultSort ?? sortOptions[0]),
		order: orderDirectionSchema.default("desc"),
	});
};

export type PaginationInput = {
	page: number;
	limit: number;
};

export const getOffset = ({ page, limit }: PaginationInput) =>
	(page - 1) * limit;

export const buildPaginationMeta = ({
	page,
	limit,
	total,
}: {
	page: number;
	limit: number;
	total: number;
}) => ({
	page,
	limit,
	total,
	pages: total > 0 ? Math.ceil(total / limit) : 0,
});
