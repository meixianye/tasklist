"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, CheckCircle2, Database } from "lucide-react"
import { getSQLScript } from "../lib/supabase-init"

interface SQLScriptModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function SQLScriptModal({ isOpen, onClose, onComplete }: SQLScriptModalProps) {
  const [copied, setCopied] = useState(false)
  const sqlScript = getSQLScript()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  const openSupabaseSQL = () => {
    // 尝试打开用户的Supabase项目SQL编辑器
    // 由于我们不知道具体的项目ID，打开通用SQL页面
    window.open("https://supabase.com/dashboard/project/_/sql", "_blank")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据库初始化脚本
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">请按照以下步骤操作：</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>点击下方的 "打开SQL编辑器" 按钮</li>
                  <li>复制下面的SQL脚本</li>
                  <li>在Supabase SQL编辑器中粘贴并运行脚本</li>
                  <li>等待执行完成（应该看到成功消息）</li>
                  <li>回到这里点击 "完成初始化" 按钮</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 mb-4">
            <Button onClick={openSupabaseSQL} className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              打开SQL编辑器
            </Button>
            <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2 bg-transparent">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制脚本"}
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {sqlScript}
            </pre>
            <Badge variant="secondary" className="absolute top-2 right-2">
              SQL
            </Badge>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              完成初始化
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
