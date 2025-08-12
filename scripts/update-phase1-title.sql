-- 更新第一阶段标题
UPDATE task_sections 
SET title = '第一阶段：准备和规划', 
    updated_at = NOW()
WHERE id = 'phase1';

-- 验证更新结果
SELECT id, title FROM task_sections WHERE id = 'phase1';
