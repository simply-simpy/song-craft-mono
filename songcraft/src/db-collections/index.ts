import { z } from "@songcraft/shared";
import {
	createCollection,
	localOnlyCollectionOptions,
} from "@tanstack/react-db";

const MessageSchema = z.object({
	id: z.number(),
	text: z.string(),
	user: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

export const messagesCollection = createCollection(
	localOnlyCollectionOptions({
		getKey: (message) => message.id,
		schema: MessageSchema,
	}),
);
