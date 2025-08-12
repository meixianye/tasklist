import { supabase, isSupabaseConfigured } from "./supabase"
import crypto from "crypto"

export interface User {
  id: number
  username: string
  created_at?: string
  updated_at?: string
}

export interface AuthResult {
  success: boolean
  message: string
  user?: User
}

// 简单的MD5哈希函数（仅用于Demo）
function hashPassword(password: string): string {
  return crypto.createHash("md5").update(password).digest("hex")
}

// 用户注册
export async function registerUser(username: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: "数据库未配置",
    }
  }

  try {
    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single()

    if (existingUser) {
      return {
        success: false,
        message: "用户名已存在",
      }
    }

    // 创建新用户
    const passwordHash = hashPassword(password)
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          username,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single()

    if (insertError) {
      throw new Error(`注册失败: ${insertError.message}`)
    }

    // 为新用户初始化任务
    await initializeUserTasks(newUser.id)

    return {
      success: true,
      message: "注册成功",
      user: {
        id: newUser.id,
        username: newUser.username,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "注册失败",
    }
  }
}

// 用户登录
export async function loginUser(username: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: "数据库未配置",
    }
  }

  try {
    const passwordHash = hashPassword(password)

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, created_at, updated_at")
      .eq("username", username)
      .eq("password_hash", passwordHash)
      .single()

    if (error || !user) {
      return {
        success: false,
        message: "用户名或密码错误",
      }
    }

    return {
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "登录失败",
    }
  }
}

// 为新用户初始化任务
async function initializeUserTasks(userId: number): Promise<void> {
  if (!supabase) return

  try {
    // 插入用户专属任务
    const { error } = await supabase.from("tasks").insert([
      {
        id: `task1_user${userId}`,
        section_id: "phase1",
        user_id: userId,
        title: "用10分钟，列出对报告的所有疑问（不求完美，目标是头脑风暴）",
        completed: false,
        order_index: 1,
      },
      {
        id: `task2_user${userId}`,
        section_id: "phase1",
        user_id: userId,
        title: "创建一个简单的报告大纲，确定需要分析的关键维度",
        completed: false,
        order_index: 2,
      },
      {
        id: `task3_user${userId}`,
        section_id: "phase1",
        user_id: userId,
        title: "安排15分钟与主管沟通，确认报告范围和期望（记住：提问是专业的表现，不是能力不足）",
        completed: false,
        order_index: 3,
      },
      {
        id: `task4_user${userId}`,
        section_id: "phase2",
        user_id: userId,
        title: "为每个产品分配30分钟，收集基本信息（使用番茄工作法，每30分钟休息5分钟）",
        completed: false,
        order_index: 1,
      },
      {
        id: `task5_user${userId}`,
        section_id: "phase2",
        user_id: userId,
        title: "咨询产品部门获取数据或测试（记住：团队合作是工作的一部分）",
        completed: false,
        order_index: 2,
      },
      {
        id: `task6_user${userId}`,
        section_id: "phase3",
        user_id: userId,
        title: "创建比较表格，突出各产品的优缺点",
        completed: false,
        order_index: 1,
      },
      {
        id: `task7_user${userId}`,
        section_id: "phase3",
        user_id: userId,
        title: "撰写初稿（不求完美，目标是有一个可迭代的版本）",
        completed: false,
        order_index: 2,
      },
      {
        id: `task8_user${userId}`,
        section_id: "phase3",
        user_id: userId,
        title: "请一位信任的同事审阅并提供优化建议",
        completed: false,
        order_index: 3,
      },
      {
        id: `task9_user${userId}`,
        section_id: "phase3",
        user_id: userId,
        title: "根据反馈修改并完善报告",
        completed: false,
        order_index: 4,
      },
    ])

    if (error) {
      console.error("初始化用户任务失败:", error)
    }
  } catch (error) {
    console.error("初始化用户任务时出错:", error)
  }
}

// 本地存储用户信息
export function saveUserToStorage(user: User): void {
  localStorage.setItem("currentUser", JSON.stringify(user))
}

export function getUserFromStorage(): User | null {
  try {
    const userStr = localStorage.getItem("currentUser")
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export function clearUserFromStorage(): void {
  localStorage.removeItem("currentUser")
}
