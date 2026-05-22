# 字词内容仓库（Obsidian Vault）

这个文件夹是「世外默写本」App 的**字词内容来源**。
用 Obsidian 写笔记，脚本自动把笔记编译成 App 的数据 —— 加新单元再也不用改代码。

## 怎么用

1. **打开 Vault**：用 Obsidian 打开这个 `vault/` 文件夹。
2. **加字词**：进 `字词/` 文件夹，复制 `_模板.md`，改个文件名（建议用词语本身，如 `亡羊补牢.md`），填好内容。
   - 文件名**不要用 `_` 开头** —— `_` 开头的文件会被当成模板跳过。
   - 每条的 `id` 建议都用 `v-` 开头（如 `v-9-01`），避免和 App 里已有的词撞车。
3. **生成数据**：在项目根目录运行
   ```
   npm run vault
   ```
   它会把 `字词/*.md` 编译进 `src/data/vault-words.generated.ts`，自动并入 App 的词表。
4. **不用手动跑也行**：`npm run build` 会先自动执行一次 `npm run vault`，所以部署时一定是最新的。

## 笔记格式

见 `字词/_模板.md`。要点：

- 开头 `---` 之间是 **frontmatter**：`id` / `char` / `pinyin` / `semester`（上或下）/ `unit` / `unitTitle` / `lesson` / `type`（word 或 idiom）。
- 正文用 `## 标题` 分段：`释义` `组词` `例句` `记忆要点` `故事` `逐字拆解`。
- `逐字拆解` 里每个字用 `### 字` 开头，下面用 `- key: value` 列出 `pinyin` `radical` `strokes` `split` `kind` `hook` `family` `warn`。
- 中英文冒号都认（`pinyin：lì` 和 `pinyin: lì` 都行）。

## 校验

`npm run vault` 会检查 id 是否重复、必填项是否缺失，有问题会直接报错并中止，不会生成坏数据。
