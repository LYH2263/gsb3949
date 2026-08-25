import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { experimentApi } from '../../services/api'
import {
  useBackendExperiments,
  type BackendExperimentRecord,
} from './useBackendExperimentRecorder'
import {
  History,
  FlaskConical,
  Clock,
  CheckCircle2,
  Trash2,
  Download,
  BarChart3,
} from 'lucide-react'
import { useUIStore } from '../../store'

function calculateDurationSeconds(record: BackendExperimentRecord) {
  if (!record.completed_at) {
    return 0
  }
  const startMs = new Date(record.started_at).getTime()
  const endMs = new Date(record.completed_at).getTime()
  return Math.max(0, Math.floor((endMs - startMs) / 1000))
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}分${secs}秒`
}

export default function RecordList() {
  const { records, isLoading, error, refetch } = useBackendExperiments()
  const { addToast, openModal, closeModal } = useUIStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const stats = useMemo(() => {
    const totalExperiments = records.length
    const completedExperiments = records.filter((record) => record.status === 'completed').length
    const totalDuration = records.reduce(
      (sum, record) => sum + calculateDurationSeconds(record),
      0
    )
    const byCategory = records.reduce<Record<string, number>>((acc, record) => {
      acc[record.experiment_type] = (acc[record.experiment_type] || 0) + 1
      return acc
    }, {})

    return {
      totalExperiments,
      successRate: totalExperiments === 0 ? 0 : (completedExperiments / totalExperiments) * 100,
      totalDuration,
      categoryCount: Object.keys(byCategory).length,
    }
  }, [records])

  const handleExport = (record: BackendExperimentRecord) => {
    const json = JSON.stringify(record, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `experiment-${record.experiment_type}-${record.id}.json`
    a.click()
    URL.revokeObjectURL(url)

    addToast({
      type: 'success',
      title: '导出成功',
      message: '实验记录已下载',
    })
  }

  const handleDelete = async (id: number) => {
    openModal({
      title: '确认删除',
      content: (
        <div className="text-slate-600">
          <p>确定要删除这条记录吗？</p>
          <p className="text-sm text-slate-500 mt-2">此操作不可恢复。</p>
        </div>
      ),
      actions: [
        {
          label: '取消',
          variant: 'secondary',
          onClick: () => {
            closeModal()
          },
        },
        {
          label: '确定删除',
          variant: 'danger',
          onClick: async () => {
            closeModal()
            setDeletingId(id)
            try {
              await experimentApi.delete(id)
              await refetch()
              addToast({
                type: 'success',
                title: '删除成功',
                message: '记录已删除',
              })
            } catch {
              addToast({
                type: 'error',
                title: '删除失败',
                message: '请稍后重试',
              })
            } finally {
              setDeletingId(null)
            }
          },
        },
      ],
    })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <History className="w-8 h-8 text-primary-600" />
                实验记录
              </h1>
              <p className="text-slate-600 mt-2">查看和管理你的实验历史</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={refetch}
                className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                刷新
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                开始新实验
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">总实验次数</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalExperiments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-slate-500">成功率</p>
                <p className="text-2xl font-bold text-slate-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-slate-500">总时长</p>
                <p className="text-2xl font-bold text-slate-900">{formatDuration(stats.totalDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-science-light rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-science" />
              </div>
              <div>
                <p className="text-sm text-slate-500">实验类型</p>
                <p className="text-2xl font-bold text-slate-900">{stats.categoryCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-900">记录列表</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">加载中...</div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-danger mb-4">{error}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  重试
                </button>
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无实验记录</h3>
                <p className="text-slate-600 mb-4">完成实验后，记录将自动保存在这里</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  开始新实验
                </Link>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{record.title}</h3>
                        {record.status === 'completed' ? (
                          <span className="px-2 py-0.5 bg-success-light text-success-dark text-xs rounded-full">
                            成功
                          </span>
                        ) : record.status === 'failed' ? (
                          <span className="px-2 py-0.5 bg-danger-light text-danger-dark text-xs rounded-full">
                            失败
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-warning-light text-warning-dark text-xs rounded-full">
                            进行中
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>{new Date(record.started_at).toLocaleString('zh-CN')}</span>
                        <span>时长: {formatDuration(calculateDurationSeconds(record))}</span>
                        <span>完成: {record.steps_completed}/{record.total_steps} 步</span>
                        <span>类型: {record.experiment_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExport(record)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="导出JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="p-2 text-slate-400 hover:text-danger hover:bg-danger-light rounded-lg transition-colors disabled:opacity-50"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
