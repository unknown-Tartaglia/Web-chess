echo "Starting xiangqi Server..."
php xq/server.php >log/xq.log 2>&1 &
echo "Starting wuziqi Server..."
php wzq/server.php >log/wzq.log 2>&1 &
echo "Starting lianliuqi Server..."
php llq/server.php >log/llq.log 2>&1 &
echo "All servers started."