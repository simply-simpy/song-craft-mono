import { relations } from "drizzle-orm/relations";
import { songs, lyricVersions, orgs, accounts, users, memberships, songAuthors, songAccountLinks } from "./schema";

export const lyricVersionsRelations = relations(lyricVersions, ({one}) => ({
	song: one(songs, {
		fields: [lyricVersions.songId],
		references: [songs.id]
	}),
}));

export const songsRelations = relations(songs, ({many}) => ({
	lyricVersions: many(lyricVersions),
	songAuthors: many(songAuthors),
	songAccountLinks: many(songAccountLinks),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
	org: one(orgs, {
		fields: [accounts.orgId],
		references: [orgs.id]
	}),
	user: one(users, {
		fields: [accounts.ownerUserId],
		references: [users.id]
	}),
	memberships: many(memberships),
	songAccountLinks: many(songAccountLinks),
}));

export const orgsRelations = relations(orgs, ({many}) => ({
	accounts: many(accounts),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	memberships: many(memberships),
	songAuthors: many(songAuthors),
}));

export const membershipsRelations = relations(memberships, ({one}) => ({
	user: one(users, {
		fields: [memberships.userId],
		references: [users.id]
	}),
	account: one(accounts, {
		fields: [memberships.accountId],
		references: [accounts.id]
	}),
}));

export const songAuthorsRelations = relations(songAuthors, ({one}) => ({
	song: one(songs, {
		fields: [songAuthors.songId],
		references: [songs.id]
	}),
	user: one(users, {
		fields: [songAuthors.userId],
		references: [users.id]
	}),
}));

export const songAccountLinksRelations = relations(songAccountLinks, ({one}) => ({
	song: one(songs, {
		fields: [songAccountLinks.songId],
		references: [songs.id]
	}),
	account: one(accounts, {
		fields: [songAccountLinks.accountId],
		references: [accounts.id]
	}),
}));