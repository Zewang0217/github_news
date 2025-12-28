// 默认提示词
const DEFAULT_PROMPT = '更关注工程实践和性能优化，或更偏向初学者';

// 日期范围类型切换处理
const dateRangeTypeRadios = document.querySelectorAll('input[name="dateRangeType"]');
const customDateRangeDiv = document.getElementById('customDateRange');

// 提示词切换处理
const togglePromptBtn = document.getElementById('togglePromptBtn');
const promptContainer = document.getElementById('promptContainer');
const promptTextarea = document.getElementById('prompt');

// 使用说明切换处理
const toggleUsageBtn = document.getElementById('toggleUsageBtn');
const usageContent = document.getElementById('usageContent');

// 设置默认提示词
promptTextarea.value = DEFAULT_PROMPT;

// 为提示词切换按钮添加事件监听器
togglePromptBtn.addEventListener('click', () => {
    if (promptContainer.style.display === 'none' || promptContainer.style.display === '') {
        promptContainer.style.display = 'block';
    } else {
        promptContainer.style.display = 'none';
    }
});

// 为使用说明切换按钮添加事件监听器
toggleUsageBtn.addEventListener('click', () => {
    if (usageContent.style.display === 'none' || usageContent.style.display === '') {
        usageContent.style.display = 'block';
        toggleUsageBtn.classList.add('active');
    } else {
        usageContent.style.display = 'none';
        toggleUsageBtn.classList.remove('active');
    }
});

// 为每个单选按钮添加事件监听器
dateRangeTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'custom') {
            customDateRangeDiv.style.display = 'block';
        } else {
            customDateRangeDiv.style.display = 'none';
        }
    });
});

// 表单提交处理
document.getElementById('generateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 获取表单数据
    const domains = document.getElementById('domains').value;
    const prompt = document.getElementById('prompt').value;
    
    // 获取日期范围数据
    const selectedDateRangeType = document.querySelector('input[name="dateRangeType"]:checked').value;
    let days, dateRange;
    
    if (selectedDateRangeType === 'custom') {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            alert('请选择开始日期和结束日期');
            return;
        }
        
        // 验证开始日期不晚于结束日期
        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能晚于结束日期');
            return;
        }
        
        dateRange = `${startDate}..${endDate}`;
    } else {
        days = parseInt(selectedDateRangeType);
    }
    
    // 显示加载状态
    showLoading();
    hideResult();
    
    try {
        // 调用API
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domains, prompt, days, dateRange }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 显示结果
            showResult(data.html);
            
            // 显示下载按钮
            document.getElementById('downloadBtn').style.display = 'inline-block';
        } else {
            alert('生成失败：' + data.error);
        }
    } catch (error) {
        console.error('生成失败：', error);
        alert('生成失败，请稍后重试');
    } finally {
        // 隐藏加载状态
        hideLoading();
    }
});

