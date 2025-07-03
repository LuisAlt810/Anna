cat > start.sh << 'EOF'
#!/bin/bash

while true
do
  node index.js
  
  echo "Bot crashed or exited, restarting in 60 seconds..."
  sleep 60
done
EOF

