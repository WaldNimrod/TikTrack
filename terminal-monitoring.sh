#!/bin/bash
# Terminal Monitoring - Log all terminal activities
# Add this to your ~/.zshrc to monitor terminal issues:
# 
# function log_command() {
#     echo "[$(date '+%Y-%m-%d %H:%M:%S')] PWD: $(pwd) | CMD: $1" >> ~/terminal-activity.log
# }
# preexec() { log_command "$1"; }

LOGFILE="$HOME/cursor-terminal-debug.log"

echo "=== Terminal Monitor Active ===" | tee -a "$LOGFILE"
echo "Started: $(date)" | tee -a "$LOGFILE"
echo "Cursor Version: $(defaults read /Applications/Cursor.app/Contents/Info.plist CFBundleShortVersionString 2>/dev/null || echo 'Unknown')" | tee -a "$LOGFILE"
echo "Shell: $SHELL" | tee -a "$LOGFILE"
echo "TERM: $TERM" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"

# Monitor Cursor processes
echo "Active Cursor processes:" | tee -a "$LOGFILE"
ps aux | grep -i cursor | grep -v grep | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"

echo "✅ Monitoring data saved to: $LOGFILE"

