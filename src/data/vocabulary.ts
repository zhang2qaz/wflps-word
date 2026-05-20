// ============================================================
// 统编版（部编版）二年级下册 · 第五单元「办法」· 词语默写
// 课文 12 寓言二则 / 课文 13 画杨桃 / 课文 14 小马过河
// 数据来源：WFL 国际部二下第五单元词语默写卷（已逐词核对）
// 每个词条带「科学记忆」元数据：字形拆解、形声字规律、
// 字族、易混字、寓言故事、语境例句
// ============================================================

export type CharKind = '象形' | '指事' | '会意' | '形声' | '独体';

export type CharInfo = {
  c: string;            // 单个汉字
  pinyin: string;       // 该字读音
  radical?: string;     // 部首
  strokes?: number;     // 笔画数
  split?: string;       // 字形拆解，如「土 + 者」
  kind?: CharKind;      // 造字法
  hook?: string;        // 记忆联想 / 口诀
  family?: string;      // 字族：同部件 / 同声旁的字
  warn?: string;        // 易混字提醒
};

export type Word = {
  id: string;
  char: string;          // 词语
  pinyin: string;        // 带声调拼音
  meaning: string;       // 释义
  semester: '上' | '下';
  unit: number;
  unitTitle: string;
  lesson: string;        // 所属课文
  type: 'idiom' | 'word';// 成语 / 普通词语
  examples: string[];    // 组词
  sentence: string;      // 语境例句
  tip: string;           // 整词记忆要点
  chars: CharInfo[];     // 逐字拆解
  story?: string;        // 寓言 / 成语故事
  custom?: boolean;      // 用户导入
};

const UNIT = { semester: '下' as const, unit: 5, unitTitle: '办法' };

// ---- 可复用的常见字拆解 ----
const C = {
  羊: { c: '羊', pinyin: 'yáng', radical: '羊', strokes: 6, split: '独体字', kind: '象形' as CharKind, hook: '像羊头：上面两点是羊角，下面是羊脸。' },
  力: { c: '力', pinyin: 'lì', radical: '力', strokes: 2, split: '独体字', kind: '象形' as CharKind, hook: '像一把用力的耒（农具），出力就要用「力」。' },
  口: { c: '口', pinyin: 'kǒu', radical: '口', strokes: 3, split: '独体字', kind: '象形' as CharKind, hook: '就是一张嘴的形状。' },
  手: { c: '手', pinyin: 'shǒu', radical: '手', strokes: 4, split: '独体字', kind: '象形' as CharKind, hook: '像一只张开五指的手。' },
};

