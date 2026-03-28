#!/usr/bin/env python3
import os
import sys
import time
import subprocess
import json
import re
import ast

def extract_answer(raw_output):
    """Extract answer from NLM --json output: {'value': {'answer': '...'}}
    The --json flag returns real JSON but stdout may also have the update notice appended.
    Find and parse just the JSON portion.
    """
    # Find the JSON object start
    brace_start = raw_output.find('{')
    if brace_start == -1:
        print(f"   -> DEBUG: No opening brace found in raw_output.")
        print(f"      STDOUT Start: {raw_output[:200]}")
        print(f"      STDOUT End: {raw_output[-200:]}")
        return None
    
    # Find the matching closing brace
    depth = 0
    in_str = False
    escape = False
    str_char = None
    end_idx = brace_start
    for i in range(brace_start, len(raw_output)):
        ch = raw_output[i]
        if escape:
            escape = False
            continue
        if ch == '\\' and in_str:
            escape = True
            continue
        if in_str:
            if ch == str_char:
                in_str = False
            continue
        if ch in ('"', "'"):
            in_str = True
            str_char = ch
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end_idx = i + 1
                break
    
    json_str = raw_output[brace_start:end_idx]
    try:
        data = json.loads(json_str)
        return data.get('value', {}).get('answer', '')
    except Exception as e:
        print(f"   -> JSON parse error: {e}")
        return None

def run_cmd(args, capture=True, ignore_errors=False):
    print(f">> Executing: {' '.join(args[:4])} ...")
    res = subprocess.run(args, capture_output=capture, text=True)
    if res.returncode != 0 and not ignore_errors:
        print(f"ERROR executing {' '.join(args[:4])}:\nstderr: {res.stderr}\nstdout: {res.stdout}")
        return None
    return res.stdout.strip() if capture else None

def get_task_id(nb_id):
    # We must run with a short max-wait so it returns quickly and prints the summary
    out = run_cmd(['nlm', 'research', 'status', nb_id, '--max-wait', '1'], ignore_errors=True)
    if not out:
        return None
    task_match = re.search(r'Task ID:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', out)
    if not task_match:
        return None
    return task_match.group(1)

def ensure_research(nb_id, topic):
    out = run_cmd(['nlm', 'research', 'status', nb_id, '--max-wait', '1'], ignore_errors=True)
    if out and "Sources available" in out and "0" not in out.split("Sources available:")[1].split()[0]:
        print("   -> Found existing completed research with sources. Importing...")
        task_id = get_task_id(nb_id)
        if task_id:
            run_cmd(['nlm', 'research', 'import', nb_id, task_id], ignore_errors=True)
            return True

    print(f"   -> Starting NEW Deep Research for: {topic}")
    query = f"State of the art 2026 workflows, software architecture patterns, AI agent prompting techniques, and best practices for {topic}"
    run_cmd(['nlm', 'research', 'start', query, '--notebook-id', nb_id, '--mode', 'deep', '--force'])
    
    print("   -> Waiting 240s for deep research to complete...")
    for _ in range(6):
        time.sleep(40)
        status = run_cmd(['nlm', 'research', 'status', nb_id, '--max-wait', '5'], ignore_errors=True)
        if status and "completed" in status.lower() and "Sources available" in status:
            print("   -> Deep Research Completed!")
            break
            
    task_id = get_task_id(nb_id)
    if not task_id:
        print("   -> Error getting Task ID. Trying to proceed anyway...")
        return False
        
    print(f"   -> Importing Task {task_id}")
    run_cmd(['nlm', 'research', 'import', nb_id, task_id], ignore_errors=True)
    return True

