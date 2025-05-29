#!/bin/bash
# 21點遊戲專案 GitHub 推送腳本
# 使用方法: chmod +x push-to-github.sh && ./push-to-github.sh

echo "🎮 準備將21點遊戲專案推送到GitHub..."

# 檢查Git狀態
echo "📋 檢查Git狀態..."
git status

# 提示用戶輸入GitHub倉庫URL
echo ""
echo "📝 請在GitHub上創建新倉庫後，輸入倉庫URL:"
echo "格式範例: https://github.com/你的用戶名/Blackjack-MVVM-Game.git"
read -p "GitHub倉庫URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ 錯誤: 請提供有效的GitHub倉庫URL"
    exit 1
fi

echo ""
echo "🔗 設定遠端倉庫..."
git remote add origin "$REPO_URL"

echo "📤 推送到GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 成功推送到GitHub!"
    echo "📱 你的專案現在可以在以下網址查看:"
    echo "${REPO_URL%.git}"
    echo ""
    echo "✨ 專案特色:"
    echo "  - 🎮 完整的21點遊戲實現"
    echo "  - 🏗️ MVVM架構設計"
    echo "  - 🔧 4個專業調試工具"
    echo "  - 📚 完整的中文文檔"
    echo "  - ⚡ TypeScript + WebSocket"
    echo "  - 📄 MIT開源授權"
else
    echo "❌ 推送失敗，請檢查:"
    echo "  1. GitHub倉庫URL是否正確"
    echo "  2. 是否有推送權限"
    echo "  3. 網絡連接是否正常"
fi
