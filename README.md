# GitHub 技术速递生成器

一个基于 DeepSeek 大模型的用户可配置技术速递网页生成产品，能够自动收集、筛选和整理指定领域的 GitHub 热门项目，并生成美观的静态 HTML 网页。

## 功能特性

- 🔧 **用户可配置**：支持自定义技术领域和整理规则
- 🤖 **Agent 驱动**：利用 DeepSeek 大模型进行智能内容整理
- 📊 **GitHub 数据**：自动从 GitHub 收集指定时间范围的热门项目
- 🎨 **美观网页**：生成符合规范的静态 HTML 页面，支持本地打开和部署
- 📱 **响应式设计**：适配不同设备尺寸
- ⏰ **时间配置**：支持自定义数据收集的时间范围
- 💡 **智能筛选**：基于自定义提示词进行项目筛选和排序
- 📝 **历史记录**：生成的文件按时间命名，便于历史追溯
- 📋 **灵活部署**：支持多种部署方式
- 🔍 **精准搜索**：根据自定义提示词进行内容深度整理

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`，并填写 DeepSeek API Key：

```bash
cp .env.example .env
```

在 `.env` 文件中添加：

```
DEEPSEEK_API_KEY=your_deepseek_api_key
GITHUB_TOKEN=your_github_token (可选，用于提高 API 调用限额)
```

### 3. 运行生成器

#### 使用默认配置（AI + Java）

```bash
node src/main.js
```

#### 自定义领域

```bash
node src/main.js --domains "AI,Rust,Web3"
```

#### 使用配置文件

创建 `config.json` 文件：

```json
{
  "domains": ["AI", "Java", "Rust"],
  "prompt": "更关注工程实践和性能优化"
}
```

然后运行：

```bash
node src/main.js --config config.json
```

#### 完整命令行选项

```
Usage: main [options]

Options:
  -c, --config <path>        配置文件路径
  -d, --domains <domains>    技术领域列表，逗号分隔
  -p, --prompt <prompt>      自定义整理提示词
  -D, --days <days>          最近天数，可选值：3、7、30
  -r, --date-range <range>   自定义日期范围，格式：YYYY-MM-DD..YYYY-MM-DD
  -h, --help                 display help for command
```

## 配置说明

### 配置文件格式

```json
{
  "domains": ["AI", "Java"],       // 技术领域列表
  "prompt": "更关注初学者友好的项目",  // 自定义整理提示词
  "deepseekApiKey": "your_key",     // DeepSeek API Key（也可通过环境变量设置）
  "timeRange": 7                     // 数据收集时间范围（天，可选，默认为7）
}
```

### 领域配置

* 可以指定任意数量的技术领域
* 每个领域将在网页中独立分区展示
* 示例：`["AI", "Java", "Rust", "Web3", "Infra", "Data"]`

### 提示词配置

* 提示词将作为附加约束，影响内容整理方向
* 支持多种自定义维度：
  * **项目类型**："更关注工程实践"、"重点关注开源社区动态"
  * **技术深度**："更偏向初学者"、"关注高级技术实现"
  * **性能优化**："更关注性能 / Infra"、"重点关注资源效率"
  * **应用场景**："关注企业级应用"、"偏向个人开发工具"
  * **社区活跃度**："关注高星项目"、"重点关注最近活跃项目"

### 时间配置

* 支持自定义数据收集的时间范围（单位：天）
* 默认为最近7天的热门项目
* 可根据需求调整，例如：
  * `"timeRange": 3` - 收集最近3天的项目
  * `"timeRange": 14` - 收集最近14天的项目

### 使用规则

1. **配置优先级**：命令行参数 > 配置文件 > 环境变量
2. **API 调用限制**：严格遵循 GitHub API 调用限制，建议配置 GitHub Token 以提高限额
3. **输出文件命名**：采用 `YYMMDDHHmm.html` 格式命名，便于历史追溯和管理
4. **内容更新频率**：建议定期运行（如每周）以获取最新的技术动态
5. **领域数量建议**：推荐每个生成任务包含 2-5 个技术领域，以保证内容质量和生成效率

### 历史记录管理

* 所有生成的 HTML 文件将保存在当前目录
* 文件名包含生成时间，格式为 `YYMMDDHHmm.html`
* 支持通过文件名快速定位特定时间的技术速递
* 建议定期归档旧文件，保持工作目录整洁

## 效果展示

### 生成页面示例

<!-- 预留位置：实际使用时替换为真实图片地址 -->

#### 桌面端效果

! `https://github.com/Zewang0217/github_news/raw/main/photos/desktop-example.png`

#### 移动端效果

! `https://github.com/Zewang0217/github_news/raw/main/photos/mobile-example.png`

#### 技术领域分区示例

! `https://github.com/Zewang0217/github_news/raw/main/photos/section-example.png`

## 生成结果

生成的 HTML 文件将保存在当前目录，文件名格式为：

```
YYMMDDHHmm.html
```

例如：`2512281124.html`

### 文件管理建议

* 建立 `output` 目录专门存放生成的 HTML 文件
* 定期清理旧文件或归档到其他位置
* 可以通过文件名快速识别生成时间和内容

## 部署选项

生成的 HTML 文件可以：

1. **本地打开**：直接用浏览器打开生成的 HTML 文件
2. **GitHub Pages**：上传到 GitHub 仓库，开启 GitHub Pages 功能
3. **静态服务器**：部署到任意静态文件服务器

## 项目架构

```
├── src/                 # 源代码目录
│   ├── agent/           # Agent 相关代码
│   ├── config/          # 配置管理
│   ├── generator/       # HTML 生成器
│   └── main.js          # 主入口
├── templates/           # 模板文件
│   ├── tech-digest.hbs  # HTML 模板
│   └── system-prompt.txt # Agent 基础 Prompt
├── config.json          # 默认配置文件
└── package.json         # 项目依赖
```

## 技术说明

### Agent Prompt 设计

* **基础 Prompt**：包含核心角色定义、数据收集规则、筛选标准等
* **用户 Prompt**：作为附加约束，影响内容整理方向
* **安全保障**：用户 Prompt 不会覆盖核心规则，经过安全检查

### 数据收集

* 利用 GitHub REST API 获取指定时间范围的热门项目数据（默认7天）
* 支持自定义时间范围，可根据需求调整
* 每个领域独立处理，确保内容的专业性和相关性
* 严格遵循 GitHub API 调用限制

### HTML 生成

* 使用 Handlebars 模板引擎
* 内联 CSS 样式，确保页面独立性
* 语义化标签，提升可访问性
* 响应式设计，适配不同设备

## 展示

### 主页

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E4%B8%BB%E9%A1%B5.png`

### 使用说明

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.png`

### 历史报告记录

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E5%8E%86%E5%8F%B2%E6%8A%A5%E5%91%8A%E8%AE%B0%E5%BD%95.png`

### 效果展示

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E6%8A%A5%E5%91%8A%E6%95%88%E6%9E%9C%E5%B1%95%E7%A4%BA.png`

### 多关键词

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E6%94%AF%E6%8C%81%E5%A4%9A%E5%85%B3%E9%94%AE%E8%AF%8D%E6%90%9C%E7%B4%A2.png`

### 提示词自定义

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8F%90%E7%A4%BA%E8%AF%8D.png`

### 日期选择

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%97%A5%E6%9C%9F%E8%8C%83%E5%9B%B4.png`

### 单个项目内容

! `https://github.com/Zewang0217/github_news/raw/main/photos/%E9%A1%B9%E7%9B%AE%E5%86%85%E5%AE%B9.png`