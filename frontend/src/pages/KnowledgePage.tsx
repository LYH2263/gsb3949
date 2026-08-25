import { useParams } from 'react-router-dom'
import { BookOpen, Beaker, Lightbulb, ListOrdered } from 'lucide-react'

const experimentData: Record<string, {
  name: string
  description: string
  principle: string
  equation: string
  steps: string[]
  phenomena: string[]
}> = {
  'acid-base-neutralization': {
    name: '酸碱中和反应',
    description: '通过酚酞指示剂观察盐酸与氢氧化钠的中和过程',
    principle: '酸和碱反应生成盐和水，这个过程叫做中和反应。酸中的氢离子(H⁺)与碱中的氢氧根离子(OH⁻)结合生成水。',
    equation: 'HCl + NaOH → NaCl + H₂O',
    steps: [
      '取一只干净的烧杯，加入约50mL稀氢氧化钠溶液',
      '滴入2-3滴酚酞指示剂，溶液变为红色',
      '用胶头滴管逐滴加入稀盐酸，同时用玻璃棒搅拌',
      '观察溶液颜色变化，当红色刚好褪去时停止滴加',
      '记录消耗的盐酸体积',
    ],
    phenomena: [
      '酚酞指示剂使碱液呈现红色',
      '加入盐酸后红色逐渐变浅',
      '中和点时溶液变为无色',
      '反应过程中溶液温度略有升高（放热反应）',
    ],
  },
  'metal-acid-reaction': {
    name: '金属与酸反应',
    description: '观察锌粒与稀硫酸反应产生氢气的过程',
    principle: '活泼金属与酸反应生成盐和氢气。锌是活泼金属，能与稀硫酸发生置换反应。',
    equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑',
    steps: [
      '取一支试管，加入少量锌粒',
      '用试管夹夹持试管，倾斜约45度',
      '沿试管壁缓慢加入稀硫酸',
      '观察气泡产生情况',
      '用燃着的木条靠近试管口检验气体（发出爆鸣声）',
    ],
    phenomena: [
      '锌粒表面产生大量气泡',
      '锌粒逐渐溶解变小',
      '产生的气体为无色无味',
      '点燃时产生淡蓝色火焰并发出爆鸣声',
    ],
  },
  'gas-preparation': {
    name: '氧气制备',
    description: '使用过氧化氢溶液在二氧化锰催化下分解制备氧气',
    principle: '过氧化氢在二氧化锰催化作用下分解生成水和氧气。二氧化锰作为催化剂加快反应速率但本身不参与消耗。',
    equation: '2H₂O₂ →(MnO₂) 2H₂O + O₂↑',
    steps: [
      '检查装置气密性',
      '在锥形瓶中加入少量二氧化锰',
      '通过分液漏斗加入过氧化氢溶液',
      '用排水法或向上排空气法收集氧气',
      '用带火星的木条检验收集的气体',
    ],
    phenomena: [
      '加入过氧化氢后迅速产生大量气泡',
      '二氧化锰作为催化剂保持不变',
      '收集的气体能使带火星的木条复燃',
      '反应放热，瓶壁略有升温',
    ],
  },
}

export default function KnowledgePage() {
  const { experimentId } = useParams()

  if (experimentId) {
    const exp = experimentData[experimentId]
    
    if (!exp) {
      return (
        <div className="min-h-[calc(100vh-8rem)] bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">实验未找到</h1>
            <p className="text-slate-600">请返回知识库选择其他实验</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-science p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">{exp.name}</h1>
              <p className="text-primary-100">{exp.description}</p>
            </div>

            <div className="p-6 space-y-8">
              {/* 原理 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  <h2 className="text-lg font-bold text-slate-900">实验原理</h2>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="text-2xl font-mono text-center text-primary-600 py-4">
                    {exp.equation}
                  </div>
                </div>
                
                <p className="text-slate-600 leading-relaxed">{exp.principle}</p>
              </section>

              <hr className="border-slate-200" />

              {/* 步骤 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ListOrdered className="w-5 h-5 text-science" />
                  <h2 className="text-lg font-bold text-slate-900">操作步骤</h2>
                </div>
                
                <ol className="space-y-3">
                  {exp.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <hr className="border-slate-200" />

              {/* 现象 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Beaker className="w-5 h-5 text-success" />
                  <h2 className="text-lg font-bold text-slate-900">实验现象</h2>
                </div>
                
                <ul className="space-y-2">
                  {exp.phenomena.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-science rounded-full mt-2" />
                      <span className="text-slate-700">{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 知识库列表页
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">知识库</h1>
          <p className="text-slate-600">学习实验原理和操作步骤</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(experimentData).map(([id, exp]) => (
            <a
              key={id}
              href={`/knowledge/${id}`}
              className="group block bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center"
                >
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{exp.name}</h3>
                </div>
              </div>
              
              <p className="text-slate-600 text-sm mb-4">{exp.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">查看详情 →</span>
                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                  {exp.equation}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