export const WORDS: Word[] = [
  // ===================== 课文 12 寓言二则 =====================
  {
    id: 'd5-01', char: '亡羊补牢', pinyin: 'wáng yáng bǔ láo',
    meaning: '羊丢了再去修羊圈。比喻出了问题以后想办法补救，可以防止继续受损失。',
    ...UNIT, lesson: '寓言二则', type: 'idiom',
    examples: ['亡羊补牢，为时不晚'],
    sentence: '虽然作业本弄丢了，但亡羊补牢，他马上重新整理了书包。',
    tip: '把成语拆成画面：丢了「羊」→ 去「补」→ 修「牢」（羊圈）。四个字就是一个完整的小故事。',
    story: '从前有个人养了一圈羊。一天早上他发现少了一只——原来羊圈破了个窟窿，狼夜里把羊叼走了。邻居劝他赶快修羊圈，他却说：「羊都丢了，还修什么？」第二天，又少了一只羊。他后悔没听劝告，赶紧把窟窿堵上、把羊圈修得结结实实。从此再也没丢过羊。',
    chars: [
      { c: '亡', pinyin: 'wáng', radical: '亠', strokes: 3, split: '亠 + 𠃊', kind: '会意', hook: '「亡」表示丢失、没有了。这里是「丢失」的意思——不是死亡。', warn: '别多写一横写成「云」。' },
      { ...C.羊 },
      { c: '补', pinyin: 'bǔ', radical: '衤', strokes: 7, split: '衤 + 卜', kind: '形声', hook: '左边「衤」是衣字旁——补衣服。右边「卜」表音(bǔ)。', family: '衤(衣字旁)：补、被、衬、袖——都和「衣服布料」有关。', warn: '是「衤」(衣字旁，两点)，不是「礻」(示字旁，一点)！' },
      { c: '牢', pinyin: 'láo', radical: '牛', strokes: 7, split: '宀 + 牛', kind: '会意', hook: '「宀」是房顶，把「牛」关在屋里——关牲口的圈就是「牢」。这里指羊圈。' },
    ],
  },
  {
    id: 'd5-02', char: '劝告', pinyin: 'quàn gào',
    meaning: '拿道理劝人，希望他改正错误或接受意见。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['接受劝告', '好心的劝告'],
    sentence: '街坊劝告他赶快修羊圈，他却不听。',
    tip: '劝告 = 用「力」+ 用「口」：花力气、开口讲道理。',
    chars: [
      { c: '劝', pinyin: 'quàn', radical: '力', strokes: 4, split: '又 + 力', kind: '形声', hook: '右边「力」——劝人要花力气、费口舌。', family: '力字旁：劝、加、办、动——都和「出力气」有关。' },
      { c: '告', pinyin: 'gào', radical: '口', strokes: 7, split: '⺧ + 口', kind: '会意', hook: '下面有「口」——开口把话告诉别人。' },
    ],
  },
  {
    id: 'd5-03', char: '丢失', pinyin: 'diū shī',
    meaning: '东西不见了、弄丢了。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['丢失东西', '丢失钥匙'],
    sentence: '他丢失了一只羊，心里很着急。',
    tip: '「丢」=「去」字头上加一撇：东西一撇就「去」了，没了。',
    chars: [
      { c: '丢', pinyin: 'diū', radical: '丿', strokes: 6, split: '丿 + 去', kind: '会意', hook: '「去」字上面加一撇——东西「一撇就去了」，记成「丢」。', warn: '上面只有一撇，别写成「失」。' },
      { c: '失', pinyin: 'shī', radical: '丿', strokes: 5, split: '丿 + 夫(变形)', kind: '指事', hook: '手里的东西滑掉了——「失」就是失去。', warn: '「失」上面是撇，「丢」上面也是撇但中间是「去」——别混。' },
    ],
  },
  {
    id: 'd5-04', char: '揠苗助长', pinyin: 'yà miáo zhù zhǎng',
    meaning: '把禾苗往上拔，想帮它快长，结果禾苗全枯死了。比喻急于求成，反而把事情弄坏。',
    ...UNIT, lesson: '寓言二则', type: 'idiom',
    examples: ['学习不能揠苗助长'],
    sentence: '练琴要一步一步来，揠苗助长只会让人厌烦。',
    tip: '记顺序：「揠(拔)苗」→ 想「助(帮)」它「长」。一个想走捷径反而坏事的故事。',
    story: '宋国有个农夫，天天到田里看禾苗，嫌它们长得太慢。一天他想出个「办法」：把每一棵禾苗都往上拔高一点。从中午一直忙到太阳落山，累得筋疲力尽。回家他对家人说：「今天可把我累坏了，我帮禾苗都长高啦！」他儿子跑到田里一看——禾苗全都枯死了。',
    chars: [
      { c: '揠', pinyin: 'yà', radical: '扌', strokes: 12, split: '扌 + 匽', kind: '形声', hook: '「扌」提手旁——用手把苗往上拔。右边「匽」表音。', family: '扌(提手旁)：揠、拔、摆、拦、挡、掉——都是「手的动作」。' },
      { c: '苗', pinyin: 'miáo', radical: '艹', strokes: 8, split: '艹 + 田', kind: '会意', hook: '「田」里长出「艹」(草)——田里冒出的嫩芽就是「苗」。' },
      { c: '助', pinyin: 'zhù', radical: '力', strokes: 7, split: '且 + 力', kind: '形声', hook: '右边「力」——帮助就是出力气。「且」表音。', family: '力字旁：助、劝、加、动。' },
      { c: '长', pinyin: 'zhǎng', radical: '丿', strokes: 4, split: '独体字', kind: '象形', hook: '多音字！这里读 zhǎng(生长)；读 cháng 时是「长短」的长。' },
    ],
  },
  {
    id: 'd5-05', char: '累坏', pinyin: 'lèi huài',
    meaning: '累得很厉害、吃不消了。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['累坏了', '把人累坏'],
    sentence: '农夫拔了一天苗，累坏了。',
    tip: '「累」上面是「田」，下面是「糸」(丝)：在田里干活干到像被丝线缠住，动不了——累。',
    chars: [
      { c: '累', pinyin: 'lèi', radical: '糸', strokes: 11, split: '田 + 糸', kind: '会意', hook: '上「田」下「糸」(丝线)：田里活儿多，像被绳子缠住——又累又重。' },
      { c: '坏', pinyin: 'huài', radical: '土', strokes: 7, split: '土 + 不', kind: '形声', hook: '「土」字旁 + 「不」：土墙「不」好了，就是「坏」。「不」也提示读音。', family: '土字旁：坏、地、场、堵——都和「泥土、地方」有关。' },
    ],
  },
  {
    id: 'd5-06', char: '枯死', pinyin: 'kū sǐ',
    meaning: '草木失去水分，干枯死掉。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['禾苗枯死', '大树枯死'],
    sentence: '禾苗被拔高后，第二天全都枯死了。',
    tip: '「枯」是典型形声字：木字旁告诉你「和树木有关」，「古」告诉你读音。',
    chars: [
      { c: '枯', pinyin: 'kū', radical: '木', strokes: 9, split: '木 + 古', kind: '形声', hook: '「木」(树木)+「古」(声旁，gǔ→kū)。树木老「古」了、没水了，就枯。', family: '木字旁：枯、树、林、桃、柳——都和「树木」有关。' },
      { c: '死', pinyin: 'sǐ', radical: '歹', strokes: 6, split: '歹 + 匕', kind: '会意', hook: '「歹」表示不好的事——「死」就是生命结束。' },
    ],
  },
  {
    id: 'd5-07', char: '堵住', pinyin: 'dǔ zhù',
    meaning: '把窟窿、通道封起来，使它不通。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['堵住窟窿', '堵住门口'],
    sentence: '他把羊圈的窟窿堵住，狼就进不来了。',
    tip: '堵 + 住 都是形声字：「堵」用土堵，「住」是人停下。',
    chars: [
      { c: '堵', pinyin: 'dǔ', radical: '土', strokes: 11, split: '土 + 者', kind: '形声', hook: '「土」(用土)+「者」(声旁 zhě→dǔ)。用土把洞填上——堵。', family: '声旁「者」家族：堵、都、者——读音都和「zhě/dū/dǔ」相近。' },
      { c: '住', pinyin: 'zhù', radical: '亻', strokes: 7, split: '亻 + 主', kind: '形声', hook: '「亻」(人)+「主」(声旁 zhǔ→zhù)。人停下来=住。', family: '声旁「主」家族：住、注、柱、驻——都读 zhù。' },
    ],
  },
  {
    id: 'd5-08', char: '焦急', pinyin: 'jiāo jí',
    meaning: '非常着急、心里像火烧一样。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['焦急地等待', '心情焦急'],
    sentence: '禾苗长得慢，农夫在田边焦急地转来转去。',
    tip: '「焦」下面是四点底「灬」(火)；「急」下面是「心」。火烧着心——所以焦急。',
    chars: [
      { c: '焦', pinyin: 'jiāo', radical: '灬', strokes: 12, split: '隹 + 灬', kind: '会意', hook: '「隹」是短尾鸟，「灬」是火。鸟在火上烤——烤焦了！着急也像被火烤。' },
      { c: '急', pinyin: 'jí', radical: '心', strokes: 9, split: '⺈ + 彐 + 心', kind: '形声', hook: '下面是「心」——着急是心里的感觉。', family: '心字底：急、想、意、愿、念——都和「心里想的」有关。' },
    ],
  },
  {
    id: 'd5-09', char: '后悔', pinyin: 'hòu huǐ',
    meaning: '事情过后才觉得自己做错了，心里懊恼。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['后悔莫及', '感到后悔'],
    sentence: '他后悔没有早点听街坊的劝告。',
    tip: '「悔」是竖心旁「忄」——后悔是一种心情。记住：和心情有关的字常带「忄」。',
    chars: [
      { c: '后', pinyin: 'hòu', radical: '口', strokes: 6, split: '丆 + 一 + 口', kind: '会意', hook: '「后」表示时间上的「以后、后来」。' },
      { c: '悔', pinyin: 'huǐ', radical: '忄', strokes: 10, split: '忄 + 每', kind: '形声', hook: '「忄」(竖心旁=心情)+「每」(声旁 měi→huǐ)。心里难受=后悔。', family: '忄(竖心旁)：悔、悦、惊、情——都是「心里的感觉」。', warn: '「悔」(忄) 和「诲」(讠) 一个用心、一个用嘴，别写反！' },
    ],
  },
  {
    id: 'd5-10', char: '羊圈', pinyin: 'yáng juàn',
    meaning: '关羊的栏圈。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['修羊圈', '走进羊圈'],
    sentence: '羊圈破了个窟窿，狼就钻进来了。',
    tip: '「圈」是多音字！羊圈读 juàn，圆圈、圈起来读 quān。外面「囗」表示「围起来」。',
    chars: [
      { ...C.羊 },
      { c: '圈', pinyin: 'juàn', radical: '囗', strokes: 11, split: '囗 + 卷', kind: '形声', hook: '大「囗」把东西围起来。多音字：羊圈 juàn / 圆圈 quān。', warn: '多音字：juàn(羊圈)、quān(圆圈)——读对才不会写错。' },
    ],
  },
  {
    id: 'd5-11', char: '叼走', pinyin: 'diāo zǒu',
    meaning: '用嘴衔着拿走。',
    ...UNIT, lesson: '寓言二则', type: 'word',
    examples: ['被狼叼走', '叼走骨头'],
    sentence: '夜里狼从窟窿钻进去，叼走了一只羊。',
    tip: '「叼」是口字旁——用「嘴」叼。和「嘴」有关的字常带「口」。',
    chars: [
      { c: '叼', pinyin: 'diāo', radical: '口', strokes: 5, split: '口 + 刁', kind: '形声', hook: '「口」(用嘴)+「刁」(声旁 diāo)。用嘴衔着=叼。', family: '口字旁：叼、吃、哈、告——都和「嘴」有关。' },
      { c: '走', pinyin: 'zǒu', radical: '走', strokes: 7, split: '土 + 龰', kind: '会意', hook: '下面像两只脚——迈步就是「走」。' },
    ],
  },
  {
    id: 'd5-12', char: '筋疲力尽', pinyin: 'jīn pí lì jìn',
    meaning: '形容非常疲乏，一点力气都没有了。',
    ...UNIT, lesson: '寓言二则', type: 'idiom',
    examples: ['累得筋疲力尽'],
    sentence: '农夫拔了一整天禾苗，弄得筋疲力尽。',
    tip: '四个字拆开记：「筋」(肌肉)+「疲」(累)+「力」(力气)+「尽」(没了)——肌肉累了、力气没了。',
    chars: [
      { c: '筋', pinyin: 'jīn', radical: '⺮', strokes: 12, split: '⺮ + 月 + 力', kind: '会意', hook: '「月」是肉月旁(和身体有关)+「力」——身上有力气的部分=筋。' },
      { c: '疲', pinyin: 'pí', radical: '疒', strokes: 10, split: '疒 + 皮', kind: '形声', hook: '「疒」病字旁——累得像生病。「皮」表音(pí)。', family: '疒(病字旁)：疲、病、疼、痛——都和「身体不舒服」有关。' },
      { ...C.力 },
      { c: '尽', pinyin: 'jìn', radical: '尸', strokes: 6, split: '尺 + 丶丶', kind: '会意', hook: '「尽」表示完了、一点不剩。力气用「尽」。' },
    ],
  },

  // ===================== 课文 13 画杨桃 =====================
  {
    id: 'd5-13', char: '教室', pinyin: 'jiào shì',
    meaning: '学校里上课的房间。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['走进教室', '安静的教室'],
    sentence: '上课了，同学们安静地坐在教室里。',
    tip: '「室」是宝盖头「宀」——表示房屋。和房子有关的字常带「宀」。',
    chars: [
      { c: '教', pinyin: 'jiào', radical: '攵', strokes: 11, split: '孝 + 攵', kind: '会意', hook: '「攵」(反文旁)表示手拿教鞭——教导。多音字：教室 jiào / 教书 jiāo。' },
      { c: '室', pinyin: 'shì', radical: '宀', strokes: 9, split: '宀 + 至', kind: '形声', hook: '「宀」(宝盖头=房屋)+「至」(声旁 zhì→shì)。房间=室。', family: '宀(宝盖头)：室、家、宝、安——都和「房屋」有关。' },
    ],
  },
  {
    id: 'd5-14', char: '前排', pinyin: 'qián pái',
    meaning: '前面的一排。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['坐在前排', '前排同学'],
    sentence: '老师把那幅画摆在讲台上，让前排同学先看。',
    tip: '「排」是提手旁「扌」+「非」：用手把东西排成一行。「非」也提示读音。',
    chars: [
      { c: '前', pinyin: 'qián', radical: '丷', strokes: 9, split: '丷 + 一 + 月 + 刂', kind: '会意', hook: '「前」表示方位——前面、前边。' },
      { c: '排', pinyin: 'pái', radical: '扌', strokes: 11, split: '扌 + 非', kind: '形声', hook: '「扌」(用手)+「非」(声旁 fēi→pái)。用手摆成一行=排。', family: '扌(提手旁)：排、摆、拦、挡、掉——都是手的动作。' },
    ],
  },
  {
    id: 'd5-15', char: '而且', pinyin: 'ér qiě',
    meaning: '连词，表示更进一步，相当于「并且、还」。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['不但…而且…'],
    sentence: '他画得很认真，而且画的是自己真正看到的样子。',
    tip: '「而且」是两个独体字。「而」原本画的是胡须，「且」要写满五横（中间三横）。',
    chars: [
      { c: '而', pinyin: 'ér', radical: '而', strokes: 6, split: '独体字', kind: '象形', hook: '「而」古时候画的是下巴上的胡须，后来借去当连词用。' },
      { c: '且', pinyin: 'qiě', radical: '一', strokes: 5, split: '独体字', kind: '指事', hook: '「且」里面是两横，加上下两横，一共像层层叠起。', warn: '里面是两横，别少写或多写。' },
    ],
  },
  {
    id: 'd5-16', char: '老老实实', pinyin: 'lǎo lǎo shí shí',
    meaning: '形容很诚实、规规矩矩，不耍小聪明。',
    ...UNIT, lesson: '画杨桃', type: 'idiom',
    examples: ['老老实实做人', '老老实实做事'],
    sentence: '他老老实实地把自己看到的杨桃画了出来。',
    tip: 'AABB 式词语：把「老实」两个字各读两遍。写的时候「老」「实」各写两遍即可。',
    chars: [
      { c: '老', pinyin: 'lǎo', radical: '耂', strokes: 6, split: '耂 + 匕', kind: '象形', hook: '「耂」(老字头)画的是老人弯腰拄拐的样子。' },
      { c: '实', pinyin: 'shí', radical: '宀', strokes: 8, split: '宀 + 头', kind: '会意', hook: '「宀」(屋子)下面装满东西——屋里充实=实。', family: '宀(宝盖头)：实、室、家、安。' },
    ],
  },
  {
    id: 'd5-17', char: '时候', pinyin: 'shí hou',
    meaning: '时间里的某一点或某一段。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['小时候', '什么时候'],
    sentence: '上图画课的时候，老师让大家画杨桃。',
    tip: '「时」是日字旁——时间和太阳(日)有关。「候」中间别忘了那一小竖。',
    chars: [
      { c: '时', pinyin: 'shí', radical: '日', strokes: 7, split: '日 + 寸', kind: '形声', hook: '「日」(太阳)告诉你和「时间」有关；「寸」表音。', family: '日字旁：时、明、晚、星、晴——都和「太阳、光、时间」有关。' },
      { c: '候', pinyin: 'hòu', radical: '亻', strokes: 10, split: '亻 + 𠉢', kind: '形声', hook: '「亻」单人旁。注意中间有一短竖，别漏。', warn: '「候」中间有一竖，「侯」没有——别写错。' },
    ],
  },
  {
    id: 'd5-18', char: '班级', pinyin: 'bān jí',
    meaning: '学校里按年级编成的学习集体。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['我们班级', '班级活动'],
    sentence: '这件事在班级里传开了，大家都很佩服他。',
    tip: '「班」是两个「王」(玉)中间一把「刀」——用刀把玉分成几份，就像把学生分成几个班。',
    chars: [
      { c: '班', pinyin: 'bān', radical: '王', strokes: 10, split: '王 + 刂 + 王', kind: '会意', hook: '两块「玉」(王)中间一把刀(刂)——把玉分开，引申为「分成的组」。' },
      { c: '级', pinyin: 'jí', radical: '纟', strokes: 6, split: '纟 + 及', kind: '形声', hook: '「纟」绞丝旁 +「及」(声旁 jí)。', family: '纟(绞丝旁)：级、红、绿、给——多和「丝线、连接」有关。' },
    ],
  },
  {
    id: 'd5-19', char: '哈哈大笑', pinyin: 'hā hā dà xiào',
    meaning: '形容放声大笑的样子。',
    ...UNIT, lesson: '画杨桃', type: 'idiom',
    examples: ['逗得哈哈大笑'],
    sentence: '看到那幅像五角星的杨桃，同学们哈哈大笑。',
    tip: '「哈」「笑」都和发声、表情有关：「哈」是口字旁(嘴里发声)，「笑」是竹字头。',
    chars: [
      { c: '哈', pinyin: 'hā', radical: '口', strokes: 9, split: '口 + 合', kind: '形声', hook: '「口」(嘴里发出声音)+「合」(声旁 hé→hā)。', family: '口字旁：哈、吃、叼、告——都和「嘴」有关。' },
      { ...C.手, c: '大', pinyin: 'dà', radical: '大', strokes: 3, split: '独体字', kind: '象形', hook: '像一个张开手脚的人——表示「大」。' },
      { c: '笑', pinyin: 'xiào', radical: '⺮', strokes: 10, split: '⺮ + 夭', kind: '会意', hook: '上面「⺮」像笑弯的眉眼，下面「夭」像笑得弯下了身子。' },
    ],
  },
  {
    id: 'd5-20', char: '举手', pinyin: 'jǔ shǒu',
    meaning: '把手抬起来。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['举手发言', '请举手'],
    sentence: '老师提问后，同学们纷纷举手回答。',
    tip: '「举」是上下结构，下面是「手」的变形——抬起手就是举。',
    chars: [
      { c: '举', pinyin: 'jǔ', radical: '丶', strokes: 9, split: '⺍ + 兴 + 一', kind: '会意', hook: '很多手一起往上抬——「举」就是高高抬起。' },
      { ...C.手 },
    ],
  },
  {
    id: 'd5-21', char: '摆放', pinyin: 'bǎi fàng',
    meaning: '把物品安放、陈列好。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['摆放整齐', '摆放桌椅'],
    sentence: '老师把杨桃摆放在讲桌上，让大家观察。',
    tip: '「摆」是提手旁——用手摆。回忆字族：扌＝手的动作（摆、排、拦、挡、掉）。',
    chars: [
      { c: '摆', pinyin: 'bǎi', radical: '扌', strokes: 13, split: '扌 + 罢', kind: '形声', hook: '「扌」用手 +「罢」。用手安放好=摆。', family: '扌(提手旁)：摆、排、拦、挡、掉、揠。' },
      { c: '放', pinyin: 'fàng', radical: '攵', strokes: 8, split: '方 + 攵', kind: '形声', hook: '「方」(声旁 fāng→fàng)+「攵」(手的动作)。' },
    ],
  },
  {
    id: 'd5-22', char: '座位', pinyin: 'zuò wèi',
    meaning: '供人坐的位子。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['我的座位', '找座位'],
    sentence: '他回到座位上，又仔细看了看那个杨桃。',
    tip: '「座」是广字头「广」(房屋、场所)，里面是「坐」——房子里坐的地方=座位。',
    chars: [
      { c: '座', pinyin: 'zuò', radical: '广', strokes: 10, split: '广 + 坐', kind: '形声', hook: '「广」(房屋)里面「坐」着——坐的位子=座。', family: '广字头：座、店、床、度——都和「房屋、场所」有关。', warn: '名词用「座」(座位)，动作用「坐」(坐下)。' },
      { c: '位', pinyin: 'wèi', radical: '亻', strokes: 7, split: '亻 + 立', kind: '会意', hook: '「亻」(人)+「立」(站)——人站立的地方=位置。' },
    ],
  },
  {
    id: 'd5-23', char: '教诲', pinyin: 'jiào huì',
    meaning: '教导、教育（多指长辈或老师的话）。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['老师的教诲', '谆谆教诲'],
    sentence: '老师的教诲让他一生都不会忘记。',
    tip: '关键易混：「诲」是言字旁「讠」——用话教导；「悔」是竖心旁「忄」——心里懊恼。别写反！',
    chars: [
      { c: '教', pinyin: 'jiào', radical: '攵', strokes: 11, split: '孝 + 攵', kind: '会意', hook: '同「教室」的「教」——教导别人。' },
      { c: '诲', pinyin: 'huì', radical: '讠', strokes: 10, split: '讠 + 每', kind: '形声', hook: '「讠」(言字旁=说话)+「每」(声旁)。用话来教导=诲。', family: '讠(言字旁)：诲、说、话、谁、该——都和「说话」有关。', warn: '诲(讠，用说的) ≠ 悔(忄，心里懊恼)。声旁都是「每」，部首不同！' },
    ],
  },
  {
    id: 'd5-24', char: '和颜悦色', pinyin: 'hé yán yuè sè',
    meaning: '形容态度温和、面带笑容。',
    ...UNIT, lesson: '画杨桃', type: 'idiom',
    examples: ['和颜悦色地说'],
    sentence: '老师没有批评他，而是和颜悦色地启发大家。',
    tip: '拆开记：「和」(温和)+「颜」(脸色)+「悦」(高兴)+「色」(神色)——脸色温和、神情愉快。',
    chars: [
      { c: '和', pinyin: 'hé', radical: '口', strokes: 8, split: '禾 + 口', kind: '形声', hook: '「禾」(声旁 hé)+「口」。和气、温和。' },
      { c: '颜', pinyin: 'yán', radical: '页', strokes: 15, split: '彦 + 页', kind: '形声', hook: '「页」和「头、脸」有关——「颜」就是脸色、容颜。', family: '页字旁：颜、颊、额、顶——都和「头、脸」有关。' },
      { c: '悦', pinyin: 'yuè', radical: '忄', strokes: 10, split: '忄 + 兑', kind: '形声', hook: '「忄」(心情)+「兑」(声旁 duì→yuè)。心里高兴=悦。', family: '忄(竖心旁)：悦、悔、惊、情。' },
      { c: '色', pinyin: 'sè', radical: '色', strokes: 6, split: '⺈ + 巴', kind: '会意', hook: '「色」指脸色、神色，也指颜色。' },
    ],
  },

  // ===================== 课文 14 小马过河 =====================
  {
    id: 'd5-25', char: '愿意', pinyin: 'yuàn yì',
    meaning: '心里同意、肯做某件事。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['愿意帮忙', '我愿意'],
    sentence: '小马愿意帮妈妈把麦子驮到磨坊去。',
    tip: '「愿」和「意」都带「心」——心里想做、心里同意。',
    chars: [
      { c: '愿', pinyin: 'yuàn', radical: '心', strokes: 14, split: '原 + 心', kind: '形声', hook: '「原」(声旁 yuán→yuàn)+「心」。心里的盼望=愿。', family: '心字底：愿、意、急、想、念。' },
      { c: '意', pinyin: 'yì', radical: '心', strokes: 13, split: '音 + 心', kind: '会意', hook: '「音」(心里的声音)+「心」——心里的想法=意。' },
    ],
  },
  {
    id: 'd5-26', char: '麦子', pinyin: 'mài zi',
    meaning: '一种重要的粮食作物，可以磨成面粉。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['一袋麦子', '收麦子'],
    sentence: '小马要把半口袋麦子驮到磨坊去。',
    tip: '「麦」是象形字——古文字画的就是麦子带芒的样子。',
    chars: [
      { c: '麦', pinyin: 'mài', radical: '麦', strokes: 7, split: '独体字', kind: '象形', hook: '「麦」古时画的是麦穗和麦根的样子。' },
      { c: '子', pinyin: 'zi', radical: '子', strokes: 3, split: '独体字', kind: '象形', hook: '像一个襁褓里的小娃娃。这里读轻声 zi。' },
    ],
  },
  {
    id: 'd5-27', char: '伯伯', pinyin: 'bó bo',
    meaning: '父亲的哥哥；也用来称呼跟父亲差不多大的男子。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['张伯伯', '老伯伯'],
    sentence: '小马在路上遇到了一位老牛伯伯。',
    tip: '「伯」是单人旁「亻」+「白」：「亻」表示是人，「白」表示读音(bái→bó)。',
    chars: [
      { c: '伯', pinyin: 'bó', radical: '亻', strokes: 7, split: '亻 + 白', kind: '形声', hook: '「亻」(人)+「白」(声旁 bái→bó)。表示一种亲戚称呼。', family: '亻(单人旁)：伯、住、位、候——都和「人」有关。' },
    ],
  },
  {
    id: 'd5-28', char: '立刻', pinyin: 'lì kè',
    meaning: '马上、立即。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['立刻出发', '立刻明白'],
    sentence: '听了妈妈的话，小马立刻跑回了河边。',
    tip: '「刻」右边是「刂」(立刀旁)——本意是用刀刻；时间「一刻」也很短，所以「立刻」表示马上。',
    chars: [
      { c: '立', pinyin: 'lì', radical: '立', strokes: 5, split: '独体字', kind: '象形', hook: '像一个人站在地面上——「立」就是站立。' },
      { c: '刻', pinyin: 'kè', radical: '刂', strokes: 8, split: '亥 + 刂', kind: '形声', hook: '「刂」(立刀旁=刀)+「亥」(声旁 hài→kè)。用刀刻。', family: '刂(立刀旁)：刻、刚、别、到——都和「刀、切」有关。' },
    ],
  },
  {
    id: 'd5-29', char: '突然', pinyin: 'tū rán',
    meaning: '在很短时间里发生，出乎意料。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['突然下雨', '突然出现'],
    sentence: '小马走到河边，突然停住了脚步。',
    tip: '绝妙画面：「突」=「穴」(洞)+「犬」(狗)——一条狗突然从洞里冲出来！',
    chars: [
      { c: '突', pinyin: 'tū', radical: '穴', strokes: 9, split: '穴 + 犬', kind: '会意', hook: '「穴」(洞)+「犬」(狗)：狗从洞里猛地冲出来——这就是「突然」！', family: '穴宝盖：突、空、窗、窝——都和「洞、孔」有关。' },
      { c: '然', pinyin: 'rán', radical: '灬', strokes: 12, split: '⺼ + 犬 + 灬', kind: '形声', hook: '下面「灬」是火。「然」常用作词尾，如「突然、忽然」。' },
    ],
  },
  {
    id: 'd5-30', char: '掉进', pinyin: 'diào jìn',
    meaning: '落到里面去。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['掉进河里', '掉进坑里'],
    sentence: '松鼠说，他的一个伙伴就掉进河里淹死了。',
    tip: '「掉」提手旁(扌)，「进」走之旁(辶)——一个和手有关，一个和走有关。',
    chars: [
      { c: '掉', pinyin: 'diào', radical: '扌', strokes: 11, split: '扌 + 卓', kind: '形声', hook: '「扌」+「卓」(声旁 zhuó→diào)。东西从手里落下=掉。', family: '扌(提手旁)：掉、摆、排、拦、挡。' },
      { c: '进', pinyin: 'jìn', radical: '辶', strokes: 7, split: '辶 + 井', kind: '形声', hook: '「辶」(走之旁=行走)+「井」(声旁)。往里走=进。', family: '辶(走之旁)：进、过、还、这——都和「行走、移动」有关。' },
    ],
  },
  {
    id: 'd5-31', char: '应该', pinyin: 'yīng gāi',
    meaning: '理所当然，必须这样做。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['应该这样', '你应该去'],
    sentence: '妈妈说：遇到事情应该自己动脑筋想一想。',
    tip: '「该」是言字旁「讠」+「亥」：「讠」表义，「亥」表音(hài→gāi)。',
    chars: [
      { c: '应', pinyin: 'yīng', radical: '广', strokes: 7, split: '广 + 㡀(变形)', kind: '形声', hook: '多音字：应该 yīng / 答应 yìng。这里读 yīng。' },
      { c: '该', pinyin: 'gāi', radical: '讠', strokes: 8, split: '讠 + 亥', kind: '形声', hook: '「讠」(言字旁)+「亥」(声旁 hài→gāi)。', family: '讠(言字旁)：该、说、话、诲、谁。' },
    ],
  },
  {
    id: 'd5-32', char: '拦住', pinyin: 'lán zhù',
    meaning: '挡住，不让通过。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['拦住去路', '被人拦住'],
    sentence: '小马刚想下河，松鼠大叫着拦住了他。',
    tip: '「拦」提手旁——用手拦。「兰」表读音(lán)。',
    chars: [
      { c: '拦', pinyin: 'lán', radical: '扌', strokes: 8, split: '扌 + 兰', kind: '形声', hook: '「扌」(用手)+「兰」(声旁 lán)。伸手挡住=拦。', family: '扌(提手旁)：拦、挡、摆、排、掉。' },
      { c: '住', pinyin: 'zhù', radical: '亻', strokes: 7, split: '亻 + 主', kind: '形声', hook: '「亻」+「主」(声旁)。「拦住、挡住」里的「住」表示动作有了结果。' },
    ],
  },
  {
    id: 'd5-33', char: '吃惊', pinyin: 'chī jīng',
    meaning: '受到意外的刺激而感到惊讶。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['大吃一惊', '令人吃惊'],
    sentence: '听说河水淹死过人，小马吃惊地停下了脚步。',
    tip: '「吃」口字旁(用嘴)，「惊」竖心旁(心里的感觉)——两个字部首正好对应「吃」和「惊」的意思。',
    chars: [
      { c: '吃', pinyin: 'chī', radical: '口', strokes: 6, split: '口 + 乞', kind: '形声', hook: '「口」(用嘴)+「乞」(声旁 qǐ→chī)。', family: '口字旁：吃、叼、哈、告。' },
      { c: '惊', pinyin: 'jīng', radical: '忄', strokes: 11, split: '忄 + 京', kind: '形声', hook: '「忄」(竖心旁=心情)+「京」(声旁 jīng)。心里受惊=惊。', family: '忄(竖心旁)：惊、悔、悦、情。' },
    ],
  },
  {
    id: 'd5-34', char: '挡住', pinyin: 'dǎng zhù',
    meaning: '拦住、遮住。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['挡住阳光', '挡住去路'],
    sentence: '老牛伯伯没有挡住小马，让他自己去试。',
    tip: '「挡」提手旁——用手挡。「当」表读音(dāng→dǎng)。和「拦住」是好朋友。',
    chars: [
      { c: '挡', pinyin: 'dǎng', radical: '扌', strokes: 9, split: '扌 + 当', kind: '形声', hook: '「扌」(用手)+「当」(声旁 dāng→dǎng)。', family: '扌(提手旁)：挡、拦、摆、排、掉。' },
      { c: '住', pinyin: 'zhù', radical: '亻', strokes: 7, split: '亻 + 主', kind: '形声', hook: '同「拦住」的「住」——表示动作的结果。' },
    ],
  },
  {
    id: 'd5-35', char: '亲切', pinyin: 'qīn qiè',
    meaning: '形容态度热情、关系密切，让人感到温暖。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['亲切的笑容', '亲切问候'],
    sentence: '老马亲切地对小马说：「你去试一试就知道了。」',
    tip: '「切」=「七」+「刀」：用刀切东西，「七」提示读音。多音字：亲切 qiè / 一切 qiè（同音）。',
    chars: [
      { c: '亲', pinyin: 'qīn', radical: '立', strokes: 9, split: '立 + 朩', kind: '形声', hook: '「亲」表示关系近——亲人、亲切。' },
      { c: '切', pinyin: 'qiè', radical: '刀', strokes: 4, split: '七 + 刀', kind: '形声', hook: '「刀」(用刀)+「七」(声旁)。本意是切割，「亲切」里表示紧密。' },
    ],
  },
  {
    id: 'd5-36', char: '角度', pinyin: 'jiǎo dù',
    meaning: '看事物的方向、立场；数学上指角的大小。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['换个角度', '不同角度'],
    sentence: '从不同的角度看杨桃，样子就不一样。',
    tip: '「角」是象形字——画的是兽角。「度」是广字头(广)。',
    chars: [
      { c: '角', pinyin: 'jiǎo', radical: '角', strokes: 7, split: '⺈ + 用(变形)', kind: '象形', hook: '「角」古文字画的是动物头上的角。多音字：角度 jiǎo / 角色 jué。' },
      { c: '度', pinyin: 'dù', radical: '广', strokes: 9, split: '广 + 廿 + 又', kind: '形声', hook: '「广」广字头。「度」表示程度、限度。', family: '广字头：度、座、店、床。' },
    ],
  },
  {
    id: 'd5-37', char: '难为情', pinyin: 'nán wéi qíng',
    meaning: '不好意思、害羞；也指碍于情面不好办。',
    ...UNIT, lesson: '画杨桃', type: 'word',
    examples: ['感到难为情', '别难为情'],
    sentence: '同学们笑过之后，明白了道理，反而有点难为情。',
    tip: '「情」是竖心旁「忄」+「青」——绝佳字族：青字家族 → 请、清、晴、情、睛。',
    chars: [
      { c: '难', pinyin: 'nán', radical: '隹', strokes: 10, split: '又 + 隹', kind: '形声', hook: '右边「隹」是短尾鸟。多音字：困难 nán / 灾难 nàn。' },
      { c: '为', pinyin: 'wéi', radical: '丶', strokes: 4, split: '独体字', kind: '会意', hook: '多音字：难为情 wéi / 因为 wèi。' },
      { c: '情', pinyin: 'qíng', radical: '忄', strokes: 11, split: '忄 + 青', kind: '形声', hook: '「忄」(心情)+「青」(声旁 qīng→qíng)。', family: '「青」家族最好记：请(讠)、清(氵)、晴(日)、情(忄)、睛(目)——声旁都是「青」，换个部首换个意思！' },
    ],
  },
  {
    id: 'd5-38', char: '动脑筋', pinyin: 'dòng nǎo jīn',
    meaning: '开动脑子思考、想办法。',
    ...UNIT, lesson: '小马过河', type: 'word',
    examples: ['多动脑筋', '动脑筋解决'],
    sentence: '遇到问题要自己动脑筋，光听别人说可不行。',
    tip: '「脑」和「筋」都和身体有关：「脑」是肉月旁(月)，「筋」也有肉月旁——都是身体的一部分。',
    chars: [
      { c: '动', pinyin: 'dòng', radical: '力', strokes: 6, split: '云 + 力', kind: '形声', hook: '右边「力」——用力气才能动。', family: '力字旁：动、劝、助、加。' },
      { c: '脑', pinyin: 'nǎo', radical: '月', strokes: 10, split: '⺼ + 𡿺', kind: '形声', hook: '「月」是肉月旁(和身体有关)——脑是身体里思考的器官。', family: '月(肉月旁)：脑、筋、脸、胖——都和「身体」有关。' },
      { c: '筋', pinyin: 'jīn', radical: '⺮', strokes: 12, split: '⺮ + 月 + 力', kind: '会意', hook: '同「筋疲力尽」的「筋」——「月」(肉)+「力」，身上有力的部分。' },
    ],
  },
];

// ============================================================
// 工具函数
// ============================================================

export function getWord(id: string): Word | undefined {
  return WORDS.find(w => w.id === id);
}

export function getUnits(semester: '上' | '下'): { unit: number; title: string; count: number }[] {
  const map = new Map<number, { title: string; count: number }>();
  for (const w of WORDS.filter(w => w.semester === semester)) {
    const cur = map.get(w.unit);
    if (cur) cur.count += 1;
    else map.set(w.unit, { title: w.unitTitle, count: 1 });
  }
  return Array.from(map.entries())
    .map(([unit, v]) => ({ unit, ...v }))
    .sort((a, b) => a.unit - b.unit);
}

export function wordsByUnit(semester: '上' | '下', unit: number): Word[] {
  return WORDS.filter(w => w.semester === semester && w.unit === unit);
}

export function wordsByLesson(): { lesson: string; words: Word[] }[] {
  const order: string[] = [];
  const map = new Map<string, Word[]>();
  for (const w of WORDS) {
    if (!map.has(w.lesson)) { map.set(w.lesson, []); order.push(w.lesson); }
    map.get(w.lesson)!.push(w);
  }
  return order.map(lesson => ({ lesson, words: map.get(lesson)! }));
}
