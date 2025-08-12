import { supabase, isSupabaseConfigured } from "./supabase"

export async function checkTablesExist(): Promise<{
  tablesExist: boolean
  missingTables: string[]
  details: any
}> {
  if (!supabase) {
    return {
      tablesExist: false,
      missingTables: ["supabase not configured"],
      details: null,
    }
  }

  const missingTables: string[] = []
  const details: any = {}

  try {
    // 检查 task_sections 表
    const { data: sectionsData, error: sectionsError } = await supabase.from("task_sections").select("id").limit(1)

    if (sectionsError) {
      missingTables.push("task_sections")
      details.sectionsError = sectionsError.message
    } else {
      details.sectionsExists = true
    }

    // 检查 tasks 表
    const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("id").limit(1)

    if (tasksError) {
      missingTables.push("tasks")
      details.tasksError = tasksError.message
    } else {
      details.tasksExists = true
    }

    return {
      tablesExist: missingTables.length === 0,
      missingTables,
      details,
    }
  } catch (error) {
    return {
      tablesExist: false,
      missingTables: ["connection_error"],
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    }
  }
}

export async function insertInitialData(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: "Supabase未配置",
    }
  }

  try {
    // 首先检查表是否存在
    const { tablesExist, missingTables } = await checkTablesExist()

    if (!tablesExist) {
      return {
        success: false,
        message: `数据库表不存在: ${missingTables.join(", ")}。请先在Supabase SQL编辑器中运行建表脚本。`,
      }
    }

    // 检查是否已有数据
    const { data: existingSections, error: checkError } = await supabase.from("task_sections").select("id").limit(1)

    if (checkError) {
      throw new Error(`检查现有数据失败: ${checkError.message}`)
    }

    if (existingSections && existingSections.length > 0) {
      return {
        success: true,
        message: "数据库已包含数据，无需重复初始化。",
      }
    }

    // 插入任务阶段
    const { error: sectionsError } = await supabase.from("task_sections").insert([
      { id: "phase1", title: "第一阶段：准备和规划", order_index: 1 },
      { id: "phase2", title: "第二阶段：数据收集", order_index: 2 },
      { id: "phase3", title: "第三阶段：分析与撰写", order_index: 3 },
    ])

    if (sectionsError) {
      throw new Error(`插入阶段数据失败: ${sectionsError.message}`)
    }

    // 插入任务
    const { error: tasksError } = await supabase.from("tasks").insert([
      {
        id: "task1",
        section_id: "phase1",
        title: "用10分钟，列出对报告的所有疑问（不求完美，目标是头脑风暴）",
        completed: false,
        order_index: 1,
      },
      {
        id: "task2",
        section_id: "phase1",
        title: "创建一个简单的报告大纲，确定需要分析的关键维度",
        completed: false,
        order_index: 2,
      },
      {
        id: "task3",
        section_id: "phase1",
        title: "安排15分钟与主管沟通，确认报告范围和期望（记住：提问是专业的表现，不是能力不足）",
        completed: false,
        order_index: 3,
      },
      {
        id: "task4",
        section_id: "phase2",
        title: "为每个产品分配30分钟，收集基本信息（使用番茄工作法，每30分钟休息5分钟）",
        completed: false,
        order_index: 1,
      },
      {
        id: "task5",
        section_id: "phase2",
        title: "咨询产品部门获取数据或测试（记住：团队合作是工作的一部分）",
        completed: false,
        order_index: 2,
      },
      {
        id: "task6",
        section_id: "phase3",
        title: "创建比较表格，突出各产品的优缺点",
        completed: false,
        order_index: 1,
      },
      {
        id: "task7",
        section_id: "phase3",
        title: "撰写初稿（不求完美，目标是有一个可迭代的版本）",
        completed: false,
        order_index: 2,
      },
      {
        id: "task8",
        section_id: "phase3",
        title: "请一位信任的同事审阅并提供优化建议",
        completed: false,
        order_index: 3,
      },
      {
        id: "task9",
        section_id: "phase3",
        title: "根据反馈修改并完善报告",
        completed: false,
        order_index: 4,
      },
    ])

    if (tasksError) {
      throw new Error(`插入任务数据失败: ${tasksError.message}`)
    }

    return {
      success: true,
      message: "初始数据插入成功！",
    }
  } catch (error) {
    return {
      success: false,
      message: `初始化失败: ${error instanceof Error ? error.message : "未知错误"}`,
      details: error,
    }
  }
}

export function getSQLScript(): string {
  return `-- Task List 数据库初始化脚本
-- 请在 Supabase SQL 编辑器中运行此脚本

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

-- 验证数据插入
SELECT 'task_sections' as table_name, count(*) as record_count FROM task_sections
UNION ALL
SELECT 'tasks' as table_name, count(*) as record_count FROM tasks;`
}
