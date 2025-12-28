const fs = require('fs');
const path = require('path');

function getSystemPrompt(userPrompt = '') {
  // 读取基础 Prompt
  const promptPath = path.join(__dirname, '../../templates/system-prompt.txt');
  let basePrompt = fs.readFileSync(promptPath, 'utf8');
  
  // 拼接用户 Prompt
  if (userPrompt) {
    basePrompt += `\n\n## 用户附加偏好\n${userPrompt}`;
  }
  
  return basePrompt;
}

module.exports = { getSystemPrompt };