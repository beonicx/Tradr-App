#!/bin/bash

# Run Both iOS and Android in Split Terminal (tmux)
# Usage: ./scripts/run-both-tmux.sh [dev|staging|prod]

set -e

ENV=${1:-dev}

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed"
    echo "Install with: brew install tmux"
    exit 1
fi

# Set environment
case $ENV in
  dev|development)
    echo "Environment: DEVELOPMENT"
    cp .env.development .env
    ;;
  staging)
    echo "Environment: STAGING"
    cp .env.staging .env
    ;;
  prod|production)
    echo "Environment: PRODUCTION"
    cp .env.production .env
    ;;
  *)
    echo "Invalid environment: $ENV"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

SESSION_NAME="trading-app"

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

echo "Starting new tmux session: $SESSION_NAME"
echo ""
echo "Layout:"
echo "┌─────────────────────────────────┐"
echo "│        Metro Bundler            │"
echo "├──────────────┬──────────────────┤"
echo "│   iOS Build  │  Android Build   │"
echo "└──────────────┴──────────────────┘"
echo ""
echo "Controls:"
echo "  • Ctrl+B then arrow keys - Navigate panes"
echo "  • Ctrl+B then d - Detach session"
echo "  • tmux attach -t $SESSION_NAME - Re-attach"
echo "  • Ctrl+B then : then 'kill-session' - Stop all"
echo ""
sleep 2

# Create new session with Metro bundler
tmux new-session -d -s $SESSION_NAME -n "TradingApp"

# Run Metro in first pane
tmux send-keys -t $SESSION_NAME "clear && echo '🚀 Starting Metro Bundler...' && npm start" C-m

# Split horizontally for iOS and Android
tmux split-window -h -t $SESSION_NAME

# Split the right pane vertically
tmux split-window -v -t $SESSION_NAME

# Select top-left pane (Metro)
tmux select-pane -t 0

# Wait for Metro to start
sleep 5

# Run iOS in bottom-left pane
tmux select-pane -t 1
tmux send-keys -t $SESSION_NAME "clear && echo '📱 Starting iOS...' && sleep 3 && npm run ios" C-m

# Run Android in bottom-right pane
tmux select-pane -t 2
tmux send-keys -t $SESSION_NAME "clear && echo '🤖 Starting Android...' && sleep 5 && npm run android" C-m

# Attach to the session
tmux attach-session -t $SESSION_NAME
