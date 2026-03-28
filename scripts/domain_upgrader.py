#!/usr/bin/env python3
import os
import sys
import time
import subprocess
import json
import re

def run_cmd(args, capture=True):
    print(f">> Executing: {' '.join(args[:4])} ...")
    res = subprocess.run(args, capture_output=capture, text=True)
    if res.returncode != 0:
        print(f"ERROR executing {' '.join(args[:4])}:\nstderr: {res.stderr}\nstdout: {res.stdout}")
        sys.exit(1)
    return res.stdout.strip() if capture else None

def main():
    if len(sys.argv) < 3:
        print("Usage: python domain_upgrader.py <domain_topic> <skill_1,skill_2,...>")
        print("Example: python domain_upgrader.py 'Core Engineering and SaaS Architecture' 'solution-architect,software-engineer,debugger'")
        sys.exit(1)

    topic = sys.argv[1]
    skills_list = [s.strip() for s in sys.argv[2].split(',')]
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 0. Validate skills exist
    skill_files = {}
    for skill in skills_list:
        path = os.path.join(base_dir, 'skills', skill, 'SKILL.md')
        if not os.path.exists(path):
            print(f"Error: {path} not found.")
            sys.exit(1)
        skill_files[skill] = path

    print("\n--- 1. Checking Auth ---")
    run_cmd(['nlm', 'login', '--check'])

    notebook_title = f"Domain: {topic[:30]}"
    print(f"\n--- 2. Creating Domain Notebook: {notebook_title} ---")
    out_create = run_cmd(['nlm', 'notebook', 'create', notebook_title])
    match = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', out_create)
    if not match:
        print("Could not find UUID in output.")
        sys.exit(1)
    nb_id = match.group(0)
    print(f"Notebook ID: {nb_id}")

    print("\n--- 3. ONE-TIME Deep Research for Domain ---")
    research_query = f"State of the art 2026 workflows, software architecture patterns, AI agent prompting techniques, and best practices for {topic}"
    out_research = run_cmd(['nlm', 'research', 'start', research_query, '--notebook-id', nb_id, '--mode', 'deep'])
    
    task_matches = re.findall(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', out_research)
    if not task_matches or len(task_matches) < 2:
        print(f"Failed to extract Task UUID. Output: {out_research}")
        sys.exit(1)
    task_id = task_matches[-1]
    
    print(f"Waiting for deep research {task_id} (~5 min)...")
    subprocess.run(['nlm', 'research', 'status', nb_id, '--task-id', task_id, '--max-wait', '300'])

    print("\n--- 4. Importing Research Sources ---")
    run_cmd(['nlm', 'research', 'import', nb_id, task_id])
    time.sleep(10)

    print("\n--- 5. Batch Skill Upgrading ---")
    for skill_name, skill_file in skill_files.items():
        print(f"\n>> Upgrading Skill: {skill_name}")
        
        # Backup and Read
        with open(skill_file, 'r', encoding='utf-8') as f:
            original_content = f.read()
            
        backup_file = f"{skill_file}.bak"
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(original_content)
            
        # Upload context
        print("   -> Uploading original SKILL.md to Context")
        run_cmd(['nlm', 'source', 'add', nb_id, '--title', f'current_{skill_name}.md', '--text', original_content])
        time.sleep(3)
        
        # Query rewrite
        print("   -> Requesting 2026 Meta-Rewrite")
        prompt = f"""You are a Master Prompt Engineer upgrading the current '{skill_name}' AI Agent skill.
Examine the 'current_{skill_name}.md' source I just uploaded. Then, based on the findings from the deep research on 2026 state-of-the-art workflows for {topic}, write a COMPLETELY UPGRADED version of this SKILL.md.

CRITICAL INSTRUCTIONS:
1. Retain the exact YAML frontmatter at the top (name, description, etc.). Do not change it.
2. Upgrade the internal instructions, giving the agent clearer frameworks (e.g. 2026 best practices).
3. Do not lose the core commands/tools the original skill uses. Enhance them.
4. ONLY return raw Markdown text. Do NOT wrap it in ```markdown...``` codeblocks. I am pipelining this output directly to a file. Do not say "Here is the upgraded version".

Output the full upgraded SKILL.md content now:"""

        out_query = run_cmd(['nlm', 'notebook', 'query', nb_id, prompt])
        
        try:
            query_json = json.loads(out_query)
            if "value" in query_json and "answer" in query_json["value"]:
                out_query = query_json["value"]["answer"]
        except json.JSONDecodeError:
            pass  # It's plain text

        if out_query.startswith("```markdown\n"):
            out_query = out_query[12:]
        elif out_query.startswith("```\n"):
            out_query = out_query[4:]
        if out_query.endswith("```"):
            out_query = out_query[:-3]
        
        out_query = out_query.strip() + "\n"
        
        with open(skill_file, 'w', encoding='utf-8') as f:
            f.write(out_query)
            
        print(f"   ✓ Success! {skill_name} upgraded.")
        time.sleep(2)

    print("\n==================================")
    print("DOMAIN BATCH UPGRADE COMPLETE!")
    print("==================================")

if __name__ == '__main__':
    main()
