"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Database, Key, Globe } from "lucide-react"

export function SupabaseSetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">配置Supabase集成</h1>
        <p className="text-gray-600">按照以下步骤启用云端数据存储功能</p>
      </div>

      {/* 步骤1: 创建Supabase项目 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
              1
            </Badge>
            <Globe className="w-5 h-5" />
            创建Supabase项目
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">首先需要在Supabase创建一个新项目</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open("https://supabase.com/dashboard/new", "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              打开Supabase控制台
            </Button>
          </div>
          <Alert>
            <AlertDescription>
              在Supabase控制台中：
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>点击 "New Project"</li>
                <li>选择组织（或创建新组织）</li>
                <li>输入项目名称，例如 "task-list-demo"</li>
                <li>设置数据库密码（请记住此密码）</li>
                <li>选择地区（建议选择离你最近的地区）</li>
                <li>点击 "Create new project"</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 步骤2: 获取项目配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
              2
            </Badge>
            <Key className="w-5 h-5" />
            获取项目配置信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">项目创建完成后，获取连接所需的配置信息</p>
          <Alert>
            <AlertDescription>
              在项目控制台中：
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>进入项目控制台</li>
                <li>点击左侧菜单的 "Settings" → "API"</li>
                <li>
                  在 "Project Configuration" 部分找到：
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      <strong>Project URL</strong> - 这是你的 SUPABASE_URL
                    </li>
                    <li>
                      <strong>anon public</strong> - 这是你的 SUPABASE_ANON_KEY
                    </li>
                  </ul>
                </li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 步骤3: 配置环境变量 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
              3
            </Badge>
            <Database className="w-5 h-5" />
            配置环境变量
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">在v0中添加Supabase集成，系统会自动配置环境变量</p>
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">需要配置的环境变量：</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-sm">
                  <span>NEXT_PUBLIC_SUPABASE_URL=你的项目URL</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_URL=")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-sm">
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_ANON_KEY=")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 步骤4: 初始化数据库 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
              4
            </Badge>
            <Database className="w-5 h-5" />
            初始化数据库
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">运行SQL脚本创建必要的表结构</p>
          <Alert>
            <AlertDescription>
              配置完环境变量后：
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>刷新页面</li>
                <li>系统会自动检测到Supabase配置</li>
                <li>点击 "运行初始化脚本" 按钮</li>
                <li>等待脚本执行完成</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="text-center pt-6">
        <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
          配置完成，刷新页面
        </Button>
      </div>
    </div>
  )
}
