import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { GlobalRole } from "../../lib/super-user";
import projectsRoutes from "../../routes/projects";
import { createTestServer } from "../helpers/createTestServer";

const exampleProject = {
	id: "123e4567-e89b-12d3-a456-426614174100",
	accountId: "123e4567-e89b-12d3-a456-426614174000",
	name: "Project A",
	description: null as string | null,
	status: "active",
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
	createdBy: "123e4567-e89b-12d3-a456-426614174010",
	creatorName: null as string | null,
	accountName: null as string | null,
	permissions: [
		{
			userId: "123e4567-e89b-12d3-a456-426614174020",
			permissionLevel: "read_write",
			grantedAt: "2024-01-01T00:00:00.000Z",
			expiresAt: null as string | null,
			userEmail: "user@example.com",
		},
	],
	sessionsCount: 0,
};

const exampleSession = {
	id: "123e4567-e89b-12d3-a456-426614174200",
	projectId: exampleProject.id,
	name: "Session 1",
	description: null as string | null,
	sessionType: "writing",
	status: "scheduled",
	scheduledStart: "2024-01-02T00:00:00.000Z",
	scheduledEnd: null as string | null,
	actualStart: null as string | null,
	actualEnd: null as string | null,
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
	createdBy: "123e4567-e89b-12d3-a456-426614174010",
	creatorName: null as string | null,
	projectName: null as string | null,
	accountName: null as string | null,
};

describe("projects routes", () => {
	const projectService = {
		listProjects: vi.fn(),
		getProject: vi.fn(),
		createProject: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
		addProjectPermission: vi.fn(),
		removeProjectPermission: vi.fn(),
		listSessions: vi.fn(),
		getProjectSessions: vi.fn(),
	};

	const server = createTestServer({
		register: projectsRoutes,
		container: { projectService },
		decorateSuperUser: true,
		user: { clerkId: "user_123", globalRole: GlobalRole.SUPER_ADMIN },
	});

	beforeAll(async () => {
		await server.ready();
	});

	afterAll(async () => {
		await server.close();
	});

	it("GET /projects returns list with pagination", async () => {
		projectService.listProjects.mockResolvedValue({
			projects: [exampleProject],
			pagination: { total: 1 },
		});

		const res = await server.inject({
			method: "GET",
			url: "/projects?page=1&limit=10&sort=updatedAt&order=desc",
		});
		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.projects).toHaveLength(1);
		expect(json.pagination.total).toBe(1);
	});

	it("GET /projects/:id returns a project", async () => {
		projectService.getProject.mockResolvedValue(exampleProject);

		const res = await server.inject({
			method: "GET",
			url: `/projects/${exampleProject.id}`,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().project.id).toBe(exampleProject.id);
	});

	it("GET /projects/:id returns 404 when missing", async () => {
		projectService.getProject.mockResolvedValue(null);

		const res = await server.inject({
			method: "GET",
			url: "/projects/123e4567-e89b-12d3-a456-426614174999",
		});
		expect(res.statusCode).toBe(404);
	});

	it("POST /projects creates a project", async () => {
		projectService.createProject.mockResolvedValue(exampleProject);

		const res = await server.inject({
			method: "POST",
			url: "/projects",
			payload: {
				accountId: exampleProject.accountId,
				name: "Project A",
				description: "Desc",
				status: "active",
			},
		});

		expect(res.statusCode).toBe(201);
		expect(res.json().project.name).toBe("Project A");
	});

	it("PUT /projects/:id updates a project", async () => {
		projectService.updateProject.mockResolvedValue({
			...exampleProject,
			name: "Updated",
		});

		const res = await server.inject({
			method: "PUT",
			url: `/projects/${exampleProject.id}`,
			payload: { name: "Updated" },
		});

		expect(res.statusCode).toBe(200);
		expect(res.json().project.name).toBe("Updated");
	});

	it("DELETE /projects/:id deletes a project", async () => {
		projectService.deleteProject.mockResolvedValue(undefined);

		const res = await server.inject({
			method: "DELETE",
			url: `/projects/${exampleProject.id}`,
		});
		expect(res.statusCode).toBe(204);
	});

	it("POST /projects/:id/permissions adds a permission", async () => {
		projectService.addProjectPermission.mockResolvedValue({
			userId: "123e4567-e89b-12d3-a456-426614174020",
			permissionLevel: "read",
			grantedAt: "2024-01-01T00:00:00.000Z",
			expiresAt: null,
		});

		const res = await server.inject({
			method: "POST",
			url: `/projects/${exampleProject.id}/permissions`,
			payload: {
				userId: "123e4567-e89b-12d3-a456-426614174020",
				permissionLevel: "read",
			},
		});

		expect(res.statusCode).toBe(200);
		expect(res.json().permission.permissionLevel).toBe("read");
	});

	it("DELETE /projects/:id/permissions/:userId removes a permission", async () => {
		projectService.removeProjectPermission.mockResolvedValue(undefined);

		const res = await server.inject({
			method: "DELETE",
			url: `/projects/${exampleProject.id}/permissions/123e4567-e89b-12d3-a456-426614174020`,
		});

		expect(res.statusCode).toBe(204);
	});

	it("GET /sessions returns list with pagination", async () => {
		projectService.listSessions.mockResolvedValue({
			data: [exampleSession],
			pagination: { total: 1 },
		});

		const res = await server.inject({
			method: "GET",
			url: "/sessions?page=1&limit=10&sort=createdAt&order=desc",
		});
		expect(res.statusCode).toBe(200);
		const json = res.json();
		expect(json.data).toHaveLength(1);
		expect(json.pagination.total).toBe(1);
	});

	it("GET /projects/:id/sessions returns list", async () => {
		projectService.getProjectSessions.mockResolvedValue({
			data: [exampleSession],
		});

		const res = await server.inject({
			method: "GET",
			url: `/projects/${exampleProject.id}/sessions`,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().data).toHaveLength(1);
	});
});
