-- V7__seed_initial_data.sql

-- Inserir usuários de teste
INSERT INTO users (email, full_name, profile, password, active)
VALUES
  ('professor@example.com', 'Prof. Maria Silva', 'ORIENTADOR', 'hashed_password_123', true),
  ('aluno1@example.com', 'João dos Santos', 'ORIENTANDO', 'hashed_password_456', true),
  ('aluno2@example.com', 'Ana Paula Costa', 'ORIENTANDO', 'hashed_password_789', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir projetos de exemplo
INSERT INTO projects (orientador_id, title, description, project_type, start_date, end_date, status)
SELECT 
  u.id,
  'Análise de Performance em Microsserviços',
  'Estudo sobre otimização de performance em arquiteturas de microsserviços com Docker e Kubernetes',
  'TCC',
  '2024-03-01'::DATE,
  '2024-12-31'::DATE,
  'ACTIVE'
FROM users u WHERE u.email = 'professor@example.com'
ON CONFLICT DO NOTHING;

-- Inserir orientandos nos projetos
INSERT INTO project_orientandos (project_id, orientando_id, role)
SELECT 
  p.id,
  u.id,
  'ORIENTANDO'
FROM projects p
CROSS JOIN users u
WHERE p.title = 'Análise de Performance em Microsserviços'
  AND u.email IN ('aluno1@example.com', 'aluno2@example.com')
ON CONFLICT (project_id, orientando_id) DO NOTHING;
