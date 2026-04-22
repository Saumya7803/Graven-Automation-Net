-- Grant admin role to sales@gravenautomation.com
INSERT INTO user_roles (user_id, role)
VALUES ('e6fdd2a1-8dbf-44d7-90a8-72ef0ca942b3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;