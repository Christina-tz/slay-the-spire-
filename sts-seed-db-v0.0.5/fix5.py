filepath = 'C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The exact target string (no escaping needed in the file)
target = 'onclick="viewSeed(\'+s.seed+\')"'
replacement = 'data-seed="+s.seed+" onclick="viewSeed(this.dataset.seed)"'

if target in content:
    content = content.replace(target, replacement)
    print('Found and replaced!')
else:
    print('Target not found, checking...')
    # Debug: show what viewSeed line looks like
    idx = content.find('viewSeed')
    if idx > 0:
        print('Nearby:', repr(content[idx-50:idx+50]))

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)