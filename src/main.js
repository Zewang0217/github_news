const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');
const { callAgent } = require('./agent/client');
const { generateHTML } = require('./generator/html');

// 解析命令行参数
program
  .option('-c, --config <path>', '配置文件路径')
  .option('-d, --domains <domains>', '技术领域列表，逗号分隔')
  .option('-p, --prompt <prompt>', '自定义整理提示词')
  .option('-D, --days <days>', '最近天数，可选值：3、7、30', parseInt)
  .option('-r, --date-range <range>', '自定义日期范围，格式：YYYY-MM-DD..YYYY-MM-DD')
  .parse(process.argv);

async function main() {
  try {
    console.log('开始加载配置...');
    // 加载配置
    const config = loadConfig(program.opts());
    console.log('配置加载成功：', {
      domains: config.domains,
      hasPrompt: !!config.prompt,
      hasApiKey: !!config.deepseekApiKey
    });
    
    console.log('开始调用 Agent...');
    // 调用 Agent 生成内容
    const digestContent = await callAgent(config);
    console.log('Agent 调用成功，内容长度：', digestContent.length);
    
    console.log('开始生成 HTML...');
    // 生成 HTML
    const html = generateHTML(digestContent, config);
    console.log('HTML 生成成功，HTML 长度：', html.length);
    
    // 输出文件
    const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '') + 
                     new Date().toTimeString().slice(0, 5).replace(/:/g, '');
    const filename = `${timestamp}.html`;
    const outputPath = path.join(process.cwd(), filename);
    
    console.log('开始写入文件：', outputPath);
    fs.writeFileSync(outputPath, html);
    console.log(`技术速递已生成：${outputPath}`);
    
  } catch (error) {
    console.error('生成失败：', error.message);
    console.error('完整错误信息：', error);
    process.exit(1);
  }
}

main();