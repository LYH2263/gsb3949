import type { Instrument } from '../types/instrument'

export const instruments: Instrument[] = [
  {
    id: 'beaker',
    name: '烧杯',
    category: 'container',
    icon: '🥛',
    description: '用于盛装液体、溶解物质或进行反应的常用容器',
    precautions: ['加热时需垫石棉网', '不可直接加热', '倾倒液体时口部应贴紧接收容器'],
    capacity: '250mL',
  },
  {
    id: 'test-tube',
    name: '试管',
    category: 'container',
    icon: '🧪',
    description: '用于少量试剂反应的管状容器',
    precautions: ['加热时试管口不得对人', '加热液体不超过容积的1/3', '用试管夹夹持'],
    capacity: '15mL',
  },
  {
    id: 'alcohol-lamp',
    name: '酒精灯',
    category: 'heating',
    icon: '🔥',
    description: '实验室常用加热工具，使用乙醇为燃料',
    precautions: ['禁止用嘴吹灭', '添加酒精时必须熄灭', '灯帽应正放防止滚落'],
  },
  {
    id: 'iron-stand',
    name: '铁架台',
    category: 'auxiliary',
    icon: '🏗️',
    description: '用于固定和支持各种仪器设备的支架',
    precautions: ['夹持仪器要稳固', '重心应在底座范围内', '铁圈位置要适当'],
  },
  {
    id: 'gas-collecting-bottle',
    name: '集气瓶',
    category: 'container',
    icon: '🫙',
    description: '用于收集和储存气体的广口瓶',
    precautions: ['瓶口要平整', '磨砂面朝下放置', '收集气体后及时盖好玻璃片'],
    capacity: '125mL',
  },
  {
    id: 'measuring-cylinder',
    name: '量筒',
    category: 'measuring',
    icon: '📏',
    description: '用于量取一定体积液体的量器',
    precautions: ['不可加热', '不可用作反应容器', '读数时视线与凹液面最低处平齐'],
    capacity: '100mL',
  },
  {
    id: 'glass-rod',
    name: '玻璃棒',
    category: 'auxiliary',
    icon: '🥢',
    description: '用于搅拌、引流或转移液体的玻璃工具',
    precautions: ['搅拌时避免碰撞容器壁', '使用后及时清洗', '轻拿轻放防止折断'],
  },
  {
    id: 'dropper',
    name: '胶头滴管',
    category: 'auxiliary',
    icon: '💧',
    description: '用于吸取和滴加少量液体的工具',
    precautions: ['专管专用', '滴加时应垂直悬空', '不可倒置'],
  },
]

export const instrumentCategories = [
  { id: 'all', name: '全部', icon: '🔬' },
  { id: 'container', name: '容器', icon: '🧪' },
  { id: 'heating', name: '加热', icon: '🔥' },
  { id: 'measuring', name: '量器', icon: '📏' },
  { id: 'auxiliary', name: '辅助', icon: '🔧' },
] as const

export type InstrumentCategory = typeof instrumentCategories[number]['id']
