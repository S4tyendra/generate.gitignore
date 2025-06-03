#!/bin/bash

echo "🚀 Cloning GitHub's gitignore repository..."
git clone https://github.com/github/gitignore.git temp_gitignore

cd temp_gitignore

echo "📝 Generating gitignore files array..."

cat > ../gitignorefiles.js << 'EOF'
const gitignorefiles = [
EOF

# Process all .gitignore files recursively
find . -name "*.gitignore" -type f | while read -r file; do
    # Remove ./ prefix and .gitignore suffix, replace / with -
    title=$(echo "$file" | sed 's|^\./||' | sed 's|\.gitignore$||' | sed 's|/|-|g')
    
    # Base64 encode the content
    content=$(base64 -w 0 "$file")
    
    echo "  {" >> ../gitignorefiles.js
    echo "    title: \"$title\"," >> ../gitignorefiles.js
    echo "    contents: \"$content\"" >> ../gitignorefiles.js
    echo "  }," >> ../gitignorefiles.js
done

# Close the array
echo "];" >> ../gitignorefiles.js

cd ..
rm -rf temp_gitignore

echo "✅ Generated gitignorefiles.js with $(grep -c "title:" gitignorefiles.js) gitignore templates!"
