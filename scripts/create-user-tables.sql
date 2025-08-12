-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 修改任务表，添加用户关联
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 禁用RLS (Row Level Security) - Demo用途
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_sections DISABLE ROW LEVEL SECURITY;

-- 验证表结构
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'task_sections' as table_name, count(*) as record_count FROM task_sections
UNION ALL
SELECT 'tasks' as table_name, count(*) as record_count FROM tasks;
