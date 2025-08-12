-- 创建任务阶段表
CREATE TABLE IF NOT EXISTS task_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES task_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_section_id ON tasks(section_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_task_sections_order ON task_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(section_id, order_index);

-- 禁用RLS (Row Level Security) - 仅用于Demo
ALTER TABLE task_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 插入初始数据
INSERT INTO task_sections (id, title, order_index) VALUES
  ('phase1', '第一阶段：准备和规划', 1),
  ('phase2', '第二阶段：数据收集', 2),
  ('phase3', '第三阶段：分析与撰写', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

INSERT INTO tasks (id, section_id, title, completed, order_index) VALUES
  ('task1', 'phase1', '用10分钟，列出对报告的所有疑问（不求完美，目标是头脑风暴）', false, 1),
  ('task2', 'phase1', '创建一个简单的报告大纲，确定需要分析的关键维度', false, 2),
  ('task3', 'phase1', '安排15分钟与主管沟通，确认报告范围和期望（记住：提问是专业的表现，不是能力不足）', false, 3),
  ('task4', 'phase2', '为每个产品分配30分钟，收集基本信息（使用番茄工作法，每30分钟休息5分钟）', false, 1),
  ('task5', 'phase2', '咨询产品部门获取数据或测试（记住：团队合作是工作的一部分）', false, 2),
  ('task6', 'phase3', '创建比较表格，突出各产品的优缺点', false, 1),
  ('task7', 'phase3', '撰写初稿（不求完美，目标是有一个可迭代的版本）', false, 2),
  ('task8', 'phase3', '请一位信任的同事审阅并提供优化建议', false, 3),
  ('task9', 'phase3', '根据反馈修改并完善报告', false, 4)
ON CONFLICT (id) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();
