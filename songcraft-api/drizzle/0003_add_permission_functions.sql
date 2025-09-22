-- Add permission checking functions for project-level permissions

-- Function to check if user has project permission
CREATE OR REPLACE FUNCTION has_project_permission(
    p_user_id UUID,
    p_project_id UUID,
    p_required_level VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    user_level VARCHAR(50);
    account_role VARCHAR(50);
BEGIN
    -- Check project-specific permission
    SELECT permission_level INTO user_level
    FROM project_permissions
    WHERE user_id = p_user_id AND project_id = p_project_id;
    
    -- If no project permission, check account-level permission
    IF user_level IS NULL THEN
        SELECT m.role INTO account_role
        FROM memberships m
        JOIN projects p ON m.account_id = p.account_id
        WHERE m.user_id = p_user_id AND p.id = p_project_id;
        
        -- Account owners and managers get full access
        IF account_role IN ('owner', 'manager') THEN
            RETURN TRUE;
        END IF;
        
        RETURN FALSE;
    END IF;
    
    -- Check permission level hierarchy
    RETURN CASE p_required_level
        WHEN 'read' THEN user_level IN ('read', 'read_notes', 'read_write', 'full_access')
        WHEN 'read_notes' THEN user_level IN ('read_notes', 'read_write', 'full_access')
        WHEN 'read_write' THEN user_level IN ('read_write', 'full_access')
        WHEN 'full_access' THEN user_level = 'full_access'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can participate in session
CREATE OR REPLACE FUNCTION can_participate_in_session(
    p_user_id UUID,
    p_session_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    project_id UUID;
BEGIN
    -- Get project for session
    SELECT s.project_id INTO project_id
    FROM sessions s
    WHERE s.id = p_session_id;
    
    -- Check if user has at least read_notes permission on project
    RETURN has_project_permission(p_user_id, project_id, 'read_notes');
END;
$$ LANGUAGE plpgsql;

-- Function to get user's effective permission level for a project
CREATE OR REPLACE FUNCTION get_user_project_permission(
    p_user_id UUID,
    p_project_id UUID
) RETURNS VARCHAR(50) AS $$
DECLARE
    user_level VARCHAR(50);
    account_role VARCHAR(50);
BEGIN
    -- Check project-specific permission
    SELECT permission_level INTO user_level
    FROM project_permissions
    WHERE user_id = p_user_id AND project_id = p_project_id;
    
    -- If no project permission, check account-level permission
    IF user_level IS NULL THEN
        SELECT m.role INTO account_role
        FROM memberships m
        JOIN projects p ON m.account_id = p.account_id
        WHERE m.user_id = p_user_id AND p.id = p_project_id;
        
        -- Account owners and managers get full access
        IF account_role IN ('owner', 'manager') THEN
            RETURN 'full_access';
        END IF;
        
        RETURN NULL; -- No permission
    END IF;
    
    RETURN user_level;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can create sessions for a project
CREATE OR REPLACE FUNCTION can_create_sessions(
    p_user_id UUID,
    p_project_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- User needs full_access permission to create sessions
    RETURN has_project_permission(p_user_id, p_project_id, 'full_access');
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can manage project settings
CREATE OR REPLACE FUNCTION can_manage_project(
    p_user_id UUID,
    p_project_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- User needs full_access permission to manage project
    RETURN has_project_permission(p_user_id, p_project_id, 'full_access');
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for projects and sessions tables
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
