---
title: 如何使用 Cloudflare Worker 实现延迟测试工具
tags:
  - Cloudflare Workers
  - 延迟测试
  - 前端开发
categories:
  - 网络性能
  - 教程
cover: 'https://i.200536.xyz/2025/02/24/986782.webp'
abbrlink: 29222
date: 2024-11-03 09:24:33
---

# 如何使用 Cloudflare Worker 实现延迟测试工具（建议直接查看完整代码，前面部分介绍为旧版）

在这篇教程中，我们将学习如何使用 Cloudflare Worker 创建一个简单的延迟测试工具。这个工具可以测量多个 URL 的响应延迟，并根据结果重定向用户，同时在页面上显示每个 URL 的延迟信息，使用不同的颜色来指示延迟的高低。

## 更新日志
- 2024-11-03：完成初稿，发布。
- 2024-11-15：添加页脚，优化代码。
- 2024-11-25：引用tcping.com测速api，修复了一些错误。

## 准备工作

1. **注册 Cloudflare 账户**：如果你还没有 Cloudflare 账户，访问 [Cloudflare 官网](https://www.cloudflare.com/) 注册一个账户。
2. **创建一个新的 Worker**：在 Cloudflare 的控制面板中，选择 "Workers" 并创建一个新的 Worker。

## 实现步骤

### 1. 事件监听

首先，我们需要设置一个事件监听器，来处理所有传入的请求。当请求到达时，我们将调用 `handleRequest` 函数。

```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
```

### 2. 构建 HTML 内容

在 `handleRequest` 函数中，我们将生成一个包含加载动画和结果显示区域的 HTML 页面。以下是 HTML 模板：

```javascript
async function handleRequest(request) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Latency Test</title>
        <style>
            body {
                background: linear-gradient(135deg, #e2e2e2, #ffffff);
                animation: backgroundAnimation 10s infinite alternate;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                margin: 0;
            }
            .loader {
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid #3498db;
                width: 120px;
                height: 120px;
                animation: spin 2s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            #result {
                display: none;
                opacity: 0;
                transition: opacity 0.5s;
                text-align: center;
                font-size: 20px;
                color: #3498db;
            }
            @keyframes backgroundAnimation {
                0% { background-color: #ffffff; }
                100% { background-color: #f3f3f3; }
            }
        </style>
    </head>
    <body>
        <div class="loader" id="loader"></div>
        <div id="result"></div>
        <script>
            // JavaScript 代码
        </script>
    </body>
    </html>`;
    
    return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
    });
}
```

加载动画示例：
![加载动画示例](https://i.juz.us.kg/2024/12/23/411647.webp)

### 3. 测量延迟

创建一个名为 `measureLatency` 的函数，该函数将发送一个 `HEAD` 请求来测量 URL 的延迟。

```javascript
async function measureLatency(url) {
    const start = Date.now();
    try {
        await fetch(url, { method: 'HEAD' });
        return Date.now() - start;
    } catch (error) {
        console.error('Error measuring latency:', error);
        return Infinity; // Treat failures as the worst latency
    }
}
```

### 4. 根据延迟重定向

在 `testLatency` 函数中，我们将调用 `measureLatency` 测量两个 URL 的延迟，并根据结果决定重定向到哪个 URL。

```javascript
async function testLatency() {
    const cfPagesUrl = 'https://666.com';
    const vercelUrl = 'https://888.com';

    const cfPagesLatency = await measureLatency(cfPagesUrl);
    const vercelLatency = await measureLatency(vercelUrl);

    const resultElement = document.getElementById('result');
    const loaderElement = document.getElementById('loader');

    loaderElement.style.display = 'none';
    resultElement.style.display = 'block';

    let targetUrl;
    if (cfPagesLatency < vercelLatency) {
        resultElement.innerText = 'Redirecting to CF Pages...';
        targetUrl = cfPagesUrl;
    } else {
        resultElement.innerText = 'Redirecting to Vercel...';
        targetUrl = vercelUrl;
    }
}
```

### 5. 显示延迟信息

动态更新结果区域，显示各个 URL 的延迟，并使用不同的颜色来指示延迟等级：

```javascript
function getColorForLatency(latency) {
    if (latency < 100) return 'green'; // 低延迟
    else if (latency < 300) return 'orange'; // 中等延迟
    else return 'red'; // 高延迟
}

// 显示各个 URL 的延迟
const cfPagesMessage = \`CF Pages 延迟: <span style="color:\${getColorForLatency(cfPagesLatency)};">\${cfPagesLatency} ms</span>\`;
const vercelMessage = \`Vercel 延迟: <span style="color:\${getColorForLatency(vercelLatency)};">\${vercelLatency} ms</span>\`;
resultElement.innerHTML += '<br>' + cfPagesMessage + '<br>' + vercelMessage;
```

