import { Link } from 'react-router-dom'
import { FlaskConical, Beaker, Droplets, ArrowRight } from 'lucide-react'

const experiments = [
  {
    id: 'acid-base-neutralization',
    name: '酸碱中和反应',
    category: 'acid-base',
    difficulty: 'easy',
    description: '通过酚酞指示剂观察酸碱中和过程的颜色变化',
    icon: Droplets,
    color: 'bg-blue-500',
  },
  {
    id: 'metal-acid-reaction',
    name: '金属与酸反应',
    category: 'metal-acid',
    difficulty: 'easy',
    description: '观察锌粒与稀硫酸反应产生氢气的过程',
    icon: FlaskConical,
    color: 'bg-green-500',
  },
  {
    id: 'gas-preparation',
    name: '氧气制备',
    category: 'gas-preparation',
    difficulty: 'medium',
    description: '使用过氧化氢和二氧化锰制备氧气',
    icon: Beaker,
    color: 'bg-purple-500',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-science-light py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-slate-600">在线虚拟实验平台</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            探索化学的
            <span className="text-primary-600">奇妙世界</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            安全、互动的在线化学实验平台，专为中学生设计。
            <br className="hidden sm:block" />
            通过虚拟实验深入理解化学原理，无需担心安全问题。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/knowledge"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
            >
              开始学习
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/records"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
            >
              查看记录
            </Link>
          </div>
        </div>
      </section>

      {/* Experiments Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">热门实验</h2>
          <p className="text-slate-600">选择感兴趣的实验开始探索</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((exp) => {
            const Icon = exp.icon
            return (
              <Link
                key={exp.id}
                to={`/lab/${exp.id}`}
                className="group block bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 ${exp.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    exp.difficulty === 'easy' ? 'bg-success-light text-success-dark' : 'bg-warning-light text-warning-dark'
                  }`}>
                    {exp.difficulty === 'easy' ? '简单' : '中等'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{exp.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{exp.description}</p>
                
                <div className="flex items-center text-primary-600 font-medium text-sm">
                  开始实验
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: '虚拟器材', desc: '逼真的实验器材模拟，支持多种基础仪器', icon: '🧪' },
              { title: '安全优先', desc: '危险操作智能预警，让实验零风险', icon: '🛡️' },
              { title: '数据记录', desc: '自动记录实验数据，支持分析复盘', icon: '📊' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
