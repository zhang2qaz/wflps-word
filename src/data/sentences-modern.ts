// ============================================================
// 现代汉语课文「句子默写」数据(各年级)
//
// 选句标准:
//   · 来自统编版课文的关键句、好句、结构句、积累背诵句
//   · 字词在该年级范围内可掌握
//   · 标点 / 修辞 / 句式有训练价值
// ============================================================

import type { Sentence } from './vocabulary';

export const MODERN_SENTENCES: Sentence[] = [
  // ───── 二年级 上(新课标 2025 秋首发版) ─────
  {
    id: 's-g2a-1', grade: 2, semester: '上', unit: 1, unitTitle: '自然奥秘', lesson: '小蝌蚪找妈妈',
    text: '小蝌蚪游来游去,过了几天,长出两条后腿。',
    tip: '注意「蝌蚪」是虫字旁,「后腿」别漏。一句话有两个动作:游来游去 + 长出后腿。',
  },
  {
    id: 's-g2a-2', grade: 2, semester: '上', unit: 1, unitTitle: '自然奥秘', lesson: '我是什么',
    text: '我会变。太阳一晒,我就变成汽。',
    tip: '两个短句,中间是句号不是逗号。「晒」要写对,日字旁。',
  },
  {
    id: 's-g2a-3', grade: 2, semester: '上', unit: 1, unitTitle: '自然奥秘', lesson: '植物妈妈有办法',
    text: '蒲公英妈妈准备了降落伞,把它送给自己的娃娃。',
    tip: '「蒲公英」是植物名,「降落伞」三个字别漏。整句用「把」字结构。',
  },
  {
    id: 's-g2a-4', grade: 2, semester: '上', unit: 3, unitTitle: '儿童生活', lesson: '彩虹',
    text: '雨停了,天上挂着一座美丽的桥。',
    tip: '简短两句。「挂」是提手旁。「一座桥」的量词「座」别用错。',
  },
  {
    id: 's-g2a-5', grade: 2, semester: '上', unit: 5, unitTitle: '思维方法', lesson: '我要的是葫芦',
    text: '他盯着小葫芦自言自语地说:「我的小葫芦,快长啊,快长啊!」',
    tip: '「自言自语」是成语。注意「:」和「」全角标点。',
  },
  {
    id: 's-g2a-6', grade: 2, semester: '上', unit: 7, unitTitle: '想象', lesson: '雪孩子',
    text: '雪孩子飞到了空中,变成了一朵很美很美的白云。',
    tip: '「很美很美」是重复加强。「云」字独体,别写多笔。',
  },
  {
    id: 's-g2a-7', grade: 2, semester: '上', unit: 8, unitTitle: '相处', lesson: '纸船和风筝',
    text: '风筝带着祝福飞到了松鼠的家,松鼠乐坏了。',
    tip: '「祝」是礻字旁,不是衤。注意「乐坏了」是口语表达。',
  },

  // ───── 二年级 下 (WFL P2,补几句新的) ─────
  {
    id: 's-g2b-4', grade: 2, semester: '下', unit: 1, unitTitle: '春天里', lesson: '找春天',
    text: '春天来了!我们几个孩子,脱掉棉袄,冲出家门,奔向田野。',
    tip: '一连串动作:脱掉、冲出、奔向。「!」放在第一句末。「棉袄」两字都难。',
  },
  {
    id: 's-g2b-5', grade: 2, semester: '下', unit: 5, unitTitle: '办法', lesson: '小马过河',
    text: '老马亲切地对小马说:「孩子,光听别人说,自己不去试试,是不行的。」',
    tip: '完整对话,引号 + 冒号 + 问句 + 「不行的」结尾。',
  },
  {
    id: 's-g2b-6', grade: 2, semester: '下', unit: 7, unitTitle: '改变', lesson: '蜘蛛开店',
    text: '蜘蛛织呀织,足足忙了一整天,终于织完了一只口罩。',
    tip: '「织呀织」重叠,「足足」「终于」表程度。',
  },

  // ───── 三年级 上 ─────
  {
    id: 's-g3a-1', grade: 3, semester: '上', unit: 1, unitTitle: '学校生活', lesson: '大青树下的小学',
    text: '上课了,不同民族的小学生,在同一间教室里学习。',
    tip: '「民族」「教室」别漏字。逗号位置注意。',
  },
  {
    id: 's-g3a-2', grade: 3, semester: '上', unit: 1, unitTitle: '学校生活', lesson: '花的学校',
    text: '于是,一群一群的花从无人知道的地方突然跑出来,在绿草上跳舞、狂欢。',
    tip: '泰戈尔比喻,「无人知道」是定语。最后用顿号分隔「跳舞、狂欢」。',
  },
  {
    id: 's-g3a-3', grade: 3, semester: '上', unit: 2, unitTitle: '秋天的景物', lesson: '秋天的雨',
    text: '秋天的雨,是一把钥匙。它带着清凉和温柔,轻轻地,轻轻地,把秋天的大门打开了。',
    tip: '比喻句。「轻轻地」重复 + 顿号。「钥匙」「温柔」是难词。',
  },
  {
    id: 's-g3a-4', grade: 3, semester: '上', unit: 3, unitTitle: '童话天地', lesson: '去年的树',
    text: '鸟儿睁大眼睛,看着灯火,看了一会儿,就唱起去年唱过的歌给灯火听。',
    tip: '「睁大」「灯火」别错。「唱过的歌」定语后置。',
  },
  {
    id: 's-g3a-5', grade: 3, semester: '上', unit: 6, unitTitle: '祖国山河', lesson: '富饶的西沙群岛',
    text: '西沙群岛也是鸟的天下。岛上有一片片茂密的树林,树林里栖息着各种海鸟。',
    tip: '「茂密」「栖息」是关键词。「一片片」叠词形容。',
  },
  {
    id: 's-g3a-6', grade: 3, semester: '上', unit: 8, unitTitle: '美好品质', lesson: '掌声',
    text: '她在大家的注视下,一摇一晃地走上了讲台。',
    tip: '「注视」「一摇一晃」拟态。',
  },

  // ───── 三年级 下 ─────
  {
    id: 's-g3b-1', grade: 3, semester: '下', unit: 1, unitTitle: '可爱的生灵', lesson: '燕子',
    text: '微风吹拂着千万条才展开带黄色嫩叶的柳丝。',
    tip: '长定语句:「才展开带黄色嫩叶的」修饰柳丝。',
  },
  {
    id: 's-g3b-2', grade: 3, semester: '下', unit: 1, unitTitle: '可爱的生灵', lesson: '荷花',
    text: '白荷花在这些大圆盘之间冒出来,有的才展开两三片花瓣儿。',
    tip: '「大圆盘」比喻荷叶。「冒出来」「展开」连用动词。',
  },
  {
    id: 's-g3b-3', grade: 3, semester: '下', unit: 3, unitTitle: '中华优秀传统文化', lesson: '纸的发明',
    text: '造纸术的发明,是中国对世界文明的伟大贡献之一。',
    tip: '陈述句。「贡献」「伟大」是高频词。',
  },
  {
    id: 's-g3b-4', grade: 3, semester: '下', unit: 3, unitTitle: '中华优秀传统文化', lesson: '赵州桥',
    text: '这座桥不但坚固,而且美观。',
    tip: '「不但…而且…」典型递进句式。',
  },
  {
    id: 's-g3b-5', grade: 3, semester: '下', unit: 7, unitTitle: '天地间的奇妙', lesson: '海底世界',
    text: '海底真是个景色奇异、物产丰富的地方。',
    tip: '总结句。「景色奇异」「物产丰富」两个四字结构。',
  },

  // ───── 四年级 上 ─────
  {
    id: 's-g4a-1', grade: 4, semester: '上', unit: 1, unitTitle: '自然之美', lesson: '观潮',
    text: '那条白线很快地向我们移来,逐渐拉长,变粗,横贯江面。',
    tip: '动词链:移来、拉长、变粗、横贯。',
  },
  {
    id: 's-g4a-2', grade: 4, semester: '上', unit: 1, unitTitle: '自然之美', lesson: '走月亮',
    text: '啊,我和阿妈走月亮。',
    tip: '反复出现的诗化短句。注意感叹词「啊」加逗号。',
  },
  {
    id: 's-g4a-3', grade: 4, semester: '上', unit: 2, unitTitle: '提问的策略', lesson: '呼风唤雨的世纪',
    text: '20 世纪是一个呼风唤雨的世纪。',
    tip: '「呼风唤雨」成语,世纪 = 一百年。阿拉伯数字+汉字混用。',
  },
  {
    id: 's-g4a-4', grade: 4, semester: '上', unit: 7, unitTitle: '家国情怀', lesson: '为中华之崛起而读书',
    text: '为中华之崛起而读书!',
    tip: '周恩来名句。「崛起」是难词。结尾感叹号。',
  },

  // ───── 四年级 下 ─────
  {
    id: 's-g4b-1', grade: 4, semester: '下', unit: 5, unitTitle: '把游览见闻写下来', lesson: '海上日出',
    text: '这不是伟大的奇观么?',
    tip: '反问句。「奇观」「么」是文言色彩的现代汉语。',
  },
  {
    id: 's-g4b-2', grade: 4, semester: '下', unit: 5, unitTitle: '把游览见闻写下来', lesson: '记金华的双龙洞',
    text: '虽说是孔隙,可也容得下一只小船进出。',
    tip: '「虽…也…」让步句。「孔隙」别写错。',
  },

  // ───── 五年级 上 ─────
  {
    id: 's-g5a-s1', grade: 5, semester: '上', unit: 1, unitTitle: '一花一鸟总关情', lesson: '白鹭',
    text: '白鹭是一首精巧的诗。',
    tip: '郭沫若的精彩比喻句。短句但要写对「精巧」「鹭」。',
  },
  {
    id: 's-g5a-s2', grade: 5, semester: '上', unit: 1, unitTitle: '一花一鸟总关情', lesson: '落花生',
    text: '人要做有用的人,不要做只讲体面,而对别人没有好处的人。',
    tip: '许地山名句。两个「人」对比。「体面」难词。',
  },
  {
    id: 's-g5a-s3', grade: 5, semester: '上', unit: 4, unitTitle: '爱国情怀', lesson: '圆明园的毁灭',
    text: '圆明园的毁灭是祖国文化史上不可估量的损失,也是世界文化史上不可估量的损失。',
    tip: '排比 + 反复。「不可估量」两次出现。',
  },

  // ───── 五年级 下 ─────
  {
    id: 's-g5b-s1', grade: 5, semester: '下', unit: 1, unitTitle: '童年往事', lesson: '祖父的园子',
    text: '一切都活了,要做什么,就做什么,要怎么样,就怎么样,都是自由的。',
    tip: '萧红名句。重复结构 + 自由。',
  },
  {
    id: 's-g5b-s2', grade: 5, semester: '下', unit: 2, unitTitle: '古典名著之旅', lesson: '草船借箭',
    text: '周瑜长叹一声,说:「诸葛亮神机妙算,我真比不上他!」',
    tip: '《三国》经典对话。「神机妙算」成语。',
  },

  // ───── 六年级 上 ─────
  {
    id: 's-g6a-s1', grade: 6, semester: '上', unit: 1, unitTitle: '触摸自然', lesson: '草原',
    text: '在这种境界里,连骏马和大牛都有时候静立不动,好像回味着草原的无限乐趣。',
    tip: '老舍。「境界」「骏马」「回味」三个难词。',
  },
  {
    id: 's-g6a-s2', grade: 6, semester: '上', unit: 1, unitTitle: '触摸自然', lesson: '丁香结',
    text: '愁怨缠绕在心头,像丁香结一样,解不开。',
    tip: '宗璞比喻。「缠绕」「丁香结」是中心意象。',
  },

  // ───── 六年级 下 ─────
  {
    id: 's-g6b-s1', grade: 6, semester: '下', unit: 1, unitTitle: '民风民俗', lesson: '北京的春节',
    text: '腊七腊八,冻死寒鸦,这是一年里最冷的时候。',
    tip: '老舍。俗语开头 + 注解。「寒鸦」「冻死」夸张。',
  },
  {
    id: 's-g6b-s2', grade: 6, semester: '下', unit: 3, unitTitle: '让真情自然流露', lesson: '那个星期天',
    text: '可是母亲并没有忘,只是太忙。',
    tip: '史铁生。两个短句,转折关系。',
  },
];
