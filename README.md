# GitHub 技术速递生成器

一个基于 DeepSeek 大模型的用户可配置技术速递网页生成产品，能够自动收集、筛选和整理指定领域的 GitHub 热门项目，并生成美观的静态 HTML 网页。

## 功能特性

- 🔧 **用户可配置**：支持自定义技术领域和整理规则
- 🤖 **Agent 驱动**：利用 DeepSeek 大模型进行智能内容整理
- 📊 **GitHub 数据**：自动从 GitHub 收集最近 7 天的热门项目
- 🎨 **美观网页**：生成符合规范的静态 HTML 页面，支持本地打开和部署
- 📱 **响应式设计**：适配不同设备尺寸

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
  -c, --config <path>    配置文件路径
  -d, --domains <domains>  技术领域列表，逗号分隔
  -p, --prompt <prompt>   自定义整理提示词
  -h, --help              display help for command
```

## 配置说明

### 配置文件格式

```json
{
  "domains": ["AI", "Java"],       // 技术领域列表
  "prompt": "更关注初学者友好的项目",  // 自定义整理提示词
  "deepseekApiKey": "your_key"      // DeepSeek API Key（也可通过环境变量设置）
}
```

### 领域配置

* 可以指定任意数量的技术领域
* 每个领域将在网页中独立分区展示
* 示例：`["AI", "Java", "Rust", "Web3", "Infra", "Data"]`

### 提示词配置

* 提示词将作为附加约束，影响内容整理方向
* 示例：
  * 更关注工程实践
  * 更关注性能 / Infra
  * 更偏向初学者
  * 重点关注开源社区动态

## 生成结果

生成的 HTML 文件将保存在当前目录，文件名格式为：

```
YYMMDDHHmm.html
```

例如：`2512281124.html`

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

* 利用 GitHub REST API 获取最近 7 天的热门项目数据
* 每个领域独立处理，确保内容的专业性和相关性
* 严格遵循 GitHub API 调用限制

### HTML 生成

* 使用 Handlebars 模板引擎
* 内联 CSS 样式，确保页面独立性
* 语义化标签，提升可访问性
* 响应式设计，适配不同设备

## 许可证

MIT