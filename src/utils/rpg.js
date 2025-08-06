export const roles = [
  {
    id: 1,
    name: '博客喵~',
    description: '这里是我的主要活动场地',
    image: new URL('../assets/characters/swordsman.webp', import.meta.url).href,
    route: 'https://docs.wenturc.com/'
  },
  {
    id: 2,
    name: '聊天喵~',
    description: '聊聊天呗~ 嗯？你说不太健谈？我也一样。',
    image: new URL('../assets/characters/mage.webp', import.meta.url).href,
    route: 'https://chat.wenturc.com/'
  },
  {
    id: 3,
    name: '笔记喵~',
    description: '发个帖子呗~ 你说你很内向？没关系的哦。',
    image: new URL('../assets/characters/rogue.webp', import.meta.url).href,
    route: 'https://note.wenturc.com/'
  }
]

export const dialogueScripts = {
  '文档喵~': [
    "喵~ 你来这里是为了寻找知识吗？",
    "在这里，你可以找到无尽的文档和资源喵~",
    "勇往直前，探索未知的世界喵~！",
  ],
  '聊天喵~': [
    "喵喵的智慧是无穷无尽的喵~",
    "魔法将会指引我们的未来喵！",
    "瞎说的 (*/ω＼*)",
  ],
  '笔记喵~': [
    "你选择了知识喵，敏捷与智慧并重喵！",
    "在这里，你可以记录下你的每一个想法喵~",
    "我会用我的智慧来帮助你喵~",
  ]
}
