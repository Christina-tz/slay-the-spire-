import re

with open('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the makeCard function's button line
old_pattern = r"<button class=\"btn-copy\" onclick=\"viewSeed\(''\+s\.seed\+''\)\">"
new_pattern = '<button class="btn-copy" data-seed="+s.seed+" onclick="viewSeed(this.dataset.seed)">'

if old_pattern in content:
    content = content.replace(old_pattern, new_pattern)
    print('Fixed with data-seed approach')
else:
    # Try exact match from file
    old_exact = '<button class="btn-copy" onclick="viewSeed(\'+s.seed+\')">'
    content = content.replace(old_exact, new_pattern)
    print('Fixed with second approach')

with open('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved!')