// 下载报告功能
document.getElementById('downloadBtn').addEventListener('click', () => {
    const resultContainer = document.getElementById('resultContainer');
    const htmlContent = resultContainer.innerHTML;
    
    // 创建完整的HTML文档
    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub技术速递</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #444444;
            line-height: 1.6;
            background-color: #f8f9fa;
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(200, 220, 240, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(220, 230, 240, 0.15) 0%, transparent 50%),
                linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%);
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.9);
            min-height: 100vh;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        h1 {
            color: #333333;
            font-size: 28px;
            margin-bottom: 20px;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(176, 196, 222, 0.3);
        }
        
        .generated-info {
            text-align: center;
            color: #666666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        
        section {
            margin-bottom: 40px;
            padding: 25px;
            background: #fafbfc;
            border-radius: 12px;
            border: 1px solid rgba(200, 220, 240, 0.5);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        h2 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(176, 196, 222, 0.3);
        }
        
        article {
            background-color: #ffffff;
            padding: 25px;
            margin-bottom: 25px;
            border-radius: 12px;
            border: 1px solid rgba(200, 220, 240, 0.5);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        article::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #b0c4de, transparent);
            opacity: 0.6;
        }
        
        article:hover {
            box-shadow: 0 6px 20px rgba(176, 196, 222, 0.2);
            transform: translateY(-3px);
            border-color: #b0c4de;
        }
        
        h3 {
            color: #333333;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        h3 a {
            color: #556677;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        h3 a:hover {
            color: #334455;
            text-decoration: underline;
        }
        
        .summary {
            font-weight: bold;
            margin-bottom: 15px;
            color: #444444;
            font-size: 16px;
            opacity: 0.9;
        }
        
        ul {
            margin-left: 25px;
            margin-bottom: 15px;
            color: #555555;
            opacity: 0.9;
        }
        
        li {
            margin-bottom: 8px;
            line-height: 1.8;
        }
        
        .recommendation {
            margin-bottom: 15px;
            color: #667788;
            font-weight: 600;
        }
        
        .detail {
            margin-bottom: 20px;
            color: #555555;
            line-height: 1.8;
            opacity: 0.9;
        }
        
        .meta {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(176, 196, 222, 0.3);
        }
        
        .topics {
            margin-top: 15px;
        }
        
        .topic {
            display: inline-block;
            background: rgba(176, 196, 222, 0.15);
            color: #556677;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 13px;
            margin-right: 10px;
            margin-bottom: 10px;
            border: 1px solid rgba(176, 196, 222, 0.3);
            transition: all 0.3s ease;
        }
        
        .topic:hover {
            background: rgba(176, 196, 222, 0.25);
            box-shadow: 0 2px 8px rgba(176, 196, 222, 0.2);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>最近一周 GitHub 技术速递</h1>
        <div class="generated-info">
            生成时间：${new Date().toLocaleString('zh-CN')}
        </div>
        
        ${htmlContent}
    </div>
</body>
</html>`;
    
    // 创建下载链接
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-tech-digest-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 显示加载状态
function showLoading() {
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    
    generateBtn.disabled = true;
    loading.style.display = 'flex';
}

// 隐藏加载状态
function hideLoading() {
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    
    generateBtn.disabled = false;
    loading.style.display = 'none';
}

// 显示结果
function showResult(html) {
    const resultSection = document.getElementById('resultSection');
    const resultContainer = document.getElementById('resultContainer');
    
    resultContainer.innerHTML = html;
    resultSection.style.display = 'block';
    
    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 隐藏结果
function hideResult() {
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'none';
}

// AI详细介绍功能
function initAIExplainButtons() {
    // 监听所有AI详细介绍按钮的点击事件
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('ai-explain-btn')) {
            const btn = e.target;
            const repo = btn.dataset.repo;
            const description = btn.dataset.description;
            const language = btn.dataset.language;
            const domain = btn.dataset.domain;
            const repoId = btn.closest('article').querySelector('.ai-explanation').id.split('-').pop();
            const explanationDiv = document.getElementById(`ai-explanation-${repoId}`);
            
            // 显示加载状态
            btn.innerHTML = '生成中...';
            btn.disabled = true;
            
            try {
                // 发送请求到API
                const response = await fetch('/api/ai-explain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ repo, description, language, domain }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // 显示AI解释
                    explanationDiv.innerHTML = `
                        <div class="ai-explanation-content">
                            <h4>AI详细分析</h4>
                            <div class="ai-text">${data.explanation.replace(/\n/g, '<br>').replace(/### (.*?)(?=\n|$)/g, '<h5>$1</h5>').replace(/## (.*?)(?=\n|$)/g, '<h4>$1</h4>')}</div>
                            <button class="download-ai-explanation" onclick="downloadAIExplanation('${repo}', '${encodeURIComponent(data.html)}')">下载详细报告</button>
                        </div>
                    `;
                    explanationDiv.style.display = 'block';
                } else {
                    explanationDiv.innerHTML = `<div class="ai-error">生成失败：${data.error}</div>`;
                    explanationDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('生成AI解释失败：', error);
                explanationDiv.innerHTML = '<div class="ai-error">生成失败，请稍后重试</div>';
                explanationDiv.style.display = 'block';
            } finally {
                // 恢复按钮状态
                btn.innerHTML = 'AI详细介绍';
                btn.disabled = false;
            }
        }
    });
}

// 下载AI解释为HTML文件
function downloadAIExplanation(repo, htmlContent) {
    const blob = new Blob([decodeURIComponent(htmlContent)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repo}-ai-explanation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 初始化AI解释按钮
initAIExplainButtons();

// 当结果区域显示时，重新初始化AI解释按钮
const originalShowResult = showResult;
showResult = function(html) {
    originalShowResult(html);
    // 延迟初始化，确保DOM已更新
    setTimeout(initAIExplainButtons, 100);
};

// 历史记录管理

// 获取历史记录
function getHistory() {
    const history = localStorage.getItem('techDigestHistory');
    return history ? JSON.parse(history) : [];
}

// 保存到历史记录
function saveToHistory(html, domains, prompt) {
    const history = getHistory();
    const newRecord = {
        id: Date.now(),
        time: new Date().toLocaleString('zh-CN'),
        domains: domains,
        prompt: prompt,
        html: html
    };
    
    // 限制历史记录数量（最多保存6条）
    history.unshift(newRecord);
    if (history.length > 6) {
        history.pop();
    }
    
    localStorage.setItem('techDigestHistory', JSON.stringify(history));
    updateHistoryPanel();
}

// 删除历史记录
function deleteHistory(id) {
    const history = getHistory();
    const updatedHistory = history.filter(record => record.id !== id);
    localStorage.setItem('techDigestHistory', JSON.stringify(updatedHistory));
    updateHistoryPanel();
}

// 清空所有历史记录
function clearAllHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
        localStorage.removeItem('techDigestHistory');
        updateHistoryPanel();
        alert('历史记录已清空');
    }
}

// 加载历史记录
function loadHistory(id) {
    const history = getHistory();
    const record = history.find(record => record.id === id);
    if (record) {
        showResult(record.html);
        document.getElementById('downloadBtn').style.display = 'inline-block';
        // 更新表单字段
        document.getElementById('domains').value = record.domains;
        document.getElementById('prompt').value = record.prompt;
        // 关闭历史面板
        document.getElementById('historyPanel').style.display = 'none';
    }
}

// 更新历史记录面板
function updateHistoryPanel() {
    const historyList = document.getElementById('historyList');
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">暂无历史记录</div>';
        return;
    }
    
    historyList.innerHTML = history.map(record => `
        <div class="history-item">
            <div class="history-item-info">
                <div class="history-item-time">${record.time}</div>
                <div class="history-item-domains">${record.domains}</div>
                <div class="history-item-prompt">${record.prompt.substring(0, 50)}${record.prompt.length > 50 ? '...' : ''}</div>
            </div>
            <div class="history-item-actions">
                <button class="load-btn" onclick="loadHistory(${record.id})">查看</button>
                <button class="delete-btn" onclick="deleteHistory(${record.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 初始化历史记录功能
function initHistoryFeature() {
    const historyBtn = document.getElementById('historyBtn');
    const historyPanel = document.getElementById('historyPanel');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
    
    // 切换历史面板显示
    historyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (historyPanel.style.display === 'none' || historyPanel.style.display === '') {
            historyPanel.style.display = 'block';
            updateHistoryPanel();
        } else {
            historyPanel.style.display = 'none';
        }
    });
    
    // 关闭历史面板
    closeHistoryBtn.addEventListener('click', () => {
        historyPanel.style.display = 'none';
    });
    
    // 清空所有历史记录
    clearAllHistoryBtn.addEventListener('click', clearAllHistory);
    
    // 点击面板外部关闭
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.history-container')) {
            historyPanel.style.display = 'none';
        }
    });
}

// 在页面加载时初始化历史记录功能
document.addEventListener('DOMContentLoaded', () => {
    initHistoryFeature();
    
    // 尝试恢复最后一次生成的结果
    const history = getHistory();
    if (history.length > 0) {
        // 不自动恢复，只在用户点击历史记录时显示
    }
});

// 修改showResult函数，添加历史记录保存功能
function showResult(html) {
    const resultSection = document.getElementById('resultSection');
    const resultContainer = document.getElementById('resultContainer');
    
    resultContainer.innerHTML = html;
    resultSection.style.display = 'block';
    
    // 保存到历史记录
    const domains = document.getElementById('domains').value;
    const prompt = document.getElementById('prompt').value;
    saveToHistory(html, domains, prompt);
    
    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' });
}