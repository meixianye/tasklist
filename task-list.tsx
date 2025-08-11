"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Cloud, CloudOff, Loader2, AlertCircle, Settings, Database } from "lucide-react"
import { supabase, isSupabaseConfigured, type TaskSection, type Task } from "./lib/supabase"
import { testSupabaseConnection } from "./lib/supabase-test"
import { checkTablesExist, insertInitialData } from "./lib/supabase-init"
import { SQLScriptModal } from "./components/sql-script-modal"

interface TaskSectionWithTasks extends TaskSection {
  tasks: Task[]
}

type ConnectionStatus = "not-configured" | "connecting" | "connected" | "error" | "needs-init"

export default function TaskList() {
  const [taskSections, setTaskSections] = useState<TaskSectionWithTasks[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("not-configured")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [showSQLModal, setShowSQLModal] = useState(false)

  // 检查Supabase配置并加载数据
  useEffect(() => {
    if (isSupabaseConfigured()) {
      checkDatabaseAndLoad()
    } else {
      setConnectionStatus("not-configured")
      setIsLoading(false)
      loadDefaultTasks()
    }
  }, [])

  const checkDatabaseAndLoad = async () => {
    try {
      setIsLoading(true)
      setConnectionStatus("connecting")
      setError(null)

      // 首先检查表是否存在
      const { tablesExist, missingTables, details } = await checkTablesExist()

      if (!tablesExist) {
        setConnectionStatus("needs-init")
        setError(`数据库表不存在: ${missingTables.join(", ")}。需要运行初始化脚本。`)
        loadDefaultTasks()
        return
      }

      // 表存在，尝试加载数据
      await loadTasksFromSupabase()
    } catch (err) {
      console.error("检查数据库时出错:", err)
      setError(err instanceof Error ? err.message : "未知错误")
      setConnectionStatus("error")
      loadDefaultTasks()
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasksFromSupabase = async () => {
    if (!supabase) return

    try {
      setConnectionStatus("connecting")
      setError(null)

      // 加载任务阶段
      const { data: sections, error: sectionsError } = await supabase
        .from("task_sections")
        .select("*")
        .order("order_index")

      if (sectionsError) {
        throw new Error(`加载阶段失败: ${sectionsError.message}`)
      }

      // 加载任务
      const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").order("order_index")

      if (tasksError) {
        throw new Error(`加载任务失败: ${tasksError.message}`)
      }

      // 组合数据
      const sectionsWithTasks: TaskSectionWithTasks[] =
        sections?.map((section) => ({
          ...section,
          tasks: tasks?.filter((task) => task.section_id === section.id) || [],
        })) || []

      setTaskSections(sectionsWithTasks)
      setConnectionStatus("connected")
    } catch (err) {
      console.error("Supabase error:", err)
      setError(err instanceof Error ? err.message : "未知错误")
      setConnectionStatus("error")
      loadDefaultTasks()
    }
  }

  const loadDefaultTasks = () => {
    const defaultSections: TaskSectionWithTasks[] = [
      {
        id: "phase1",
        title: "第一阶段：准备与规划",
        order_index: 1,
        tasks: [
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
        ],
      },
      {
        id: "phase2",
        title: "第二阶段：数据收集",
        order_index: 2,
        tasks: [
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
        ],
      },
      {
        id: "phase3",
        title: "第三阶段：分析与撰写",
        order_index: 3,
        tasks: [
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
        ],
      },
    ]
    setTaskSections(defaultSections)
  }

  // 计算总体完成进度
  const totalTasks = taskSections.reduce((sum, section) => sum + section.tasks.length, 0)
  const completedTasks = taskSections.reduce(
    (sum, section) => sum + section.tasks.filter((task) => task.completed).length,
    0,
  )
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const isAllCompleted = completedTasks === totalTasks && totalTasks > 0

  // 切换任务完成状态并保存到Supabase
  const toggleTaskCompletion = async (sectionId: string, taskId: string) => {
    // 先更新本地状态
    const updatedSections = taskSections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            tasks: section.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
          }
        : section,
    )
    setTaskSections(updatedSections)

    // 如果连接到Supabase，则保存到数据库
    if (connectionStatus === "connected" && supabase) {
      try {
        const task = updatedSections
          .find((section) => section.id === sectionId)
          ?.tasks.find((task) => task.id === taskId)

        if (task) {
          const { error } = await supabase
            .from("tasks")
            .update({
              completed: task.completed,
              updated_at: new Date().toISOString(),
            })
            .eq("id", taskId)

          if (error) {
            console.error("保存任务状态失败:", error)
          }
        }
      } catch (err) {
        console.error("更新任务状态时出错:", err)
      }
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "not-configured":
        return <Settings className="w-4 h-4 text-gray-500" />
      case "connecting":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "connected":
        return <Cloud className="w-4 h-4 text-green-500" />
      case "needs-init":
        return <Database className="w-4 h-4 text-orange-500" />
      case "error":
        return <CloudOff className="w-4 h-4 text-red-500" />
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "not-configured":
        return "未配置云端数据库"
      case "connecting":
        return "连接中..."
      case "connected":
        return "已连接云端数据"
      case "needs-init":
        return "需要初始化数据库"
      case "error":
        return "连接失败，使用本地数据"
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "not-configured":
        return "text-gray-600"
      case "connecting":
        return "text-gray-600"
      case "connected":
        return "text-green-600"
      case "needs-init":
        return "text-orange-600"
      case "error":
        return "text-red-600"
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    const result = await testSupabaseConnection()

    if (result.success) {
      setError(null)
      checkDatabaseAndLoad()
    } else {
      setError(result.message)
    }
    setIsTestingConnection(false)
  }

  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    const result = await insertInitialData()

    if (result.success) {
      setError(null)
      await loadTasksFromSupabase()
    } else {
      setError(result.message)
    }
    setIsInitializing(false)
  }

  const handleSQLModalComplete = () => {
    setShowSQLModal(false)
    checkDatabaseAndLoad()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载任务列表中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题和连接状态 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">任务列表</h1>
            <div className="flex items-center gap-2 text-sm">
              {getConnectionStatusIcon()}
              <span className={`font-medium ${getConnectionStatusColor()}`}>{getConnectionStatusText()}</span>
            </div>
          </div>

          {/* Supabase未配置提示 */}
          {connectionStatus === "not-configured" && (
            <Alert className="mb-4">
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>要启用云端数据存储，请配置Supabase集成。当前使用本地数据模式。</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 bg-transparent"
                    onClick={() => window.open("https://supabase.com/dashboard/new", "_blank")}
                  >
                    配置Supabase
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 需要初始化数据库 */}
          {connectionStatus === "needs-init" && (
            <Alert className="mb-4">
              <Database className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium mb-1">数据库需要初始化</p>
                    <p className="text-sm">检测到Supabase连接正常，但缺少必要的数据表。</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => setShowSQLModal(true)}>
                      <Database className="w-3 h-3 mr-1" />
                      运行SQL脚本
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleInitializeDatabase}
                      disabled={isInitializing}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isInitializing ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          插入数据中...
                        </>
                      ) : (
                        "插入初始数据"
                      )}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 错误提示 */}
          {error && (connectionStatus === "error" || connectionStatus === "needs-init") && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 bg-transparent"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        测试中...
                      </>
                    ) : (
                      "重试连接"
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 进度条区域 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">整体进度</span>
                <div className="flex items-center gap-2">
                  {isAllCompleted && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      已完成
                    </Badge>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {completedTasks}/{totalTasks} ({progressPercentage}%)
                  </span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </CardContent>
          </Card>
        </div>

        {/* 任务列表 */}
        <div className="space-y-6">
          {taskSections.map((section) => {
            const sectionCompletedTasks = section.tasks.filter((task) => task.completed).length
            const sectionProgress =
              section.tasks.length > 0 ? Math.round((sectionCompletedTasks / section.tasks.length) * 100) : 0

            return (
              <Card key={section.id} className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-800">{section.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {sectionCompletedTasks}/{section.tasks.length}
                    </Badge>
                  </div>
                  <Progress value={sectionProgress} className="h-2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                          task.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleTaskCompletion(section.id, task.id)}
                      >
                        <Checkbox
                          checked={task.completed}
                          onChange={() => {}} // 由父元素的onClick处理
                          className="mt-0.5"
                        />
                        <span
                          className={`flex-1 text-sm leading-relaxed transition-all duration-200 ${
                            task.completed ? "text-gray-500 line-through" : "text-gray-700"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 完成状态提示 */}
        {isAllCompleted && (
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">恭喜！所有任务已完成！</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SQL脚本模态框 */}
      <SQLScriptModal
        isOpen={showSQLModal}
        onClose={() => setShowSQLModal(false)}
        onComplete={handleSQLModalComplete}
      />
    </div>
  )
}
