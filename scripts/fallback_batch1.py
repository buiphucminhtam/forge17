#!/usr/bin/env python3
import os
import sys
import time
import subprocess
import json

def run_cmd(args, capture=True):
    print(f">> Executing: {' '.join(args[:4])} ...")
    res = subprocess.run(args, capture_output=capture, text=True)
    if res.returncode != 0:
        print(f"ERROR executing {' '.join(args[:4])}:\nstderr: {res.stderr}\nstdout: {res.stdout}")
        sys.exit(1)
    return res.stdout.strip() if capture else None

def main():
    nb_id = "994dbe3b-348d-44b7-9bb5-9ccea54e7bc0"
    task_id = "d53b6016-b859-46be-855a-089b1bee132f"
    topic = "Core Engineering and SaaS Architecture"
    skills_list = ['solution-architect','software-engineer','debugger','database-engineer','code-reviewer','security-engineer','technical-writer','performance-engineer','ai-engineer']
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skill_files = {}
    for skill in skills_list:
        path = os.path.join(base_dir, 'skills', skill, 'SKILL.md')
        skill_files[skill] = path

    print("\n--- 4. Importing Research Sources ---")
    run_cmd(['nlm', 'research', 'import', nb_id, task_id])
    time.sleep(10)

    print("\n--- 5. Batch Skill Upgrading ---")
    for skill_name, skill_file in skill_files.items():
        print(f"\n>> Upgrading Skill: {skill_name}")
        
        with open(skill_file, 'r', encoding='utf-8') as f:
            original_content = f.read()
            
        backup_file = f"{skill_file}.bak"
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(original_content)
            
        print("   -> Uploading original SKILL.md to Context")
        run_cmd(['nlm', 'source', 'add', nb_id, '--title', f'current_{skill_name}.md', '--text', original_content])
        time.sleep(3)
        
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
            pass 

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

if __name__ == '__main__':
    main()
