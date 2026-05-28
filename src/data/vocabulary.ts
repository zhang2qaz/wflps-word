// ============================================================
// 上海市世界外国语小学（WFLPS）· 国际部 P2 · 校本版
// 语文二年级下册 · 第五单元「办法」· 词语默写
// 课文：寓言二则 / 画杨桃 / 小马过河
// 数据来源：WFL 国际部二下第五单元词语默写卷（已逐词核对）
// 每个词条带「科学记忆」元数据：字形拆解、形声字规律、
// 字族、易混字、寓言故事、语境例句
// ============================================================

import { VAULT_WORDS } from './vault-words.generated';
import { GRADE2_WORDS, GRADE2_POEMS, GRADE2_SENTENCES } from './grade2';
import { GRADE3_WORDS, GRADE3_POEMS, GRADE3_SENTENCES } from './grade3';
import { GRADE4_WORDS, GRADE4_POEMS, GRADE4_SENTENCES } from './grade4';
import { GRADE5_WORDS, GRADE5_POEMS, GRADE5_SENTENCES } from './grade5';
import { GRADE6_WORDS, GRADE6_POEMS, GRADE6_SENTENCES } from './grade6';
import { MODERN_SENTENCES } from './sentences-modern';

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
  grade?: number;        // 年级（默认 2）
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
  draft?: boolean;       // 草稿（统编版标准词表，待家长核对）
};

const UNIT = { semester: '下' as const, unit: 5, unitTitle: '办法' };
const U6 = { semester: '下' as const, unit: 6, unitTitle: '大自然的秘密' };

// ---- 可复用的常见字拆解 ----
const C = {
  羊: { c: '羊', pinyin: 'yáng', radical: '羊', strokes: 6, split: '独体字', kind: '象形' as CharKind, hook: '像羊头：上面两点是羊角，下面是羊脸。' },
  力: { c: '力', pinyin: 'lì', radical: '力', strokes: 2, split: '独体字', kind: '象形' as CharKind, hook: '像一把用力的耒（农具），出力就要用「力」。' },
  口: { c: '口', pinyin: 'kǒu', radical: '口', strokes: 3, split: '独体字', kind: '象形' as CharKind, hook: '就是一张嘴的形状。' },
  手: { c: '手', pinyin: 'shǒu', radical: '手', strokes: 4, split: '独体字', kind: '象形' as CharKind, hook: '像一只张开五指的手。' },
};

