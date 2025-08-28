// // Examples of using the short ID functionality
// import {
//   generateShortId,
//   generateHumanReadableId,
//   generateSongId,
//   generateUserId,
//   generateCollaborationId,
//   isValidHumanReadableId,
//   parseHumanReadableId,
//   extractPrefix,
// } from "./index";

// // Generate basic short IDs
// console.log("Basic short ID:", generateShortId()); // e.g., "aB3x9K"

// // Generate human-readable IDs with prefixes
// console.log("Song ID:", generateSongId()); // e.g., "song-aB3x9K"
// console.log("User ID:", generateUserId()); // e.g., "user-xY7mN2"
// console.log("Collab ID:", generateCollaborationId()); // e.g., "collab-pQ9vR5"

// // Generate custom prefixed IDs
// console.log("Custom ID:", generateHumanReadableId("playlist")); // e.g., "playlist-kL8wZ1"

// // Validate IDs
// const validId = "song-aB3x9K";
// const invalidId = "invalid-id-format";

// console.log("Valid ID check:", isValidHumanReadableId(validId)); // true
// console.log("Invalid ID check:", isValidHumanReadableId(invalidId)); // false

// // Parse IDs to extract components
// const parsed = parseHumanReadableId(validId);
// console.log("Parsed ID:", parsed); // { prefix: "song", shortId: "aB3x9K" }

// // Extract just the prefix
// const prefix = extractPrefix(validId);
// console.log("Prefix:", prefix); // "song"

// // Example usage in a Song object
// const newSong = {
//   id: generateSongId(),
//   title: "My New Song",
//   artist: "Artist Name",
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };

// console.log("New song with short ID:", newSong);
// // Output: { id: "song-aB3x9K", title: "My New Song", ... }
