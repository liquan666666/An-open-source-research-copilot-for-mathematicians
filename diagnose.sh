#!/bin/bash

echo "🔍 MathResearchPilot 诊断脚本"
echo "================================"
echo ""

# 1. 检查 Docker 是否运行
echo "1️⃣ 检查 Docker 状态..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行"
    echo "   请启动 Docker Desktop 应用程序"
    exit 1
fi
echo "✅ Docker 正在运行"
echo ""

# 2. 检查容器状态
echo "2️⃣ 检查容器状态..."
if docker ps | grep -q "math-copilot-api"; then
    echo "✅ API 容器正在运行"
else
    echo "❌ API 容器未运行"
    echo "   正在启动容器..."
    docker-compose up -d api
    sleep 5
fi

if docker ps | grep -q "math-copilot-web"; then
    echo "✅ Web 容器正在运行"
else
    echo "❌ Web 容器未运行"
    echo "   正在启动容器..."
    docker-compose up -d web
    sleep 5
fi
echo ""

# 3. 检查端口
echo "3️⃣ 检查端口占用..."
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "✅ 端口 8000 已使用（API 服务）"
else
    echo "⚠️  端口 8000 未使用"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ 端口 3000 已使用（Web 服务）"
else
    echo "⚠️  端口 3000 未使用"
fi
echo ""

# 4. 测试 API 健康检查
echo "4️⃣ 测试 API 连接..."
sleep 2
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API 服务正常响应"
    curl -s http://localhost:8000/health
else
    echo "❌ API 服务无响应"
    echo "   查看 API 日志："
    docker-compose logs --tail=20 api
fi
echo ""

# 5. 测试前端连接
echo "5️⃣ 测试前端连接..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务正常响应"
else
    echo "❌ 前端服务无响应"
    echo "   查看 Web 日志："
    docker-compose logs --tail=20 web
fi
echo ""

# 6. 显示服务 URL
echo "================================"
echo "✨ 服务地址："
echo "   📡 API 文档: http://localhost:8000/docs"
echo "   🌐 前端页面: http://localhost:3000"
echo "   📝 注册页面: http://localhost:3000/auth/register"
echo ""
echo "💡 提示："
echo "   - 如果服务未启动，运行: docker-compose up"
echo "   - 查看实时日志: docker-compose logs -f"
echo "   - 重启服务: docker-compose restart"
echo "================================"
