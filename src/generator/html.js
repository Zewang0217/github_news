const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

function generateHTML(content, config) {
  // 读取模板
  const templatePath = path.join(__dirname, '../../templates/tech-digest.hbs');
  const template = fs.readFileSync(templatePath, 'utf8');
  
  // 编译模板
  const compiledTemplate = handlebars.compile(template);
  
  // 生成 HTML
  const html = compiledTemplate({
    content,
    generatedAt: new Date().toLocaleString('zh-CN'),
    domains: config.domains,
    domainsText: config.domains.join('、')
  });
  
  return html;
}

module.exports = { generateHTML };