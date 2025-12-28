const fs = require('fs');
const path = require('path');
require('dotenv').config();

function loadConfig(options) {
  // 默认配置
  const defaultConfig = {
    domains: ['AI', 'Java'],
    prompt: '',
    days: 7, // 默认最近7天
    dateRange: '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    githubToken: process.env.GITHUB_TOKEN
  };
  
  // 加载配置文件
  let configFromFile = {};
  if (options.config) {
    const configPath = path.resolve(options.config);
    if (fs.existsSync(configPath)) {
      configFromFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } else {
    // 尝试加载默认配置文件
    const defaultConfigPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(defaultConfigPath)) {
      configFromFile = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    }
  }
  
  // 合并配置（命令行参数优先级最高，然后是配置文件，最后是默认值）
  const config = {
    ...defaultConfig,
    ...configFromFile,
    ...options
  };
  
  // 处理 domains 格式
  if (typeof config.domains === 'string') {
    config.domains = config.domains.split(',').map(d => d.trim());
  }
  
  // 验证配置
  if (!config.deepseekApiKey) {
    throw new Error('缺少 DeepSeek API Key，请在环境变量或配置文件中设置');
  }
  
  if (!Array.isArray(config.domains) || config.domains.length === 0) {
    throw new Error('请至少指定一个技术领域');
  }
  
  // 验证天数参数
  if (config.days && ![3, 7, 30].includes(config.days)) {
    throw new Error('天数参数无效，可选值：3、7、30');
  }
  
  // 验证日期范围格式
  if (config.dateRange) {
    const dateRangeRegex = /^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/;
    if (!dateRangeRegex.test(config.dateRange)) {
      throw new Error('日期范围格式无效，正确格式：YYYY-MM-DD..YYYY-MM-DD');
    }
  }
  
  // 限制用户 prompt 长度
  if (config.prompt && config.prompt.length > 500) {
    config.prompt = config.prompt.slice(0, 500) + '...';
  }
  
  return config;
}

module.exports = { loadConfig };