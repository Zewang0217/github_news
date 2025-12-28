const express = require('express');
const path = require('path');
const fs = require('fs');
const { callAgent } = require('./agent/client');
const { generateHTML } = require('./generator/html');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 解析JSON请求体
app.use(express.json());

// 添加调试路由，查看Vercel环境中的文件结构
app.get('/debug', (req, res) => {
  const cwd = process.cwd();
  const __dirnamePath = __dirname;
  const rootDir = path.resolve(__dirname, '..');
  
  // 查看当前目录下的文件
  fs.readdir(cwd, (err, files) => {
    if (err) {
      res.json({ error: err.message });
      return;
    }
    
    // 查看上一级目录下的文件
    fs.readdir(path.join(cwd, '..'), (err2, files2) => {
      if (err2) {
        res.json({
          cwd,
          __dirname: __dirnamePath,
          rootDir,
          filesInCwd: files,
          errorInParentDir: err2.message
        });
        return;
      }
      
      res.json({
        cwd,
        __dirname: __dirnamePath,
        rootDir,
        filesInCwd: files,
        filesInParentDir: files2
      });
    });
  });
});

// 主页面路由 - 使用内联HTML，避免文件路径问题
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub技术速递生成器</title>
    <style>
        /* 基本样式 - 避免外部CSS依赖 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        p {
            margin-bottom: 15px;
        }
        
        .input-section {
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        button:hover {
            background-color: #2980b9;
        }
        
        footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>GitHub技术速递生成器</h1>
            <p>自动收集并生成指定领域的GitHub热门项目报告</p>
        </header>

        <div class="input-section">
            <form id="generateForm">
                <div class="form-group">
                    <label for="domains">技术领域</label>
                    <input
                        type="text"
                        id="domains"
                        name="domains"
                        placeholder="例如：AI, Java, Rust"
                        required
                    >
                    <small>支持输入多个领域，用逗号分隔</small>
                </div>

                <div class="form-actions">
                    <button type="submit" id="generateBtn">生成技术速递</button>
                </div>
            </form>

            <div id="loading" style="display: none;">
                <p>正在生成技术速递...</p>
            </div>
        </div>

        <div class="result-section" id="resultSection" style="display: none;">
            <h2>生成结果</h2>
            <div id="resultContainer"></div>
        </div>

        <footer>
            <p>&copy; 2025 GitHub技术速递生成器 | 基于GitHub API和DeepSeek大模型</p>
        </footer>
    </div>

    <script>
        // 简化版的前端逻辑
        document.getElementById('generateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const domains = document.getElementById('domains').value;
            const loading = document.getElementById('loading');
            const resultSection = document.getElementById('resultSection');
            const resultContainer = document.getElementById('resultContainer');
            
            loading.style.display = 'block';
            
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        domains: domains,
                        days: 7
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultContainer.innerHTML = data.html;
                    resultSection.style.display = 'block';
                } else {
                    resultContainer.innerHTML = '<p style="color: red;">生成失败：' + data.error + '</p>';
                    resultSection.style.display = 'block';
                }
            } catch (error) {
                resultContainer.innerHTML = '<p style="color: red;">生成失败：' + error.message + '</p>';
                resultSection.style.display = 'block';
            } finally {
                loading.style.display = 'none';
            }
        });
    </script>
</body>
</html>`;
  
  res.send(html);
});

// API端点：生成技术速递
app.post('/api/generate', async (req, res) => {
  try {
    const { domains, prompt, days, dateRange } = req.body;
    
    // 验证输入
    if (!domains || domains.trim() === '') {
      return res.status(400).json({ error: '请输入技术领域' });
    }
    
    // 配置
    const config = {
      domains: domains.split(',').map(d => d.trim()),
      prompt: prompt || '',
      days: days || 7, // 默认最近7天
      dateRange: dateRange || '',
      githubToken: process.env.GITHUB_TOKEN // 只使用环境变量中的Token
    };
    
    console.log('开始生成技术速递：', config);
    
    // 调用Agent生成内容
    const digestContent = await callAgent(config);
    
    // 生成HTML
    const html = generateHTML(digestContent, config);
    
    res.json({ success: true, html });
  } catch (error) {
    console.error('生成失败：', error);
    res.status(500).json({ error: '生成失败，请稍后重试' });
  }
});

// API端点：AI详细介绍
app.post('/api/ai-explain', async (req, res) => {
  try {
    const { repo, description, language, domain } = req.body;
    
    // 验证输入
    if (!repo) {
      return res.status(400).json({ error: '请提供仓库名称' });
    }
    
    // 调用DeepSeek API生成详细介绍
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return res.status(500).json({ error: '请配置DEEPSEEK_API_KEY环境变量' });
    }
    
    const prompt = `请详细介绍GitHub仓库 "${repo}"，包含以下内容：
1. 项目概述：该项目是做什么的，解决了什么问题
2. 技术栈分析：详细说明使用的技术栈，包括语言、框架、库等
3. 核心功能：主要功能和特点
4. 使用方法：如何安装、配置和使用
5. 学术价值：在技术领域的创新点和贡献
6. 实用性分析：在实际应用中的价值和优势
7. 总结和建议：对开发者的建议

已知信息：
- 描述：${description || '暂无描述'}
- 主要语言：${language}
- 所属领域：${domain}

请用清晰、专业的语言撰写，适合开发者阅读。`;
    
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位资深的技术分析师，擅长对开源项目进行深入分析和评估。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const explanation = response.data.choices[0].message.content;
    
    // 生成可下载的HTML
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${repo} - AI详细介绍</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
        }
        
        h2 {
            color: #3498db;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        .meta {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .meta p {
            margin-bottom: 5px;
        }
        
        .download-info {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${repo} - AI详细介绍</h1>
        
        <div class="meta">
            <p><strong>仓库名称：</strong>${repo}</p>
            <p><strong>描述：</strong>${description || '暂无描述'}</p>
            <p><strong>主要语言：</strong>${language}</p>
            <p><strong>所属领域：</strong>${domain}</p>
            <p><strong>生成时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="content">
            ${explanation.replace(/\n/g, '<br>').replace(/### (.*?)(?=\n|$)/g, '<h2>$1</h2>').replace(/## (.*?)(?=\n|$)/g, '<h1>$1</h1>')}
        </div>
        
        <div class="download-info">
            <p>本文档由GitHub技术速递生成器AI分析功能生成</p>
        </div>
    </div>
</body>
</html>`;
    
    res.json({ success: true, explanation, html });
  } catch (error) {
    console.error('AI解释生成失败：', error.response?.data || error.message);
    res.status(500).json({ error: 'AI解释生成失败，请稍后重试' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`GitHub技术速递生成器Web服务已启动，访问地址：http://localhost:${PORT}`);
});