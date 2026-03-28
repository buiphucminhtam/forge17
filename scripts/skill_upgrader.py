#!/usr/bin/env python3
import os
import sys
import time
import subprocess
import json
import re

def run_cmd(args, capture=True):
    print(f"Running: {' '.join(args[:3])} ...")  # print truncated command
    res = subprocess.run(args, capture_output=capture, text=True)
    if res.returncode != 0:
        print(f"ERROR executing {' '.join(args[:3])}:\nstderr: {res.stderr}\nstdout: {res.stdout}")
        sys.exit(1)
    return res.stdout.strip() if capture else None

def main():
    if len(sys.argv) < 3:
        print("Usage: python skill_upgrader.py <skill_name> <domain_topic>")
        sys.exit(1)

    skill_name = sys.argv[1]
    topic = sys.argv[2]
    
    # Path inside Forgewright submodule
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skill_dir = os.path.join(base_dir, 'skills', skill_name)
    skill_file = os.path.join(skill_dir, 'SKILL.md')

    if not os.path.exists(skill_file):
        print(f"Error: {skill_file} not found.")
        sys.exit(1)

    print("--- 1. Checking Auth ---")
    run_cmd(['nlm', 'login', '--check'])

    notebook_title = f"Upgrade: {skill_name}"
    print(f"--- 2. Creating notebook: {notebook_title} ---")
    # nlm notebook create returns just the ID when it ends, but prints "Creating..." to stderr usually. 
    # Or we can just use --quiet if available. 
    # Let's create and parse the UUID
    out_create = run_cmd(['nlm', 'notebook', 'create', notebook_title])
    # Extract uuid from output using regex
    match = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', out_create)
    if not match:
        print("Could not find UUID in output.")
        sys.exit(1)
    nb_id = match.group(0)
    print(f"Notebook ID: {nb_id}")

    print("--- 3. Uploading original SKILL.md ---")
    with open(skill_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    backup_file = f"{skill_file}.bak"
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(original_content)
        
    run_cmd(['nlm', 'source', 'add', nb_id, '--title', 'current_SKILL.md', '--text', original_content])
    time.sleep(2)

    print("--- 4. Deep Research ---")
    research_query = f"State of the art 2026 workflows, modern AI agent prompting techniques, and best practices for {topic}"
    out_research = run_cmd(['nlm', 'research', 'start', research_query, '--notebook-id', nb_id, '--mode', 'deep'])
    # Extract task ID
    task_match = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', out_research)
    if not task_match:
        print(f"Failed to find Task UUID. Output: {out_research}")
        sys.exit(1)
    task_id = task_match.group(0)
    
    print(f"Wait for research task {task_id} to complete (up to 5 min)...")
    subprocess.run(['nlm', 'research', 'status', nb_id, '--task-id', task_id, '--max-wait', '300'])

    print("--- 5. Importing Sources ---")
    run_cmd(['nlm', 'research', 'import', nb_id, task_id])
    time.sleep(5)

    print("--- 6. Querying LLM for Rewrite ---")
    prompt = f"""You are a Master Prompt Engineer upgrading the current '{skill_name}' AI Agent skill.
Examine the 'current_SKILL.md' source I uploaded. Then, based on the findings from the deep research on 2026 state-of-the-art workflows for {topic}, write a COMPLETELY UPGRADED version of this SKILL.md.

CRITICAL INSTRUCTIONS:
1. Retain the exact YAML frontmatter at the top (name, description, etc.). Do not change it.
2. Upgrade the internal instructions, giving the agent clearer frameworks (e.g. 2026 best practices).
3. Do not lose the core commands/tools the original skill uses. Enhance them.
4. ONLY return raw Markdown text. Do NOT wrap it in ```markdown...``` codeblocks. I am pipelining this output directly to a file. Do not say "Here is the upgraded version".

Output the full upgraded SKILL.md content now:"""

    out_query = run_cmd(['nlm', 'notebook', 'query', nb_id, prompt])
    
    # Since nlm might return output in JSON if configured, safely parse it
    try:
        query_json = json.loads(out_query)
        if "value" in query_json and "answer" in query_json["value"]:
            out_query = query_json["value"]["answer"]
    except json.JSONDecodeError:
        pass  # Was already plain text
    
    # Strip markdown fences if standard LLM ignores rule 4
    if out_query.startswith("```markdown\n"):
        out_query = out_query[12:]
    elif out_query.startswith("```\n"):
        out_query = out_query[4:]
    if out_query.endswith("```"):
        out_query = out_query[:-3]
    
    out_query = out_query.strip() + "\n"
    
    print(f"--- 7. Overwriting {skill_file} ---")
    with open(skill_file, 'w', encoding='utf-8') as f:
        f.write(out_query)
        
    print(f"DONE! Upgraded {skill_name}. Backup: SKILL.md.bak")

if __name__ == '__main__':
    main()
