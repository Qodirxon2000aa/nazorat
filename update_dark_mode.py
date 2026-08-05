import os

# We will replace #09090b with a deep slate/blue: #020617 (slate-950)
# We will replace #121214 with #0f172a (slate-900)

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    content = content.replace('#09090b', '#020617')
    content = content.replace('#121214', '#0f172a')
    # Also replace white/5 borders with something that has a subtle blue tint
    # dark:border-white/5 -> dark:border-slate-800
    content = content.replace('dark:border-white/5', 'dark:border-slate-800')
    content = content.replace('dark:border-white/10', 'dark:border-slate-700')
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))
