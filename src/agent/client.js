const axios = require('axios');

// GitHub API 调用配置
const GITHUB_API_BASE = 'https://api.github.com';

// 获取日期范围查询字符串
function getDateRange(days, dateRange) {
  if (dateRange) {
    // 自定义日期范围，格式：YYYY-MM-DD..YYYY-MM-DD
    return `created:${dateRange}`;
  } else {
    // 相对日期范围
    const date = new Date();
    date.setDate(date.getDate() - days);
    const sinceDate = date.toISOString().split('T')[0];
    return `created:>${sinceDate}`;
  }
}

// 调用GitHub API搜索指定日期范围内的热门项目
async function searchGitHubRepos(domain, githubToken, days = 7, dateRange = '') {
  const dateQuery = getDateRange(days, dateRange);
  const params = {
    q: `${domain} ${dateQuery}`,
    sort: 'stars',
    order: 'desc',
    per_page: 5
  };

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': githubToken ? `token ${githubToken}` : undefined
  };

  try {
    const response = await axios.get(`${GITHUB_API_BASE}/search/repositories`, {
      params,
      headers
    });
    return response.data.items;
  } catch (error) {
    console.error(`GitHub API调用失败 (${domain}):`, error.message);
    return [];
  }
}

// 格式化仓库数据为HTML
function formatRepoToHTML(repo, domain) {
  // 摘要截取，最多35字
  const summary = (repo.description || '暂无描述').slice(0, 35) + (repo.description && repo.description.length > 35 ? '...' : '');
  
  // 详细介绍（模拟长文本，实际项目中可以通过API获取更多内容）
  const detail = `这是一个${domain}领域的热门仓库，专注于${repo.description || '提供高质量的开源解决方案'}。该仓库创建于${new Date(repo.created_at).toLocaleDateString()}，最近更新于${new Date(repo.updated_at).toLocaleDateString()}。仓库采用${repo.language || '未知'}语言开发，目前拥有${repo.stargazers_count}个Star和${repo.forks_count}个Fork，社区活跃度高，开发者贡献积极。该项目提供了完整的文档和示例，便于开发者快速上手和集成到自己的项目中。通过学习该仓库的代码结构和设计思路，可以深入了解${domain}领域的最佳实践和技术趋势，对提升开发技能和开阔技术视野具有重要价值。`;
  
  // 推荐理由截取，最多50字
  const recommendation = `该仓库在${domain}领域具有重要影响力，提供了高质量的开源解决方案，值得开发者学习和使用。`.slice(0, 50);
  
  return `<article>
        <h3><a href="${repo.html_url}" target="_blank" aria-label="查看仓库">${repo.name} (${repo.full_name})</a></h3>
        <div class="summary">${summary}</div>
        <ul class="key-points">
          <li>技术栈：${repo.language || '未知'}，开源项目</li>
          <li>社区热度：${repo.stargazers_count} Star，${repo.forks_count} Fork</li>
          <li>最近更新：${new Date(repo.updated_at).toLocaleDateString()}</li>
        </ul>
        <div class="recommendation">推荐理由：${recommendation}</div>
        <details>
          <summary style="cursor: pointer; font-weight: bold; margin: 10px 0;">查看详细介绍</summary>
          <div class="detail">${detail}</div>
        </details>
        <button class="ai-explain-btn" data-repo="${repo.full_name}" data-description="${repo.description || ''}" data-language="${repo.language || '未知'}" data-domain="${domain}">AI详细介绍</button>
        <div class="ai-explanation" id="ai-explanation-${repo.id}" style="display: none;"></div>
        <div class="meta">
          <div>原文链接：<a href="${repo.html_url}" target="_blank">${repo.html_url}</a></div>
          <div class="topics">
            <span class="topic">${domain}</span>
            <span class="topic">${repo.language || '未知'}</span>
            <span class="topic">开源</span>
          </div>
        </div>
      </article>`;
}

async function callAgent(config) {
  const { domains, githubToken, days, dateRange } = config;
  let content = '';
  
  try {
    console.log('开始调用GitHub API收集数据...');
    
    // 1. 遍历每个主题，独立搜索项目
    for (const domain of domains) {
      console.log(`正在收集${domain}领域的数据...`);
      const repos = await searchGitHubRepos(domain, githubToken, days, dateRange);
      console.log(`${domain}领域找到${repos.length}个仓库`);
      
      content += `<section>
      <h2>${domain}</h2>`;
      
      for (const repo of repos) {
        content += formatRepoToHTML(repo, domain);
      }
      
      content += `</section>`;
    }
    
    // 2. 搜索主题组合（如果有多个主题）
    if (domains.length > 1) {
      const combinedDomain = domains.join('+');
      console.log(`正在收集${combinedDomain}组合领域的数据...`);
      const repos = await searchGitHubRepos(domains.join(' '), githubToken, days, dateRange);
      console.log(`${combinedDomain}组合领域找到${repos.length}个仓库`);
      
      if (repos.length > 0) {
        content += `<section>
        <h2>${combinedDomain}</h2>`;
        
        for (const repo of repos) {
          content += formatRepoToHTML(repo, combinedDomain);
        }
        
        content += `</section>`;
      }
    }
    
    // 3. 添加综合文案总结
    content += `<section>
      <h2>综合总结</h2>
      <article style="background-color: #f0f8ff; border: 1px solid #cce6ff;">
        <h3>本周技术速递总结</h3>
        <div class="summary">对本周收集的GitHub热门项目进行综合分析与推荐</div>
        <div class="detail" style="font-size: 16px; line-height: 1.8; margin: 20px 0;">
          <p>本周我们收集了${domains.join('、')}等领域的热门GitHub项目，这些项目在各自领域都展现出了较高的技术水平和社区影响力。</p>
          
          <p>从技术角度来看，这些项目覆盖了多种主流技术栈，包括${domains.join('、')}等，代表了当前开源社区的技术趋势和最佳实践。它们不仅在功能实现上具有创新性，而且在代码质量、文档完整性和社区活跃度方面都表现出色。</p>
          
          <p>对于开发者而言，这些项目具有重要的学习价值：</p>
          <ul>
            <li>通过研究这些项目的代码结构和设计思路，可以深入了解相关领域的技术架构和实现细节</li>
            <li>学习优秀开源项目的开发规范、测试方法和协作流程，提升自身的工程实践能力</li>
            <li>关注这些项目的更新动态，可以及时了解行业最新技术趋势和发展方向</li>
            <li>参与这些项目的贡献，不仅可以提升自己的技术水平，还能扩展人脉资源，建立个人品牌</li>
          </ul>
          
          <p>在使用建议方面，我们推荐开发者根据自身需求和技术栈选择合适的项目：</p>
          <ul>
            <li>对于初学者，可以选择文档完善、社区活跃的项目作为学习资源，逐步掌握相关技术</li>
            <li>对于有经验的开发者，可以考虑将这些项目集成到自己的工作中，提高开发效率和项目质量</li>
            <li>关注那些解决实际问题、具有广泛应用场景的项目，它们往往具有更大的实用价值和发展潜力</li>
          </ul>
          
          <p>总的来说，本周收集的GitHub热门项目展现了开源社区的活力和创新精神，值得广大开发者关注和学习。通过持续跟踪和研究这些项目，我们可以不断提升自己的技术能力，紧跟行业发展步伐，为推动技术进步贡献自己的力量。</p>
        </div>
      </article>
    </section>`;
    
    return content;
  } catch (error) {
    console.error('GitHub数据收集失败：', error.message);
    console.error('错误堆栈：', error.stack);
    throw error;
  }
}

module.exports = { callAgent };