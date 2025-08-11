import { supabase, isSupabaseConfigured } from "./supabase"

export async function testSupabaseConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase未配置：缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY",
    }
  }

  try {
    // 测试基本连接
    const { data, error } = await supabase!.from("task_sections").select("count(*)").limit(1)

    if (error) {
      return {
        success: false,
        message: `数据库连接失败: ${error.message}`,
        details: error,
      }
    }

    // 测试表是否存在
    const { data: sections, error: sectionsError } = await supabase!.from("task_sections").select("id").limit(1)

    if (sectionsError) {
      return {
        success: false,
        message: `表结构检查失败: ${sectionsError.message}。请确保已运行初始化脚本。`,
        details: sectionsError,
      }
    }

    return {
      success: true,
      message: "Supabase连接成功！",
      details: { sectionsCount: data },
    }
  } catch (error) {
    return {
      success: false,
      message: `连接测试失败: ${error instanceof Error ? error.message : "未知错误"}`,
      details: error,
    }
  }
}
