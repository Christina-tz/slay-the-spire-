import re

filepath = 'C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace the line
new_lines = []
for line in lines:
    if 'btn-copy' in line and 'viewSeed' in line and "onclick=" in line:
        # Replace the onclick attribute
        new_line = line.replace(
            'onclick="viewSeed(\\'+s.seed+\')"',
            'data-seed="+s.seed+" onclick="viewSeed(this.dataset.seed)"'
        )
        new_lines.append(new_line)
        print('Found and replaced:', line.strip()[:60])
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done!')