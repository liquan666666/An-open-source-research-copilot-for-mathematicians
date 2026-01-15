#!/bin/bash

echo "🔄 开始更新代码..."
echo ""

# 1. 检查当前状态
echo "📋 当前分支："
git branch --show-current

# 2. 保存本地未提交的更改
echo ""
echo "💾 保存本地更改..."
git stash

# 3. 拉取最新代码
echo ""
echo "⬇️  拉取远程最新代码..."
git pull origin $(git branch --show-current)

# 4. 恢复本地更改
echo ""
echo "📂 恢复本地更改..."
git stash pop 2>/dev/null || echo "没有需要恢复的更改"

# 5. 显示最新的提交
echo ""
echo "✅ 更新完成！最近的提交："
git log --oneline -3

echo ""
echo "🎉 代码已更新到最新版本！"
