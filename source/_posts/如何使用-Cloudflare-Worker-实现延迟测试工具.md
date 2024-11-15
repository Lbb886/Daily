---
title: 如何使用 Cloudflare Worker 实现延迟测试工具
tags:
  - Cloudflare Workers
  - 延迟测试
  - 前端开发
categories:
  - 网络性能
  - 教程
cover: 'https://i.gob.us.kg/2024/11/03/396273.png'
abbrlink: 29222
date: 2024-11-03 09:24:33
---

# 如何使用 Cloudflare Worker 实现延迟测试工具

在这篇教程中，我们将学习如何使用 Cloudflare Worker 创建一个简单的延迟测试工具。这个工具可以测量多个 URL 的响应延迟，并根据结果重定向用户，同时在页面上显示每个 URL 的延迟信息，使用不同的颜色来指示延迟的高低。

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
![加载动画示例](https://i.gob.us.kg/2024/11/03/208932.webp)

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
![结果动画示例](https://i.gob.us.kg/2024/11/03/302980.webp)

### 6. 完整代码 (2024-11-15优化了一下代码)

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
            async function measureLatency(url, retries = 3) {
                let latency = Infinity; // 初始化为最大值
                for (let i = 0; i < retries; i++) {
                    const start = Date.now();
                    try {
                        await fetch(url, { method: 'HEAD' });
                        latency = Date.now() - start;
                        break; // 如果成功，跳出循环
                    } catch (error) {
                        console.warn(\`Retry \${i + 1} failed for \${url}\`);
                    }
                }
                return latency;
            }

            function getColorForLatency(latency) {
                if (latency < 100) return 'green';
                if (latency < 300) return 'orange';
                return 'red';
            }

            async function testLatency() {
                const urls = [
                    { name: 'CF Pages', url: 'https://cf.666.com/' },
                    { name: 'Vercel', url: 'https://vc.888.com/' },
                    { name: 'GitHub', url: 'https://gh.666.com/' },
                    { name: 'Netlify', url: 'https://nl.888.com/' },
                    { name: '备用', url: 'https://blog.666.com/' }
                ];

                const results = await Promise.all(
                    urls.map(async ({ name, url }) => {
                        const latency = await measureLatency(url);
                        return { name, url, latency };
                    })
                );

                results.sort((a, b) => a.latency - b.latency);

                const resultElement = document.getElementById('result');
                const loaderElement = document.getElementById('loader');

                loaderElement.style.display = 'none';
                resultElement.style.display = 'block';

                results.forEach(({ name, latency }) => {
                    resultElement.innerHTML += \`\${name} 延迟: <span style="color:\${getColorForLatency(latency)};">\${latency} ms</span><br>\`;
                });

                const bestOption = results[0];
                resultElement.innerHTML += '<br>Redirecting to ' + bestOption.name + '...';

                setTimeout(() => {
                    resultElement.style.opacity = 1;
                    setTimeout(() => {
                        window.location.href = bestOption.url;
                    }, 2000);
                }, 100);
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