export const WORDS: Word[] = [
  // ===================== 第五单元 · 寓言二则 =====================
  {
    id: 'd5-01', char: '亡羊补牢', pinyin: 'wáng yáng bǔ láo',
    meaning: '羊丢了再去修羊圈。比喻出了问题以后想办法补救，可以防止继续受损失。',
    ...UNIT, lesson: '寓言两则', type: 'idiom',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'idiom',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'word',
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
    ...UNIT, lesson: '寓言两则', type: 'idiom',
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

  // ===================== 第五单元 · 画杨桃 =====================
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

  // ===================== 第五单元 · 小马过河 =====================
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

  // ===================== 第六单元 · 雷雨 =====================
  {
    id: 'd6-01', char: '乌云', pinyin: 'wū yún',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '黑色的云，常预示着要下雨。',
    examples: ['乌云密布', '满天乌云'],
    sentence: '满天的乌云，黑沉沉地压下来。',
    tip: '「乌」是「鸟」字少一点——乌鸦全身黑，黑得连眼睛都看不见，所以少一点。',
    chars: [
      { c: '乌', pinyin: 'wū', radical: '丿', strokes: 4, split: '鸟 − 一点', kind: '象形', hook: '「乌」比「鸟」少中间一点——乌鸦通体黑，看不见眼睛。', warn: '「乌」比「鸟」少一点，别写成「鸟」。' },
      { c: '云', pinyin: 'yún', radical: '二', strokes: 4, split: '二 + 厶', kind: '象形', hook: '「云」古时画的就是天上卷曲的云。' },
    ],
  },
  {
    id: 'd6-02', char: '黑沉沉', pinyin: 'hēi chén chén',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '形容黑暗、天色又黑又重的样子。',
    examples: ['黑沉沉的天', '黑沉沉一片'],
    sentence: '天空黑沉沉的，好像要塌下来。',
    tip: 'ABB 式词语：「黑」后面叠用两个「沉」。「沉」是三点水——水多就往下沉。',
    chars: [
      { c: '黑', pinyin: 'hēi', radical: '黑', strokes: 12, split: '里 + 灬', kind: '会意', hook: '下面四点「灬」是火——烟火熏出来的颜色就是黑。' },
      { c: '沉', pinyin: 'chén', radical: '氵', strokes: 7, split: '氵 + 冗', kind: '形声', hook: '「氵」三点水——东西在水里往下「沉」。', family: '氵(三点水)：沉、清、淋、浴、河——都和「水」有关。' },
    ],
  },
  {
    id: 'd6-03', char: '压下来', pinyin: 'yā xià lái',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '从上往下压过来。',
    examples: ['压下来', '压住'],
    sentence: '乌云越来越低，像要压下来。',
    tip: '「压」是「厂」字头里面一个「土」加一点——大山(厂)把土往下压。',
    chars: [
      { c: '压', pinyin: 'yā', radical: '厂', strokes: 6, split: '厂 + 土 + 丶', kind: '形声', hook: '「厂」像山崖，崖下压着「土」——又重又往下。', warn: '里面「土」的右下别忘了那一点。' },
      { c: '下', pinyin: 'xià', radical: '一', strokes: 3, split: '独体字', kind: '指事', hook: '一横下面加笔——指「下方」。' },
      { c: '来', pinyin: 'lái', radical: '一', strokes: 7, split: '独体字', kind: '象形' },
    ],
  },
  {
    id: 'd6-04', char: '越来越响', pinyin: 'yuè lái yuè xiǎng',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '声音渐渐变得更大。',
    examples: ['雷声越来越响', '越来越大'],
    sentence: '雷声越来越响，闪电越来越亮。',
    tip: '「越…越…」是固定句式，表示程度加深。「响」是口字旁——声音从嘴/口发出。',
    chars: [
      { c: '越', pinyin: 'yuè', radical: '走', strokes: 12, split: '走 + 戉', kind: '形声', hook: '「走」字旁——本意是跨过去。', family: '走字旁：越、趣、起、超。' },
      { c: '响', pinyin: 'xiǎng', radical: '口', strokes: 9, split: '口 + 向', kind: '形声', hook: '「口」(发出声音)+「向」(声旁)。' },
    ],
  },
  {
    id: 'd6-05', char: '清新', pinyin: 'qīng xīn',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '清爽、新鲜（多形容空气）。',
    examples: ['空气清新', '清新的空气'],
    sentence: '雷雨过后，空气格外清新。',
    tip: '「清」是三点水 +「青」——水很「青」(纯净)就是清。记住「青」家族：清、晴、情、请、睛。',
    chars: [
      { c: '清', pinyin: 'qīng', radical: '氵', strokes: 11, split: '氵 + 青', kind: '形声', hook: '「氵」(水)+「青」(声旁 qīng)。水清澈见底。', family: '「青」家族：清(氵)、晴(日)、情(忄)、请(讠)、睛(目)——换部首换意思。' },
      { c: '新', pinyin: 'xīn', radical: '斤', strokes: 13, split: '亲 + 斤', kind: '形声', hook: '右边「斤」(斧头)。「新」与「旧」相对。' },
    ],
  },
  {
    id: 'd6-06', char: '迎面扑来', pinyin: 'yíng miàn pū lái',
    ...U6, lesson: '15 雷雨', type: 'word',
    examples: ['凉风迎面扑来'],
    meaning: '正对着脸冲过来。',
    sentence: '一股清新的空气迎面扑来。',
    tip: '「迎」是走之旁——迎接要走过去。「扑」是提手旁——扑是手的动作。',
    chars: [
      { c: '迎', pinyin: 'yíng', radical: '辶', strokes: 7, split: '辶 + 卬', kind: '形声', hook: '「辶」走之旁——迎接别人要走上前去。', family: '辶(走之旁)：迎、逃、过、进。' },
      { c: '面', pinyin: 'miàn', radical: '面', strokes: 9, split: '独体字', kind: '象形', hook: '「面」本意是脸。' },
      { c: '扑', pinyin: 'pū', radical: '扌', strokes: 5, split: '扌 + 卜', kind: '形声', hook: '「扌」提手旁——猛地用身体或手冲过去。', family: '扌(提手旁)：扑、拦、挡、摆。' },
      { c: '来', pinyin: 'lái', radical: '一', strokes: 7, split: '独体字', kind: '象形' },
    ],
  },
  {
    id: 'd6-07', char: '雷雨', pinyin: 'léi yǔ',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '伴有雷电的阵雨。',
    examples: ['一场雷雨', '雷雨天气'],
    sentence: '夏天的午后常常下雷雨。',
    tip: '「雷」「雨」都是雨字头——和下雨、天气有关的字常带「雨」。',
    chars: [
      { c: '雷', pinyin: 'léi', radical: '雨', strokes: 13, split: '雨 + 田', kind: '形声', hook: '「雨」字头——打雷常和下雨一起来。', family: '雨字头：雷、雪、霜、雾——都和「天气」有关。' },
      { c: '雨', pinyin: 'yǔ', radical: '雨', strokes: 8, split: '独体字', kind: '象形', hook: '「雨」里的四点就是落下的雨滴。' },
    ],
  },
  {
    id: 'd6-08', char: '逃走', pinyin: 'táo zǒu',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '为躲避而跑掉。',
    examples: ['逃走了', '吓得逃走'],
    sentence: '一只蜘蛛从网上垂下来，逃走了。',
    tip: '「逃」是走之旁 +「兆」——逃跑当然和「走」有关。',
    chars: [
      { c: '逃', pinyin: 'táo', radical: '辶', strokes: 9, split: '辶 + 兆', kind: '形声', hook: '「辶」走之旁(行走)+「兆」(声旁)。', family: '辶(走之旁)：逃、迎、过、进、这。' },
      { c: '走', pinyin: 'zǒu', radical: '走', strokes: 7, split: '土 + 龰', kind: '会意', hook: '下面像两只脚——迈步走。' },
    ],
  },
  {
    id: 'd6-09', char: '窗户', pinyin: 'chuāng hu',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '房屋墙上通风、采光的开口。',
    examples: ['打开窗户', '关窗户'],
    sentence: '雷雨来了，妈妈赶紧关上窗户。',
    tip: '「窗」是穴宝盖「穴」——房屋墙上的洞口。「户」是单扇门的样子。',
    chars: [
      { c: '窗', pinyin: 'chuāng', radical: '穴', strokes: 12, split: '穴 + 囱', kind: '形声', hook: '「穴」(墙上的孔洞)——窗就是墙上的洞口。', family: '穴宝盖：窗、空、突、穿。' },
      { c: '户', pinyin: 'hù', radical: '户', strokes: 4, split: '独体字', kind: '象形', hook: '「户」古时画的是一扇门。' },
    ],
  },
  {
    id: 'd6-10', char: '闪电', pinyin: 'shǎn diàn',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '雷雨时天空中一闪而过的电光。',
    examples: ['一道闪电', '电闪雷鸣'],
    sentence: '一道闪电划过，照亮了整个天空。',
    tip: '绝妙画面：「闪」=「门」里有个「人」——人在门里一闪而过！',
    chars: [
      { c: '闪', pinyin: 'shǎn', radical: '门', strokes: 5, split: '门 + 人', kind: '会意', hook: '「门」里一个「人」——一闪身就过去了，所以叫「闪」。' },
      { c: '电', pinyin: 'diàn', radical: '电', strokes: 5, split: '独体字', kind: '象形', hook: '「电」古时画的是闪电的样子。' },
    ],
  },
  {
    id: 'd6-11', char: '彩虹', pinyin: 'cǎi hóng',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '雨后天空中出现的七色弧。',
    examples: ['美丽的彩虹', '雨后彩虹'],
    sentence: '雷雨过后，天边挂起一道彩虹。',
    tip: '冷知识：「虹」是虫字旁——古人以为彩虹是天上的大虫！',
    chars: [
      { c: '彩', pinyin: 'cǎi', radical: '彡', strokes: 11, split: '采 + 彡', kind: '形声', hook: '右边「彡」表示花纹、色彩。' },
      { c: '虹', pinyin: 'hóng', radical: '虫', strokes: 9, split: '虫 + 工', kind: '形声', hook: '「虫」字旁——古人以为彩虹是天上一条会喝水的大虫！「工」表音。', family: '虫字旁：虹、蚂、蚁、蜘、蛛。' },
    ],
  },
  {
    id: 'd6-12', char: '垂下来', pinyin: 'chuí xià lái',
    ...U6, lesson: '15 雷雨', type: 'word',
    meaning: '一头固定，另一头向下挂着。',
    examples: ['柳枝垂下来', '垂下'],
    sentence: '一只蜘蛛从网上垂下来。',
    tip: '「垂」笔画多要数清：上面一撇，中间两横夹两竖，下面一横——像枝条往下挂。',
    chars: [
      { c: '垂', pinyin: 'chuí', radical: '土', strokes: 8, split: '丿 + 龶 + 土', kind: '象形', hook: '「垂」像枝叶往下挂的样子。', warn: '中间是两横两竖，笔画容易写错，要数清。' },
      { c: '下', pinyin: 'xià', radical: '一', strokes: 3, split: '独体字', kind: '指事' },
      { c: '来', pinyin: 'lái', radical: '一', strokes: 7, split: '独体字', kind: '象形' },
    ],
  },
  {
    id: 'd6-13', char: '一动不动', pinyin: 'yí dòng bú dòng',
    ...U6, lesson: '15 雷雨', type: 'idiom',
    meaning: '形容完全不动。',
    examples: ['一动不动地站着'],
    sentence: '雷雨前，蜘蛛在网上一动不动。',
    tip: '「一…不…」式词语：中间嵌同一个字「动」。意思是「一点也不动」。',
    chars: [
      { c: '一', pinyin: 'yī', radical: '一', strokes: 1, split: '独体字', kind: '指事' },
      { c: '动', pinyin: 'dòng', radical: '力', strokes: 6, split: '云 + 力', kind: '形声', hook: '右边「力」——用力气才能动。' },
      { c: '不', pinyin: 'bù', radical: '一', strokes: 4, split: '独体字', kind: '指事' },
    ],
  },

  // ============== 第六单元 · 要是你在野外迷了路 ==============
  {
    id: 'd6-14', char: '野外', pinyin: 'yě wài',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '离居民点较远的地方。',
    examples: ['野外探险', '到野外去'],
    sentence: '要是你在野外迷了路，可别慌张。',
    tip: '「野」是「里」+「予」——田里、村里以外的地方就是野外。',
    chars: [
      { c: '野', pinyin: 'yě', radical: '里', strokes: 11, split: '里 + 予', kind: '形声', hook: '「里」(村里、田里)+「予」(声旁)——村里之外就是野。' },
      { c: '外', pinyin: 'wài', radical: '夕', strokes: 5, split: '夕 + 卜', kind: '会意', hook: '「外」与「内」相对。' },
    ],
  },
  {
    id: 'd6-15', char: '时候', pinyin: 'shí hou',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '时间里的某一点或某一段。',
    examples: ['小时候', '什么时候'],
    sentence: '天黑的时候，可以看北极星辨方向。',
    tip: '「时」是日字旁——时间和太阳(日)有关。「候」中间别忘那一小竖。',
    chars: [
      { c: '时', pinyin: 'shí', radical: '日', strokes: 7, split: '日 + 寸', kind: '形声', hook: '「日」(太阳)告诉你和时间有关。', family: '日字旁：时、明、晚、晴、星。' },
      { c: '候', pinyin: 'hòu', radical: '亻', strokes: 10, split: '亻 + 𠉢', kind: '形声', hook: '注意中间有一短竖，别漏写。', warn: '「候」中间有一竖，「侯」没有。' },
    ],
  },
  {
    id: 'd6-16', char: '帮助', pinyin: 'bāng zhù',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '替别人出力、出主意。',
    examples: ['互相帮助', '帮助别人'],
    sentence: '大自然能帮助我们辨别方向。',
    tip: '「助」右边是「力」——帮助就是出力气。',
    chars: [
      { c: '帮', pinyin: 'bāng', radical: '巾', strokes: 9, split: '邦 + 巾', kind: '形声', hook: '下面「巾」(布)。「邦」表音。' },
      { c: '助', pinyin: 'zhù', radical: '力', strokes: 7, split: '且 + 力', kind: '形声', hook: '右边「力」——帮助就是出力。', family: '力字旁：助、动、劝、加。' },
    ],
  },
  {
    id: 'd6-17', char: '向导', pinyin: 'xiàng dǎo',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '带路的人。',
    examples: ['当向导', '天然的向导'],
    sentence: '太阳是个忠实的向导。',
    tip: '「导」上面是「巳」下面是「寸」——用手(寸)带着方向走。',
    chars: [
      { c: '向', pinyin: 'xiàng', radical: '口', strokes: 6, split: '丿 + 冂 + 口', kind: '象形', hook: '「向」表示方向、朝着。' },
      { c: '导', pinyin: 'dǎo', radical: '寸', strokes: 6, split: '巳 + 寸', kind: '会意', hook: '下面「寸」表示用手——带领、引导。' },
    ],
  },
  {
    id: 'd6-18', char: '永远', pinyin: 'yǒng yuǎn',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '时间长久，没有终止。',
    examples: ['永远不忘', '永远快乐'],
    sentence: '北极星永远挂在北方的天空。',
    tip: '「永」字是练书法的范字，八种基本笔画都在里面（永字八法）。',
    chars: [
      { c: '永', pinyin: 'yǒng', radical: '水', strokes: 5, split: '独体字', kind: '会意', hook: '「永」本意是水流长远——「永字八法」包含汉字八种基本笔画。' },
      { c: '远', pinyin: 'yuǎn', radical: '辶', strokes: 7, split: '辶 + 元', kind: '形声', hook: '「辶」走之旁——要走很久才到的地方。', family: '辶(走之旁)：远、迎、逃、过。' },
    ],
  },
  {
    id: 'd6-19', char: '碰上', pinyin: 'pèng shàng',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '遇到、碰见。',
    examples: ['碰上difficulty', '路上碰上'],
    sentence: '要是碰上阴天，就看不到太阳了。',
    tip: '「碰」是石字旁——本意是石头相撞。',
    chars: [
      { c: '碰', pinyin: 'pèng', radical: '石', strokes: 13, split: '石 + 并', kind: '形声', hook: '「石」字旁——本意是石头相撞，引申为遇到。', family: '石字旁：碰、磁、码、砖。' },
      { c: '上', pinyin: 'shàng', radical: '一', strokes: 3, split: '独体字', kind: '指事' },
    ],
  },
  {
    id: 'd6-20', char: '特别', pinyin: 'tè bié',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '与众不同；非常。',
    examples: ['特别好', '特别的礼物'],
    sentence: '北极星特别亮，很容易找到。',
    tip: '「特」是牛字旁——本指公牛，引申为「特殊、与众不同」。',
    chars: [
      { c: '特', pinyin: 'tè', radical: '牜', strokes: 10, split: '牜 + 寺', kind: '形声', hook: '「牜」牛字旁 +「寺」(声旁)。' },
      { c: '别', pinyin: 'bié', radical: '刂', strokes: 7, split: '另 + 刂', kind: '会意', hook: '右边「刂」立刀旁——用刀分开，所以有「区别」之意。' },
    ],
  },
  {
    id: 'd6-21', char: '积雪', pinyin: 'jī xuě',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '积存在地上的雪。',
    examples: ['一层积雪', '山顶积雪'],
    sentence: '沟渠里积雪化得快的一边是南方。',
    tip: '「积」是禾字旁——本指堆积谷物。「雪」是雨字头。',
    chars: [
      { c: '积', pinyin: 'jī', radical: '禾', strokes: 10, split: '禾 + 只', kind: '形声', hook: '「禾」(庄稼)——本指把谷物堆积起来。' },
      { c: '雪', pinyin: 'xuě', radical: '雨', strokes: 11, split: '雨 + 彐', kind: '会意', hook: '「雨」字头——雪是从天上落下的。', family: '雨字头：雪、雷、霜、雾。' },
    ],
  },
  {
    id: 'd6-22', char: '慌张', pinyin: 'huāng zhāng',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '心里不沉着，动作忙乱。',
    examples: ['别慌张', '神色慌张'],
    sentence: '在野外迷了路，可千万别慌张。',
    tip: '「慌」是竖心旁「忄」——心里发慌是一种心情。回忆忄家族：慌、悔、悦、惊、情。',
    chars: [
      { c: '慌', pinyin: 'huāng', radical: '忄', strokes: 12, split: '忄 + 荒', kind: '形声', hook: '「忄」(竖心旁=心情)+「荒」(声旁)。心里发慌。', family: '忄(竖心旁)：慌、惊、悔、悦、情——都是心里的感觉。' },
      { c: '张', pinyin: 'zhāng', radical: '弓', strokes: 7, split: '弓 + 长', kind: '形声', hook: '「弓」字旁——本意是把弓拉开。' },
    ],
  },
  {
    id: 'd6-23', char: '忠实', pinyin: 'zhōng shí',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '忠诚可靠。',
    examples: ['忠实的朋友', '忠实可靠'],
    sentence: '太阳是个忠实的向导。',
    tip: '「忠」是「中」+「心」——心放得端端正正、不偏不倚，就是忠。',
    chars: [
      { c: '忠', pinyin: 'zhōng', radical: '心', strokes: 8, split: '中 + 心', kind: '形声', hook: '「中」(端正)+「心」——心摆正，就是忠诚。', family: '心字底：忠、急、想、意、愿。' },
      { c: '实', pinyin: 'shí', radical: '宀', strokes: 8, split: '宀 + 头', kind: '会意', hook: '「宀」(屋子)里装满东西——充实、真实。' },
    ],
  },
  {
    id: 'd6-24', char: '分辨', pinyin: 'fēn biàn',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '辨别、区分清楚。',
    examples: ['分辨方向', '分辨是非'],
    sentence: '我们可以靠太阳来分辨方向。',
    tip: '关键易混！「辨」中间是一撇一点(辨别要靠眼/刀分)；「辩」中间是「讠」(辩论靠嘴)；「辫」中间是「纟」(辫子是丝线)。',
    chars: [
      { c: '分', pinyin: 'fēn', radical: '刀', strokes: 4, split: '八 + 刀', kind: '会意', hook: '「八」(分开)+「刀」——用刀分开。' },
      { c: '辨', pinyin: 'biàn', radical: '辛', strokes: 16, split: '辛 + 刂 + 辛', kind: '形声', hook: '中间是一撇一点（像把刀）——分辨要把东西分清。', warn: '辨(中间一撇一点) ≠ 辩(中间讠) ≠ 辫(中间纟)。记：分辨用眼，辩论用嘴，辫子用丝线。' },
    ],
  },
  {
    id: 'd6-25', char: '北极星', pinyin: 'běi jí xīng',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '北方天空中一颗较亮的星，可指示北方。',
    examples: ['找到北极星', '北极星指北'],
    sentence: '夜晚，北极星永远高挂在北方。',
    tip: '「北」像两个人背对背——所以「北」也有「相背」的意思。',
    chars: [
      { c: '北', pinyin: 'běi', radical: '匕', strokes: 5, split: '丬 + 匕', kind: '会意', hook: '「北」像两个人背靠背站着——本意是「背」。' },
      { c: '极', pinyin: 'jí', radical: '木', strokes: 7, split: '木 + 及', kind: '形声', hook: '「木」字旁 +「及」(声旁)。「极」表示最高、尽头。' },
      { c: '星', pinyin: 'xīng', radical: '日', strokes: 9, split: '日 + 生', kind: '形声', hook: '「日」(发光)+「生」(声旁)——天上发光的就是星。' },
    ],
  },
  {
    id: 'd6-26', char: '指南针', pinyin: 'zhǐ nán zhēn',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '利用磁针指示方向的仪器，是中国古代四大发明之一。',
    examples: ['用指南针', '一只指南针'],
    sentence: '大自然有很多天然的指南针。',
    tip: '「针」是金字旁「钅」——针是金属做的。',
    chars: [
      { c: '指', pinyin: 'zhǐ', radical: '扌', strokes: 9, split: '扌 + 旨', kind: '形声', hook: '「扌」提手旁——用手指。', family: '扌(提手旁)：指、扑、拦、挡、摆。' },
      { c: '南', pinyin: 'nán', radical: '十', strokes: 9, split: '十 + 冂 + 龶', kind: '象形', hook: '「南」表示南方。' },
      { c: '针', pinyin: 'zhēn', radical: '钅', strokes: 7, split: '钅 + 十', kind: '形声', hook: '「钅」金字旁——针是金属做的细长物。', family: '钅(金字旁)：针、钉、钱、铁。' },
    ],
  },
  {
    id: 'd6-27', char: '黑夜', pinyin: 'hēi yè',
    ...U6, lesson: '16 要是你在野外迷了路', type: 'word',
    meaning: '天黑的夜晚。',
    examples: ['黑夜里', '漫漫黑夜'],
    sentence: '黑夜里，北极星给人们指路。',
    tip: '「夜」里藏着一个「亻」(人)和「夕」(月亮)——人在月夜下。',
    chars: [
      { c: '黑', pinyin: 'hēi', radical: '黑', strokes: 12, split: '里 + 灬', kind: '会意', hook: '下面四点「灬」是火——烟火熏黑。' },
      { c: '夜', pinyin: 'yè', radical: '夕', strokes: 8, split: '亠 + 亻 + 夕', kind: '会意', hook: '里面有「夕」(月亮)——有月亮的时候就是夜。' },
    ],
  },

  // ============== 第六单元 · 太空生活趣事多 ==============
  {
    id: 'd6-28', char: '舒服', pinyin: 'shū fu',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '身体或精神感到轻松愉快。',
    examples: ['很舒服', '舒舒服服'],
    sentence: '在太空睡觉，得把自己绑住才舒服。',
    tip: '「舒」=「舍」+「予」：把心里的东西舍出去、给出去，人就舒展了。',
    chars: [
      { c: '舒', pinyin: 'shū', radical: '舌', strokes: 12, split: '舍 + 予', kind: '会意', hook: '「舍」(舍得)+「予」(给予)——心里放开，就舒服了。' },
      { c: '服', pinyin: 'fú', radical: '月', strokes: 8, split: '月 + 𠬝', kind: '形声', hook: '多音字：舒服 fu / 衣服 fú。' },
    ],
  },
  {
    id: 'd6-29', char: '即使', pinyin: 'jí shǐ',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '连词，表示假设的让步，相当于「就算」。',
    examples: ['即使…也…'],
    sentence: '即使在太空，宇航员也要好好工作。',
    tip: '易混！「即」(jí) 右边是「卩」；「既」(jì) 右边是「旡」。「即使」用「即」。',
    chars: [
      { c: '即', pinyin: 'jí', radical: '卩', strokes: 7, split: '皀 + 卩', kind: '会意', hook: '右边是「卩」。', warn: '「即」(右边卩) ≠ 「既」(右边旡，多一点一撇)。「即使」用「即」。' },
      { c: '使', pinyin: 'shǐ', radical: '亻', strokes: 8, split: '亻 + 吏', kind: '形声', hook: '「亻」单人旁——本意是派人去做事。' },
    ],
  },
  {
    id: 'd6-30', char: '难题', pinyin: 'nán tí',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '不容易解决的问题。',
    examples: ['解决难题', '一道难题'],
    sentence: '在太空喝水是个难题。',
    tip: '「题」是页字旁——和「头、脸」有关的字常带「页」。',
    chars: [
      { c: '难', pinyin: 'nán', radical: '隹', strokes: 10, split: '又 + 隹', kind: '形声', hook: '右边「隹」是短尾鸟。多音字：难题 nán / 灾难 nàn。' },
      { c: '题', pinyin: 'tí', radical: '页', strokes: 15, split: '是 + 页', kind: '形声', hook: '「页」字旁——和头脸有关，本指额头，引申为题目。', family: '页字旁：题、颜、额、顶。' },
    ],
  },
  {
    id: 'd6-31', char: '有趣', pinyin: 'yǒu qù',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '有意思、引人喜欢。',
    examples: ['很有趣', '有趣的事'],
    sentence: '在太空中生活，是不是很有趣？',
    tip: '「趣」是走字旁——本意是快步走向感兴趣的东西。',
    chars: [
      { c: '有', pinyin: 'yǒu', radical: '月', strokes: 6, split: '𠂇 + 月', kind: '会意', hook: '像一只手拿着肉(月)——手里有东西。' },
      { c: '趣', pinyin: 'qù', radical: '走', strokes: 15, split: '走 + 取', kind: '形声', hook: '「走」字旁——快步走向喜欢的东西。', family: '走字旁：趣、越、起、超。' },
    ],
  },
  {
    id: 'd6-32', char: '杯子', pinyin: 'bēi zi',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '盛水或饮料的器具。',
    examples: ['一只杯子', '玻璃杯子'],
    sentence: '在太空里，杯子里的水会飘起来。',
    tip: '「杯」是木字旁——最早的杯子是木头做的。',
    chars: [
      { c: '杯', pinyin: 'bēi', radical: '木', strokes: 8, split: '木 + 不', kind: '形声', hook: '「木」字旁——古时的杯子用木头做。', family: '木字旁：杯、板、桶、树。' },
      { c: '子', pinyin: 'zi', radical: '子', strokes: 3, split: '独体字', kind: '象形' },
    ],
  },
  {
    id: 'd6-33', char: '地板', pinyin: 'dì bǎn',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '房间地面铺的板。',
    examples: ['擦地板', '木地板'],
    sentence: '在太空，地板和天花板都一样。',
    tip: '「板」是木字旁——板子多用木头做。「反」表读音。',
    chars: [
      { c: '地', pinyin: 'dì', radical: '土', strokes: 6, split: '土 + 也', kind: '形声', hook: '「土」字旁——大地是土做的。', family: '土字旁：地、场、坏、堵。' },
      { c: '板', pinyin: 'bǎn', radical: '木', strokes: 8, split: '木 + 反', kind: '形声', hook: '「木」(木头)+「反」(声旁 fǎn→bǎn)。', family: '木字旁：板、杯、桶、树。' },
    ],
  },
  {
    id: 'd6-34', char: '容易', pinyin: 'róng yì',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '不难、不费事。',
    examples: ['很容易', '容易学'],
    sentence: '在太空里走路，可不像在地球上那么容易。',
    tip: '「容」是宝盖头「宀」——屋子能容纳东西。',
    chars: [
      { c: '容', pinyin: 'róng', radical: '宀', strokes: 10, split: '宀 + 谷', kind: '形声', hook: '「宀」(屋子)——屋子能容纳、装得下。', family: '宀(宝盖头)：容、室、家、宝。' },
      { c: '易', pinyin: 'yì', radical: '日', strokes: 8, split: '日 + 勿', kind: '象形', hook: '「易」有「容易」和「改变」两个意思。' },
    ],
  },
  {
    id: 'd6-35', char: '浴室', pinyin: 'yù shì',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '专供洗澡的房间。',
    examples: ['进浴室', '宽敞的浴室'],
    sentence: '太空里的浴室和地球上很不一样。',
    tip: '「浴」是三点水——洗澡当然和水有关。「室」是宝盖头——房间。',
    chars: [
      { c: '浴', pinyin: 'yù', radical: '氵', strokes: 10, split: '氵 + 谷', kind: '形声', hook: '「氵」三点水——沐浴、洗澡和水有关。', family: '氵(三点水)：浴、淋、清、沉。' },
      { c: '室', pinyin: 'shì', radical: '宀', strokes: 9, split: '宀 + 至', kind: '形声', hook: '「宀」宝盖头——房间。', family: '宀(宝盖头)：室、容、家、宝。' },
    ],
  },
  {
    id: 'd6-36', char: '方向', pinyin: 'fāng xiàng',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '东、南、西、北等指向。',
    examples: ['辨别方向', '前进方向'],
    sentence: '在太空中很难分清方向。',
    tip: '「方」「向」都是独体字，结构简单，重点是写端正。',
    chars: [
      { c: '方', pinyin: 'fāng', radical: '方', strokes: 4, split: '独体字', kind: '象形' },
      { c: '向', pinyin: 'xiàng', radical: '口', strokes: 6, split: '丿 + 冂 + 口', kind: '象形', hook: '「向」表示朝着、方向。' },
    ],
  },
  {
    id: 'd6-37', char: '淋湿', pinyin: 'lín shī',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '被水浇湿。',
    examples: ['淋湿了', '被雨淋湿'],
    sentence: '太空洗澡，水珠会到处飘，容易淋湿别处。',
    tip: '「淋」「湿」都是三点水——都和水有关。「淋」=氵+林，水多得像下雨淋在树林上。',
    chars: [
      { c: '淋', pinyin: 'lín', radical: '氵', strokes: 11, split: '氵 + 林', kind: '形声', hook: '「氵」(水)+「林」(声旁)——水浇下来。', family: '氵(三点水)：淋、浴、清、沉。' },
      { c: '湿', pinyin: 'shī', radical: '氵', strokes: 12, split: '氵 + 显', kind: '形声', hook: '「氵」三点水——沾了水就「湿」。' },
    ],
  },
  {
    id: 'd6-38', char: '必须', pinyin: 'bì xū',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '一定要，表示事理上、情理上的必要。',
    examples: ['必须完成', '必须这样'],
    sentence: '在太空喝水，必须用带吸管的杯子。',
    tip: '「必」的笔顺要记牢：先写中间一点和卧钩，再写左右两点。',
    chars: [
      { c: '必', pinyin: 'bì', radical: '心', strokes: 5, split: '心 + 丿', kind: '指事', hook: '像在「心」上加一撇——表示必定、一定。', warn: '笔顺：先点、卧钩，再写两旁的点。别按「心」的写法。' },
      { c: '须', pinyin: 'xū', radical: '页', strokes: 9, split: '彡 + 页', kind: '会意', hook: '「页」(头脸)+「彡」(毛发)——本意是胡须，借作「必须」。' },
    ],
  },
  {
    id: 'd6-39', char: '水桶', pinyin: 'shuǐ tǒng',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '提水、装水的桶。',
    examples: ['一只水桶', '提水桶'],
    sentence: '在太空里，水桶里的水不会自己流出来。',
    tip: '「桶」是木字旁——桶常用木头做。「甬」表读音。',
    chars: [
      { c: '水', pinyin: 'shuǐ', radical: '水', strokes: 4, split: '独体字', kind: '象形', hook: '「水」像流动的水流。' },
      { c: '桶', pinyin: 'tǒng', radical: '木', strokes: 11, split: '木 + 甬', kind: '形声', hook: '「木」(木头)+「甬」(声旁 yǒng→tǒng)。', family: '木字旁：桶、杯、板、树。' },
    ],
  },
  {
    id: 'd6-40', char: '宇航员', pinyin: 'yǔ háng yuán',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '驾驶或乘坐宇宙飞船在太空飞行的人。',
    examples: ['一名宇航员', '宇航员训练'],
    sentence: '宇航员在太空中要克服许多难题。',
    tip: '「航」是舟字旁——飞行、航行最早和「船(舟)」有关。',
    chars: [
      { c: '宇', pinyin: 'yǔ', radical: '宀', strokes: 6, split: '宀 + 于', kind: '形声', hook: '「宀」(宝盖)——本指屋檐，引申为天地空间。', family: '宀(宝盖头)：宇、宙、室、家。' },
      { c: '航', pinyin: 'háng', radical: '舟', strokes: 10, split: '舟 + 亢', kind: '形声', hook: '「舟」字旁——航行最早指坐船。', family: '舟字旁：航、船。' },
      { c: '员', pinyin: 'yuán', radical: '口', strokes: 7, split: '口 + 贝', kind: '会意', hook: '「员」表示某种身份的人。' },
    ],
  },
  {
    id: 'd6-41', char: '宇宙飞船', pinyin: 'yǔ zhòu fēi chuán',
    ...U6, lesson: '17 太空生活趣事多', type: 'idiom',
    meaning: '在太空中航行的飞行器。',
    examples: ['乘坐宇宙飞船'],
    sentence: '宇宙飞船把宇航员送上了太空。',
    tip: '「宇」「宙」都是宝盖头——合起来「宇宙」就是无边无际的天地空间。',
    chars: [
      { c: '宇', pinyin: 'yǔ', radical: '宀', strokes: 6, split: '宀 + 于', kind: '形声', hook: '「宀」宝盖头——天地四方叫「宇」。' },
      { c: '宙', pinyin: 'zhòu', radical: '宀', strokes: 8, split: '宀 + 由', kind: '形声', hook: '「宀」宝盖头——古往今来叫「宙」。', family: '宀(宝盖头)：宙、宇、室、家。' },
      { c: '飞', pinyin: 'fēi', radical: '飞', strokes: 3, split: '独体字', kind: '象形', hook: '「飞」像鸟展翅飞翔。' },
      { c: '船', pinyin: 'chuán', radical: '舟', strokes: 11, split: '舟 + 㕣', kind: '形声', hook: '「舟」字旁——船在水上行。', family: '舟字旁：船、航。' },
    ],
  },
  {
    id: 'd6-42', char: '或者', pinyin: 'huò zhě',
    ...U6, lesson: '17 太空生活趣事多', type: 'word',
    meaning: '连词，表示选择关系。',
    examples: ['或者…或者…'],
    sentence: '在太空喝水，得用吸管或者特制的杯子。',
    tip: '「或」字别漏写右上角那一点和那一撇——里面是「口」「一」加「戈」。',
    chars: [
      { c: '或', pinyin: 'huò', radical: '戈', strokes: 8, split: '戈 + 口 + 一', kind: '会意', hook: '「或」里有「戈」(兵器)、「口」(人)、「一」(土地)——本指守卫疆土。', warn: '右上角的一点别漏写。' },
      { c: '者', pinyin: 'zhě', radical: '耂', strokes: 8, split: '耂 + 日', kind: '形声', hook: '「者」常用来指人或事物，读轻声 zhe。' },
    ],
  },
];

// ============================================================
// 第一·二·三·四·七·八单元 —— 统编版标准词表（草稿，待家长核对）
// 仅收录字词表（不含课文原文）。学校实际默写卷可能略有出入，
// 拿到学校卷子后可用「导入」替换或重建。
// ============================================================
// 来自 Obsidian 笔记仓库（vault/字词/*.md）—— 由 `npm run vault` 自动编译
WORDS.push(...VAULT_WORDS);

type DraftWord = [char: string, pinyin: string, meaning: string];

function pushDraftUnit(
  grade: number,
  semester: '上' | '下',
  unit: number,
  unitTitle: string,
  lessons: { lesson: string; words: DraftWord[] }[],
) {
  let n = 0;
  const prefix = `g${grade}${semester === '上' ? 'a' : 'b'}`;
  for (const { lesson, words } of lessons) {
    for (const [char, pinyin, meaning] of words) {
      n += 1;
      WORDS.push({
        id: `${prefix}${unit}-${String(n).padStart(2, '0')}`,
        char, pinyin, meaning,
        grade, semester, unit, unitTitle, lesson,
        type: char.length >= 4 ? 'idiom' : 'word',
        examples: [],
        sentence: '',
        tip: '统编版标准词表（草稿，待核对）。把这个词拆成单个字记，再用它造个句子。',
        chars: Array.from(char).map(c => ({ c, pinyin: '' })),
        draft: true,
      });
    }
  }
}

// 已逐词核对版(按家长提供的世外校本默写卷),没有 draft 标记
function pushVerifiedUnit(
  grade: number,
  semester: '上' | '下',
  unit: number,
  unitTitle: string,
  lessons: { lesson: string; words: DraftWord[] }[],
) {
  let n = 0;
  const prefix = `g${grade}${semester === '上' ? 'a' : 'b'}v`;
  for (const { lesson, words } of lessons) {
    for (const [char, pinyin, meaning] of words) {
      n += 1;
      WORDS.push({
        id: `${prefix}${unit}-${String(n).padStart(2, '0')}`,
        char, pinyin, meaning,
        grade, semester, unit, unitTitle, lesson,
        type: char.length >= 4 ? 'idiom' : 'word',
        examples: [],
        sentence: '',
        tip: '默写时把词拆成单个字记,再用它造个句子。',
        chars: Array.from(char).map(c => ({ c, pinyin: '' })),
      });
    }
  }
}

// 二下 1-4 单元 —— 已按家长照片提供的世外校本默写卷逐词核对
// (1 古诗两首没有独立词语,只默写整首古诗 —— 在 POEMS 里)
pushVerifiedUnit(2, '下', 1, '春天里', [
  { lesson: '2 找春天', words: [
    ['冲出', 'chōng chū', '冲到外面来'],
    ['寻找', 'xún zhǎo', '到处找'],
    ['眉毛', 'méi mao', '眼睛上方的毛'],
    ['吐出嫩芽', 'tǔ chū nèn yá', '刚长出柔软的芽'],
    ['闻到', 'wén dào', '用鼻子嗅到'],
    ['柳枝', 'liǔ zhī', '柳树的枝条'],
    ['荡秋千', 'dàng qiū qiān', '坐秋千上摇摆'],
    ['桃花', 'táo huā', '桃树开的花'],
    ['仔细', 'zǐ xì', '认真细心'],
    ['遮遮掩掩', 'zhē zhē yǎn yǎn', '半遮半掩'],
    ['音符', 'yīn fú', '记录音乐的符号'],
    ['解冻', 'jiě dòng', '冰融化'],
    ['杜鹃', 'dù juān', '一种鸟,也是一种花'],
  ] },
  { lesson: '3 开满鲜花的小路', words: [
    ['鲜花', 'xiān huā', '新鲜的花'],
    ['原来', 'yuán lái', '本来'],
    ['大叔', 'dà shū', '对中年男子的称呼'],
    ['通往', 'tōng wǎng', '通向'],
    ['惊奇', 'jīng qí', '惊讶觉得奇怪'],
    ['正巧', 'zhèng qiǎo', '恰巧'],
    ['礼物', 'lǐ wù', '赠送的东西'],
    ['懊丧', 'ào sàng', '失意烦闷'],
    ['邮递员', 'yóu dì yuán', '送信送包裹的人'],
    ['花籽', 'huā zǐ', '花的种子'],
    ['五颜六色', 'wǔ yán liù sè', '颜色多样'],
    ['破洞', 'pò dòng', '破了的洞'],
  ] },
  { lesson: '4 邓小平爷爷植树', words: [
    ['邓小平', 'dèng xiǎo píng', '人名'],
    ['植树', 'zhí shù', '种树'],
    ['格外', 'gé wài', '特别'],
    ['引人注目', 'yǐn rén zhù mù', '吸引大家的目光'],
    ['圆满', 'yuán mǎn', '完美'],
    ['休息', 'xiū xī', '停下来歇歇'],
    ['茁壮', 'zhuó zhuàng', '健壮有力'],
    ['挑选', 'tiāo xuǎn', '选出'],
    ['碧空如洗', 'bì kōng rú xǐ', '天空蓝得像洗过'],
    ['万里无云', 'wàn lǐ wú yún', '天上一点云也没有'],
    ['兴致勃勃', 'xìng zhì bó bó', '兴趣很高'],
  ] },
]);

pushVerifiedUnit(2, '下', 2, '关爱他人', [
  { lesson: '5 雷锋叔叔,你在哪里', words: [
    ['雷锋', 'léi fēng', '人名'],
    ['昨天', 'zuó tiān', '今天的前一天'],
    ['背包', 'bēi bāo', '背在背上的包'],
    ['洒水', 'sǎ shuǐ', '把水撒出去'],
    ['温暖', 'wēn nuǎn', '不冷,让人舒服'],
    ['汗水', 'hàn shuǐ', '出汗流的水'],
    ['足迹', 'zú jì', '脚印'],
    ['迷路', 'mí lù', '找不着路'],
    ['泥泞', 'ní nìng', '又湿又烂的泥'],
    ['年迈', 'nián mài', '年纪老了'],
    ['晶莹', 'jīng yíng', '光亮透明'],
    ['顺利', 'shùn lì', '事情进行得很好'],
    ['弯曲', 'wān qū', '不直,弯弯的'],
  ] },
  { lesson: '6 千人糕', words: [
    ['桌子', 'zhuō zi', '吃饭写字的家具'],
    ['品尝', 'pǐn cháng', '尝尝味道'],
    ['买卖', 'mǎi mài', '生意'],
    ['工具', 'gōng jù', '做事用的器具'],
    ['甘甜', 'gān tián', '又甜又香'],
    ['甜菜汁', 'tián cài zhī', '甜菜榨出的汁'],
    ['劳动', 'láo dòng', '出力气做事'],
    ['应该', 'yīng gāi', '理所当然'],
    ['特别', 'tè bié', '不同寻常'],
    ['能干', 'néng gàn', '有本事'],
    ['千人糕', 'qiān rén gāo', '故事里的糕点'],
    ['的确', 'dí què', '真的、实在'],
    ['磨成粉', 'mó chéng fěn', '磨碎成粉末'],
  ] },
  { lesson: '7 我不是最弱小的', words: [
    ['弱小', 'ruò xiǎo', '又弱又小'],
    ['周末', 'zhōu mò', '星期六、星期日'],
    ['母亲', 'mǔ qīn', '妈妈'],
    ['吸引', 'xī yǐn', '把注意力引过来'],
    ['芬芳', 'fēn fāng', '香味'],
    ['递给', 'dì gěi', '把东西交到别人手里'],
    ['勇敢', 'yǒng gǎn', '不怕困难和危险'],
    ['簇拥', 'cù yōng', '紧紧围绕'],
    ['显得', 'xiǎn de', '看起来像'],
    ['较弱', 'jiào ruò', '比较弱'],
  ] },
]);

pushVerifiedUnit(2, '下', 3, '中华传统', [
  { lesson: '识字 1 神州谣', words: [
    ['神州大地', 'shén zhōu dà dì', '中国的代称'],
    ['华夏儿女', 'huá xià ér nǚ', '中国人'],
    ['各民族', 'gè mín zú', '各种民族'],
    ['情谊', 'qíng yì', '感情友情'],
    ['齐奋发', 'qí fèn fā', '一起努力上进'],
    ['山川', 'shān chuān', '山和河'],
    ['长城', 'cháng chéng', '中国的伟大建筑'],
    ['奔跑', 'bēn pǎo', '快速地跑'],
    ['海峡', 'hǎi xiá', '两块陆地间的海'],
  ] },
  { lesson: '识字 2 传统节日', words: [
    ['传统', 'chuán tǒng', '世代相传的风俗'],
    ['贴窗花', 'tiē chuāng huā', '在窗上贴剪纸'],
    ['大街小巷', 'dà jiē xiǎo xiàng', '街道和小巷'],
    ['龙舟', 'lóng zhōu', '端午节赛的船'],
    ['艾叶', 'ài yè', '端午节挂的艾草叶'],
    ['全家', 'quán jiā', '一家人'],
    ['团圆', 'tuán yuán', '亲人聚在一起'],
    ['真热闹', 'zhēn rè nào', '十分喧闹'],
    ['清明节', 'qīng míng jié', '扫墓踏青的节日'],
  ] },
  { lesson: '识字 3 "贝"的故事', words: [
    ['甲骨文', 'jiǎ gǔ wén', '古代刻在龟甲上的字'],
    ['骨头', 'gǔ tou', '人和动物身体里的支架'],
    ['饰品', 'shì pǐn', '装饰用的东西'],
    ['钱币', 'qián bì', '钱'],
    ['与众不同', 'yǔ zhòng bù tóng', '跟大家都不一样'],
    ['钱财', 'qián cái', '钱和财物'],
    ['贝壳', 'bèi ké', '贝类的硬壳'],
    ['珍贵', 'zhēn guì', '宝贵、价值高'],
    ['漂亮', 'piào liang', '好看'],
    ['容易', 'róng yì', '不难'],
    ['损坏', 'sǔn huài', '弄坏'],
  ] },
  { lesson: '识字 4 中国美食', words: [
    ['茄子', 'qié zi', '一种紫色蔬菜'],
    ['烧烤', 'shāo kǎo', '烤食物'],
    ['烤鸭', 'kǎo yā', '烤好的鸭子'],
    ['鸡蛋', 'jī dàn', '鸡下的蛋'],
    ['蛋壳', 'dàn ké', '蛋的外壳'],
    ['美食', 'měi shí', '好吃的食物'],
    ['饺子', 'jiǎo zi', '春节常吃的食物'],
    ['炸土豆', 'zhá tǔ dòu', '用油炸的土豆'],
    ['水煮鱼', 'shuǐ zhǔ yú', '一道川菜'],
    ['蛋炒饭', 'dàn chǎo fàn', '用蛋炒的饭'],
  ] },
]);

pushVerifiedUnit(2, '下', 4, '奇妙的想象', [
  { lesson: '8 彩色的梦', words: [
    ['彩色', 'cǎi sè', '多种颜色'],
    ['梦想', 'mèng xiǎng', '美好的愿望'],
    ['坚硬', 'jiān yìng', '又坚又硬'],
    ['铅笔盒', 'qiān bǐ hé', '装铅笔的盒子'],
    ['森林', 'sēn lín', '大片树木'],
    ['结苹果', 'jiē píng guǒ', '长出苹果'],
    ['精灵', 'jīng líng', '童话里的小精灵'],
    ['流动', 'liú dòng', '流来流去'],
    ['聊天', 'liáo tiān', '随意地说话'],
    ['拉手', 'lā shǒu', '手拉手'],
    ['脚尖', 'jiǎo jiān', '脚的最前端'],
    ['草坪', 'cǎo píng', '一片平整的草地'],
    ['叮咛', 'dīng níng', '反复嘱咐'],
    ['葱郁', 'cōng yù', '草木茂密青翠'],
  ] },
  { lesson: '9 一匹出色的马', words: [
    ['马匹', 'mǎ pǐ', '马的总称'],
    ['妹妹', 'mèi mei', '同父母的小女孩'],
    ['泛起波纹', 'fàn qǐ bō wén', '水面起小波纹'],
    ['恋恋不舍', 'liàn liàn bù shě', '舍不得离开'],
    ['请求', 'qǐng qiú', '恳求'],
    ['奔跑', 'bēn pǎo', '快速地跑'],
    ['异常', 'yì cháng', '不寻常'],
    ['好像', 'hǎo xiàng', '像是'],
    ['出色', 'chū sè', '特别好'],
    ['柔软', 'róu ruǎn', '又软又松'],
    ['拾起', 'shí qǐ', '从地上捡起来'],
    ['郊外', 'jiāo wài', '城市外面'],
    ['葱葱绿绿', 'cōng cōng lǜ lǜ', '形容绿油油'],
  ] },
  { lesson: '10 枫树上的喜鹊', words: [
    ['旁边', 'páng biān', '左右两侧'],
    ['阿姨', 'ā yí', '对女性长辈的称呼'],
    ['弟弟', 'dì di', '比自己小的男孩'],
    ['方便', 'fāng biàn', '便利'],
    ['教书', 'jiāo shū', '当老师上课'],
    ['拼音字母', 'pīn yīn zì mǔ', '汉语拼音的字母'],
    ['游戏', 'yóu xì', '玩耍'],
    ['喜欢', 'xǐ huan', '喜爱'],
    ['童话', 'tóng huà', '儿童故事'],
    ['绿荫', 'lǜ yīn', '树荫'],
    ['喜鹊', 'xǐ què', '一种鸟'],
  ] },
]);

// 第七单元 「改变」 —— 已按世外校本默写卷逐词核对(家长照片提供)
pushVerifiedUnit(2, '下', 7, '改变', [
  { lesson: '18 大象的耳朵', words: [
    ['扇子', 'shàn zi', '扇风的用具'],
    ['遇到', 'yù dào', '碰到'],
    ['生病', 'shēng bìng', '身体不舒服'],
    ['一定', 'yī dìng', '必定'],
    ['不安', 'bù ān', '心里不安宁'],
    ['两根竹竿', 'liǎng gēn zhú gān', '两条长长的竹子'],
    ['头痛', 'tóu tòng', '头疼'],
    ['睡觉', 'shuì jiào', '休息入眠'],
    ['最后', 'zuì hòu', '最末了'],
    ['耷拉', 'dā lā', '向下垂'],
    ['心烦', 'xīn fán', '心里烦躁'],
    ['慢慢地', 'màn màn de', '不快地'],
    ['自言自语', 'zì yán zì yǔ', '自己跟自己说话'],
  ] },
  { lesson: '19 蜘蛛开店', words: [
    ['商店', 'shāng diàn', '卖东西的店铺'],
    ['决定', 'jué dìng', '拿定主意'],
    ['终于', 'zhōng yú', '到底'],
    ['需要', 'xū yào', '应该有'],
    ['付钱', 'fù qián', '给钱'],
    ['袜子', 'wà zi', '穿在脚上的'],
    ['星期', 'xīng qī', '一周七天'],
    ['工夫', 'gōng fu', '时间'],
    ['开店', 'kāi diàn', '开商店'],
    ['围巾', 'wéi jīn', '围在脖子上的布'],
    ['简单', 'jiǎn dān', '不复杂'],
    ['匆忙', 'cōng máng', '急急忙忙'],
    ['寂寞', 'jì mò', '孤单冷清'],
  ] },
  { lesson: '20 青蛙卖泥塘', words: [
    ['青蛙', 'qīng wā', '会捉害虫的两栖动物'],
    ['卖出', 'mài chū', '把东西卖给人'],
    ['搬到', 'bān dào', '挪到别处'],
    ['倒是', 'dào shì', '其实'],
    ['草籽', 'cǎo zǐ', '草的种子'],
    ['竖起', 'shù qǐ', '立起来'],
    ['泉水', 'quán shuǐ', '从地里流出的水'],
    ['打破', 'dǎ pò', '弄碎'],
    ['砍树', 'kǎn shù', '用刀斧砍倒树'],
    ['花丛', 'huā cóng', '一丛丛的花'],
    ['尽情', 'jìn qíng', '没有约束地'],
    ['舒服', 'shū fu', '感觉很惬意'],
    ['游泳', 'yóu yǒng', '在水里行进'],
    ['绿茵茵', 'lǜ yīn yīn', '形容绿油油'],
    ['吆喝', 'yāo he', '大声招呼'],
  ] },
  { lesson: '21 小毛虫', words: [
    ['可怜', 'kě lián', '值得同情'],
    ['尽心竭力', 'jìn xīn jié lì', '用尽全部心思和力气'],
  ] },
]);

pushDraftUnit(2, '下', 8, '世界之初', [
  { lesson: '祖先的摇篮', words: [
    ['祖先', 'zǔ xiān', '一个家族的上代'],
    ['摇篮', 'yáo lán', '哄婴儿睡觉的篮子'],
    ['森林', 'sēn lín', '大片树木'],
    ['野果', 'yě guǒ', '野生的果子'],
  ] },
  { lesson: '当世界年纪还小的时候', words: [
    ['世界', 'shì jiè', '地球上所有的地方'],
    ['年纪', 'nián jì', '人的岁数'],
    ['规则', 'guī zé', '大家要遵守的规定'],
    ['简单', 'jiǎn dān', '不复杂'],
  ] },
  { lesson: '羿射九日', words: [
    ['炎热', 'yán rè', '天气很热'],
    ['庄稼', 'zhuāng jia', '田里的农作物'],
    ['灾难', 'zāi nàn', '天灾人祸'],
  ] },
]);


// 二上、三上下、四上下、六上下 —— 见 ./grade{2,3,4,6}.ts
// (二下保留 WFL 校本版 + 草稿,不被覆盖)
WORDS.push(...GRADE2_WORDS);
WORDS.push(...GRADE3_WORDS);
WORDS.push(...GRADE4_WORDS);
WORDS.push(...GRADE6_WORDS);

// 五年级（统编版上下册）—— 见 ./grade5.ts
WORDS.push(...GRADE5_WORDS);

// 护栏：所有词语（手写 + vault 笔记 + 草稿）合并后查一遍 id 撞车。
// vault 笔记若误用了已存在的 id，构建日志里会立刻报出来。
{
  const seen = new Set<string>();
  for (const w of WORDS) {
    if (seen.has(w.id)) console.warn(`[vocabulary] 词语 id 重复：「${w.id}」(${w.char}) —— 检查 vault 笔记`);
    seen.add(w.id);
  }
}


// ============================================================
// 古诗（整首背默）
// ============================================================

export type PoemLine = {
  text: string;       // 诗句
  pinyin: string;     // 整句拼音
  meaning: string;    // 这句的意思
  tts?: string;       // 朗读专用文本（多音字用同音字替换，纠正浏览器读音）
};

export type Poem = {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  grade?: number;     // 年级（默认 2，与早期数据兼容）
  semester: '上' | '下';
  unit: number;
  unitTitle: string;
  lesson: string;
  theme: string;      // 整首诗写什么（一句话）
  lines: PoemLine[];
};

export const POEMS: Poem[] = [
  {
    id: 'p1-1',
    title: '村居',
    author: '高鼎',
    dynasty: '清',
    semester: '下', unit: 1, unitTitle: '春天里', lesson: '1 古诗两首',
    theme: '写早春二月的乡村风光，和孩子们放学回来、趁着春风放风筝的快乐。',
    lines: [
      { text: '草长莺飞二月天', pinyin: 'cǎo zhǎng yīng fēi èr yuè tiān', meaning: '二月里，小草生长，黄莺飞舞，' },
      { text: '拂堤杨柳醉春烟', pinyin: 'fú dī yáng liǔ zuì chūn yān', meaning: '杨柳轻拂着堤岸，像陶醉在春天的雾气里。' },
      { text: '儿童散学归来早', pinyin: 'ér tóng sàn xué guī lái zǎo', meaning: '孩子们放学回来得早，' },
      { text: '忙趁东风放纸鸢', pinyin: 'máng chèn dōng fēng fàng zhǐ yuān', meaning: '急忙趁着东风放起了风筝（纸鸢就是风筝）。' },
    ],
  },
  {
    id: 'p1-2',
    title: '咏柳',
    author: '贺知章',
    dynasty: '唐',
    semester: '下', unit: 1, unitTitle: '春天里', lesson: '1 古诗两首',
    theme: '用碧玉、丝带、剪刀打比方，赞美春天柳树的美，和春风的灵巧。',
    lines: [
      { text: '碧玉妆成一树高', pinyin: 'bì yù zhuāng chéng yí shù gāo', meaning: '高高的柳树，像是用碧玉打扮成的，' },
      { text: '万条垂下绿丝绦', pinyin: 'wàn tiáo chuí xià lǜ sī tāo', meaning: '千万条柳枝垂下来，像绿色的丝带。' },
      { text: '不知细叶谁裁出', pinyin: 'bù zhī xì yè shuí cái chū', meaning: '不知道这细细的柳叶是谁裁剪出来的，' },
      { text: '二月春风似剪刀', pinyin: 'èr yuè chūn fēng sì jiǎn dāo', meaning: '原来二月的春风就像一把剪刀。' },
    ],
  },
  {
    id: 'p6-1',
    title: '晓出净慈寺送林子方',
    author: '杨万里',
    dynasty: '宋',
    semester: '下', unit: 6, unitTitle: '大自然的秘密', lesson: '14 古诗二首',
    theme: '清晨在净慈寺送别朋友，诗人写下了六月西湖的荷花美景——莲叶碧、荷花红，色彩鲜明动人。',
    lines: [
      { text: '毕竟西湖六月中', pinyin: 'bì jìng xī hú liù yuè zhōng', meaning: '到底是六月里的西湖啊，' },
      { text: '风光不与四时同', pinyin: 'fēng guāng bù yǔ sì shí tóng', meaning: '这风光和其他季节就是不一样。' },
      { text: '接天莲叶无穷碧', pinyin: 'jiē tiān lián yè wú qióng bì', meaning: '碧绿的莲叶一直连到天边，无边无际，' },
      { text: '映日荷花别样红', pinyin: 'yìng rì hé huā bié yàng hóng', meaning: '荷花被朝阳一照，红得格外鲜艳。' },
    ],
  },
  {
    id: 'p6-2',
    title: '绝句',
    author: '杜甫',
    dynasty: '唐',
    semester: '下', unit: 6, unitTitle: '大自然的秘密', lesson: '14 古诗二首',
    theme: '诗人凭窗远望，用黄、翠、白、青四种颜色，画出一幅明媚生动的早春图。',
    lines: [
      { text: '两个黄鹂鸣翠柳', pinyin: 'liǎng gè huáng lí míng cuì liǔ', meaning: '两只黄鹂在翠绿的柳树上欢快鸣叫，' },
      { text: '一行白鹭上青天', pinyin: 'yì háng bái lù shàng qīng tiān', meaning: '一行白鹭飞向蔚蓝的天空。', tts: '一航白鹭上青天' },
      { text: '窗含西岭千秋雪', pinyin: 'chuāng hán xī lǐng qiān qiū xuě', meaning: '窗口正好框住西岭上终年不化的积雪，' },
      { text: '门泊东吴万里船', pinyin: 'mén bó dōng wú wàn lǐ chuán', meaning: '门外停泊着将要驶往万里之外东吴的船。' },
    ],
  },
];

// ============================================================
// 句子（整句听写）
// ============================================================

export type Sentence = {
  id: string;
  text: string;
  grade?: number;     // 年级（默认 2，与早期数据兼容）
  semester: '上' | '下';
  unit: number;
  unitTitle: string;
  lesson: string;
  tip: string;        // 写之前的提醒（易错点 / 标点）
};

export const SENTENCES: Sentence[] = [
  {
    id: 's6-1',
    text: '忽然一阵大风，吹得树枝乱摆。一只蜘蛛从网上垂下来，逃走了。',
    semester: '下', unit: 6, unitTitle: '大自然的秘密', lesson: '15 雷雨',
    tip: '两句话，中间有逗号和句号，别漏标点。注意「蜘蛛」两个字都是虫字旁，「垂」笔画要数清。',
  },
  {
    id: 's6-2',
    text: '要是你在野外迷了路，可千万别慌张。大自然有很多天然的指南针，需要你细细观察，多多去想。',
    semester: '下', unit: 6, unitTitle: '大自然的秘密', lesson: '16 要是你在野外迷了路',
    tip: '句子较长，分两句写。注意「慌」是竖心旁，「指南针」的「针」是金字旁。',
  },
  {
    id: 's6-3',
    text: '你看，在太空中生活，是不是很有趣？',
    semester: '下', unit: 6, unitTitle: '大自然的秘密', lesson: '17 太空生活趣事多',
    tip: '这是一个问句，结尾是问号「？」。注意「趣」是走字旁。',
  },
];

// 二/三/四/五/六年级 古诗 + 文言文 —— 见 ./grade{2,3,4,5,6}.ts
POEMS.push(...GRADE2_POEMS);
POEMS.push(...GRADE3_POEMS);
POEMS.push(...GRADE4_POEMS);
POEMS.push(...GRADE5_POEMS);
POEMS.push(...GRADE6_POEMS);
SENTENCES.push(...GRADE2_SENTENCES);
SENTENCES.push(...GRADE3_SENTENCES);
SENTENCES.push(...GRADE4_SENTENCES);
SENTENCES.push(...GRADE5_SENTENCES);
SENTENCES.push(...GRADE6_SENTENCES);
SENTENCES.push(...MODERN_SENTENCES);

// ============================================================
// 工具函数
// ============================================================

export function getWord(id: string): Word | undefined {
  return WORDS.find(w => w.id === id);
}

export function getPoem(id: string): Poem | undefined {
  return POEMS.find(p => p.id === id);
}

export function getSentence(id: string): Sentence | undefined {
  return SENTENCES.find(s => s.id === id);
}

export function poemsByUnit(semester: '上' | '下', unit: number, grade?: number): Poem[] {
  return POEMS.filter(p => p.semester === semester && p.unit === unit
    && (grade === undefined || (p.grade ?? 2) === grade));
}

export function sentencesByUnit(semester: '上' | '下', unit: number, grade?: number): Sentence[] {
  return SENTENCES.filter(s => s.semester === semester && s.unit === unit
    && (grade === undefined || (s.grade ?? 2) === grade));
}

// 古诗 / 句子的统一引用（错题本、家长报告、SRS 用）
export type ReciteRef = {
  id: string;
  kind: 'poem' | 'sentence';
  title: string;   // 展示文字：诗题或句子
  lesson: string;
  unit: number;
};

export function reciteRefs(): ReciteRef[] {
  return [
    ...POEMS.map(p => ({
      id: p.id, kind: 'poem' as const, title: `《${p.title}》`, lesson: p.lesson, unit: p.unit,
    })),
    ...SENTENCES.map(s => ({
      id: s.id, kind: 'sentence' as const, title: s.text, lesson: s.lesson, unit: s.unit,
    })),
  ];
}

export function getReciteRef(id: string): ReciteRef | undefined {
  return reciteRefs().find(r => r.id === id);
}

export function isReciteId(id: string): boolean {
  return POEMS.some(p => p.id === id) || SENTENCES.some(s => s.id === id);
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

// 按单元分组 → 每个单元下按课文分组（学新字 / 听写页用）
export type UnitGroup = {
  unit: number;
  unitTitle: string;
  lessons: { lesson: string; words: Word[] }[];
  poems: Poem[];
  sentences: Sentence[];
  draft: boolean;   // 是否为草稿单元（统编版标准词表，待核对）
};

// 课本（有数据的「年级+学期」组合）
export type Book = { grade: number; semester: '上' | '下'; label: string };

const GRADE_LABEL = ['', '一', '二', '三', '四', '五', '六'];

export function books(): Book[] {
  const seen = new Set<string>();
  const out: Book[] = [];
  for (const w of WORDS) {
    const g = w.grade ?? 2;
    const key = `${g}${w.semester}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ grade: g, semester: w.semester, label: `${GRADE_LABEL[g] ?? g}年级${w.semester}册` });
  }
  return out.sort((a, b) => (a.grade !== b.grade ? a.grade - b.grade : a.semester === '上' ? -1 : 1));
}

/**
 * 把某课本(年级+学期)里的字词按「单元 → 课文」分组。
 * @param extra 调用方可传入用户导入词单(customWords) —— 让导入词也出现在「学字词」「听写」的单元列表里。
 *              没传时只用内置 WORDS。
 */
export function unitGroups(grade: number, semester: '上' | '下', extra: Word[] = []): UnitGroup[] {
  const unitOrder: number[] = [];
  const byUnit = new Map<number, { unitTitle: string; lessons: Map<string, Word[]>; lessonOrder: string[] }>();
  for (const w of [...WORDS, ...extra]) {
    if ((w.grade ?? 2) !== grade || w.semester !== semester) continue;
    if (!byUnit.has(w.unit)) {
      byUnit.set(w.unit, { unitTitle: w.unitTitle, lessons: new Map(), lessonOrder: [] });
      unitOrder.push(w.unit);
    }
    const u = byUnit.get(w.unit)!;
    if (!u.lessons.has(w.lesson)) { u.lessons.set(w.lesson, []); u.lessonOrder.push(w.lesson); }
    u.lessons.get(w.lesson)!.push(w);
  }
  return unitOrder.sort((a, b) => a - b).map(unit => {
    const u = byUnit.get(unit)!;
    const lessons = u.lessonOrder.map(lesson => ({ lesson, words: u.lessons.get(lesson)! }));
    const draft = lessons.every(l => l.words.every(w => w.draft));
    return {
      unit,
      unitTitle: u.unitTitle,
      lessons,
      poems: poemsByUnit(semester, unit, grade),
      sentences: sentencesByUnit(semester, unit, grade),
      draft,
    };
  });
}

// 当前学习进度所在的「书 + 单元」：含已学词的最后一个单元（按 书→单元 顺序）。
// 没有任何已学词时，返回第一本书的第一个单元。
export function currentPosition(
  isLearned: (id: string) => boolean,
): { grade: number; semester: '上' | '下'; unit: number } {
  const bs = books();
  let found: { grade: number; semester: '上' | '下'; unit: number } | null = null;
  for (const b of bs) {
    for (const g of unitGroups(b.grade, b.semester)) {
      if (g.lessons.some(l => l.words.some(w => isLearned(w.id)))) {
        found = { grade: b.grade, semester: b.semester, unit: g.unit };
      }
    }
  }
  if (found) return found;
  const first = bs[0];
  const fg = unitGroups(first.grade, first.semester)[0];
  return { grade: first.grade, semester: first.semester, unit: fg?.unit ?? 1 };
}

// 某个单元的全部词语（按课文顺序，不含古诗 / 句子）
export function unitWords(grade: number, semester: '上' | '下', unit: number): Word[] {
  const g = unitGroups(grade, semester).find(u => u.unit === unit);
  return g ? g.lessons.flatMap(l => l.words) : [];
}
