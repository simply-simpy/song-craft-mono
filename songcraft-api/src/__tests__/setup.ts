import { config } from "dotenv";
import { afterAll, beforeAll, beforeEach } from "vitest";

// Load test environment variables
config({ path: "../../.env" });

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
	process.env.DATABASE_URL ||
	"postgresql://test:test@localhost:5433/songcraft_test";

beforeAll(async () => {
	// Global test setup
	console.log("Setting up test environment...");
});

afterAll(async () => {
	// Global test cleanup
	console.log("Cleaning up test environment...");
});

beforeEach(() => {
	// Reset any global state before each test
});