结果动画示例：
![结果动画示例](https://i.juz.us.kg/2024/12/23/410867.webp)

### 6. 完整代码 (2024-11-25优化了一下代码)

将所有部分结合在一起，以下是完整的 Cloudflare Worker 代码：

```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Latency Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                min-height: 100vh;
                background: linear-gradient(135deg, #e2e2e2, #ffffff);
            }
            .loader {
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid #3498db;
                width: 100px;
                height: 100px;
                animation: spin 1s linear infinite;
                margin-top: 20%;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            #result {
                width: 80%;
                margin-top: 20px;
                text-align: center;
                font-size: 18px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .result-item {
                font-size: 16px;
            }
            footer {
                width: 100%;
                background: #ebebeb;
                color: white;
                font-size: 14px;
                text-align: center;
                padding: 10px;
            }
            iframe { width: 100%; border: 0; height: 188px; }
        </style>
    </head>
    <body>
        <div class="loader" id="loader"></div>
        <div id="result"></div>
        <footer>
            <iframe src="https://ip.skk.moe/simple"></iframe>
        </footer>
        <script>
            const urls = [
                { name: 'CF Pages', url: 'https://cf.666.com/' },
                { name: 'Vercel', url: 'https://vc.888.com/' },
                { name: 'GitHub', url: 'https://gh.666.com/' },
                { name: 'Netlify', url: 'https://nl.888.com/' },
                { name: '备用', url: 'https://blog.666.com/' },
            ];

            const tcpingApiBaseUrl = 'https://api.jaxing.cc/v2/Tcping';

            async function measureLatency(url, retries = 2, timeout = 2000) {
                for (let attempt = 0; attempt < retries; attempt++) {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);

                    const start = Date.now();
                    try {
                        const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
                        clearTimeout(timeoutId);
                        if (response.ok) return Date.now() - start;
                    } catch (error) {
                        console.warn(\`HTTP attempt \${attempt + 1} failed for \${url}: \`, error);
                    }
                }
                return null; // HTTP 测试失败
            }

            async function measureTcpLatency(url) {
                try {
                    const parsedUrl = new URL(url);
                    const host = parsedUrl.hostname;
                    const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
                    const apiUrl = \`https://api.jaxing.cc/v2/Tcping?host=\${encodeURIComponent(host)}&port=\${port}\`;
            
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error('TCPing API failed');
                    const data = await response.json();
            
                    if (data.code === 'ok' && data.data && data.data['平均延迟']) {
                        let avgLatency = data.data['平均延迟'];
            
                        // 移除单位并解析为数字
                        if (avgLatency.endsWith('ms')) {
                            avgLatency = parseFloat(avgLatency.replace('ms', '')); // 毫秒直接解析为数字
                        } else if (avgLatency.endsWith('s')) {
                            avgLatency = parseFloat(avgLatency.replace('s', '')) * 1000; // 秒转换为毫秒
                        } else {
                            throw new Error('Unsupported latency format'); // 不支持的格式
                        }
            
                        // 保留小数点后三位
                        avgLatency = Math.floor(avgLatency * 1000) / 1000; 
                        return avgLatency;
                    }
            
                    return null; // 如果无法提取平均延迟，则返回 null
                } catch (error) {
                    console.error(\`TCPing failed for \${url}: \`, error);
                    return null;
                }
            }

            async function testLatency() {
                const loaderElement = document.getElementById('loader');
                const resultElement = document.getElementById('result');

                const results = await Promise.all(
                    urls.map(async ({ name, url }) => {
                        let latency = await measureLatency(url);
                        if (latency === null) {
                            console.warn(\`\${name} HTTP 测试失败，尝试 TCPing。\`);
                            latency = await measureTcpLatency(url);
                        }

                        const resultItem = document.createElement('div');
                        resultItem.className = 'result-item';

                        if (latency !== null) {
                            const color = getColorForLatency(latency);
                            resultItem.textContent = \`\${name} 延迟: \`;
                            const span = document.createElement('span');
                            span.style.color = color;
                            span.textContent = \`\${latency} ms\`;
                            resultItem.appendChild(span);
                        } else {
                            resultItem.textContent = \`\${name} 延迟: \`;
                            const span = document.createElement('span');
                            span.style.color = 'red';
                            span.textContent = '失败';
                            resultItem.appendChild(span);
                        }

                        resultElement.appendChild(resultItem);
                        return { name, url, latency };
                    })
                );

                loaderElement.style.display = 'none';
                const successfulResults = results.filter(r => r.latency !== null);
                if (successfulResults.length === 0) {
                    resultElement.innerHTML += '<div>所有 URL 测试均失败，请检查网络或目标站点配置。</div>';
                    return;
                }

                successfulResults.sort((a, b) => a.latency - b.latency);
                const bestOption = successfulResults[0];
                resultElement.innerHTML += \`<div>Redirecting to <strong>\${bestOption.name}</strong>...</div>\`;

                setTimeout(() => {
                    window.location.href = bestOption.url;
                }, 2000);
            }

            function getColorForLatency(latency) {
                if (latency < 200) return 'green';
                if (latency < 600) return 'orange';
                return 'red';
            }

            window.onload = testLatency;
        </script>
    </body>
    </html>`;

    return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
    });
}

```

## 运行和测试

如需要增加或修改 URL，只需要修改 `urls` 数组。如下面代码中，我们添加了两个 URL：

```javascript
async function testLatency() {
                const urls = [
                    { name: 'CF Pages', url: 'https://cf.666.com/' },
                    { name: 'Vercel', url: 'https://vc.888.com/' },
                    { name: 'GitHub', url: 'https://gh.666.com/' },
                    { name: 'Netlify', url: 'https://nl.888.com/' },
                    { name: '备用', url: 'https://blog.666.com/' },
                    { name: '新URL1', url: 'https://newurl1.com/' },
                    { name: '新URL2', url: 'https://newurl2.com/' }
                ];
```

完成上述步骤后，保存并部署你的 Worker。打开分配给你的 Worker 的 URL，你应该能看到加载动画，随后页面将显示测量的延迟和重定向信息。

## 结语

通过本教程，你学会了如何使用 Cloudflare Worker 创建一个延迟测试工具。