def git_commit_push(skill_name, skill_file, score):
    print(f"   -> [GIT] Committing {skill_name} with score {score}/10")
    run_cmd(['git', 'add', skill_file])
    commit_msg = f"upgrade(agent): {skill_name} to 2026 standards (Score: {score}/10)"
    run_cmd(['git', 'commit', '-m', commit_msg], ignore_errors=True)
    # The push might require cache, assuming it's ready.
    res = subprocess.run(['git', 'push'], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"   -> [GIT PUSH FAILED] Proceeding anyway. {res.stderr}")

def evaluate_skill(nb_id, skill_name, content):
    print(f"   -> Evaluating {skill_name}...")
    
    # 1. Upload content as context to avoid query limit
    source_title = f"{skill_name}_eval.md"
    print(f"   -> Uploading {source_title} for evaluation...")
    out_add = run_cmd(['nlm', 'source', 'add', nb_id, '--title', source_title, '--text', content], ignore_errors=True)
    if not out_add:
        return 0, "Failed to upload eval source"
        
    source_match = re.search(r'Source ID:\s*([0-9a-f-]{36})', out_add)
    if not source_match:
        return 0, "Failed to parse eval source ID"
    source_id = source_match.group(1)

    try:
        # 2. Query NotebookLM referencing the source
        prompt = f"""Evaluate the '{source_title}' AI Agent Skill definition I just uploaded for {skill_name}.
Score it strictly out of 10 based on:
1. Completeness: Does it address edge cases?
2. Specificity: Are instructions concrete and detailed?
3. 2026 Best Practices: Does it leverage modern tools/workflows effectively?
4. Feasibility: Are the commands and rules executable?
5. Risk Awareness: Does it mention failure fallbacks?

Return ONLY a valid JSON object with EXACTLY two fields:
"score" (a number between 0 and 10, e.g., 8.5)
"feedback" (a brief 1-2 sentence string on why it got that score and what to fix if any).

Do NOT include ```json tags. Output raw JSON only."""

        out_query = run_cmd(['nlm', 'notebook', 'query', nb_id, prompt, '--json'], ignore_errors=True)
        if not out_query:
            return 0, "Failed to query NLM"

        ans = extract_answer(out_query)
        if not ans:
            return 0, "Could not extract answer from NLM response"
        
        try:
            # Clean up potential markdown code fences
            ans = ans.strip()
            if ans.startswith("```json"): ans = ans[7:]
            elif ans.startswith("```"): ans = ans[3:]
            if ans.endswith("```"): ans = ans[:-3]
            ans = ans.strip()
            # Extract JSON from anywhere in the answer
            json_match = re.search(r'\{[^{}]*"score"[^{}]*\}', ans, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
            else:
                result = json.loads(ans)
            score = float(result.get("score", 0))
            feedback = result.get("feedback", "No feedback.")
            return score, feedback
        except Exception as e:
            print(f"   -> Eval parse error: {e}. Raw answer: {ans[:200]}")
            return 0, "JSON Parsing Error"
    finally:
        # 3. Clean up the source
        print(f"   -> Cleaning up {source_title} ({source_id})...")
        run_cmd(['nlm', 'source', 'remove', nb_id, source_id, '--confirm'], ignore_errors=True)
    return 0, "Unknown Error"

def rewrite_skill(nb_id, skill_name, skill_file, original_content, attempts, feedback=""):
    print(f"\n>> Generating {skill_name} (Attempt {attempts}/3)...")
    
    # 1. Upload content as source to bypass 4000 char prompt limit
    source_title = f"{skill_name}_v{attempts}.md"
    upload_content = original_content if attempts == 1 else open(skill_file, 'r', encoding='utf-8').read()
    
    print(f"   -> Uploading {source_title} as context source...")
    out_add = run_cmd(['nlm', 'source', 'add', nb_id, '--title', source_title, '--text', upload_content], ignore_errors=True)
    if not out_add:
        print("   -> Failed to upload source.")
        return False
        
    source_match = re.search(r'Source ID:\s*([0-9a-f-]{36})', out_add)
    if not source_match:
        print("   -> Failed to parse source ID.")
        return False
    source_id = source_match.group(1)
    
    try:
        # 2. Query NotebookLM referencing the source
        if attempts == 1:
            prompt = f"""You are a Master Prompt Engineer upgrading the '{skill_name}' AI Agent skill.
Examine the '{source_title}' source I just uploaded. Based on your 2026 deep research, write a COMPLETELY UPGRADED version of this SKILL.md.

CRITICAL INSTRUCTIONS:
1. Retain the EXACT YAML frontmatter at the top. Do not change it.
2. Upgrade internal instructions with 2026 best practices.
3. Output ONLY raw Markdown. Do NOT wrap it in ```markdown...``` codeblocks.
"""
        else:
            prompt = f"""You previously rewrote the '{skill_name}' skill in the '{source_title}' source, but it scored poorly in evaluation.
The evaluator gave this feedback: {feedback}

Examine '{source_title}'. REWRITE it to achieve 10/10 quality. Fix the issues above. Keep the YAML frontmatter intact. ONLY RETURN RAW MARKDOWN."""

        out_query = run_cmd(['nlm', 'notebook', 'query', nb_id, prompt, '--json'], ignore_errors=True)
        if not out_query: return False

        ans = extract_answer(out_query)
        if not ans:
            print(f"   -> Could not extract answer from NLM output")
            return False

        if ans.startswith("```markdown\n"): ans = ans[12:]
        elif ans.startswith("```\n"): ans = ans[4:]
        if ans.endswith("```"): ans = ans[:-3]
        ans = ans.strip() + "\n"
        
        with open(skill_file, 'w', encoding='utf-8') as f:
            f.write(ans)
        return ans
    finally:
        # 3. Always clean up the source so notebook doesn't hit 50 limit!
        print(f"   -> Cleaning up {source_title} ({source_id})...")
        run_cmd(['nlm', 'source', 'remove', nb_id, source_id, '--confirm'], ignore_errors=True)


def process_batch(nb_id, topic, skills_list):
    print(f"\n======================================")
    print(f"Processing Batch: {topic[:30]}...")
    
    ensure_research(nb_id, topic)
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for skill in skills_list:
        skill_file = os.path.join(base_dir, 'skills', skill, 'SKILL.md')
        if not os.path.exists(skill_file):
            print(f"Skipping {skill}, file not found.")
            continue
            
        with open(skill_file, 'r', encoding='utf-8') as f:
            original_content = f.read()

        attempts = 1
        feedback = ""
        while attempts <= 3:
            new_content = rewrite_skill(nb_id, skill, skill_file, original_content, attempts, feedback)
            if not new_content:
                print("   -> Failed to generate content. Retrying...")
                attempts += 1
                continue
                
            score, feedback = evaluate_skill(nb_id, skill, new_content)
            print(f"   -> Evaluated: Score: {score}/10 | Feedback: {feedback}")
            
            if score >= 9.0:
                print(f"   ✓ Score PASSED ({score}/10).")
                git_commit_push(skill, skill_file, score)
                break
            else:
                print(f"   ✗ Score FAILED ({score}/10). Required ≥9.0")
                attempts += 1

        if attempts > 3:
            print(f"   !!! FAILED to reach 9.0/10 for {skill} after 3 attempts.")

if __name__ == '__main__':
    # Batch 5: AI Orchestration, Growth, Business
    process_batch('cd10fd26-d830-4d6b-8e32-7e4d7c9cdf8d',
        'AI Agent Orchestration, Polymath general reasoning, MCP/Prompt engineering, Product/Project Management workflows, and Growth/Conversion Optimization best practices 2026',
        [
            'business-analyst', 'product-manager', 'project-manager', 'growth-marketer',
            'conversion-optimizer', 'prompt-engineer', 'prompt-optimizer', 'skill-maker',
            'mcp-generator', 'memory-manager', 'parallel-dispatch', 'polymath',
            'auto-optimization-engineer'
        ]
    )
