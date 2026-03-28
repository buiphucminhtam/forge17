#!/usr/bin/env python3
import os
import sys
import time
import subprocess
import json

def run_cmd(args, capture=True):
    res = subprocess.run(args, capture_output=capture, text=True)
    if res.returncode != 0:
        print(f"ERROR executing {' '.join(args[:4])}:\nstderr: {res.stderr}\nstdout: {res.stdout}")
        return None
    return res.stdout.strip() if capture else None

def evaluate_skill(nb_id, skill_name, skill_file):
    with open(skill_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"\n--- Evaluator Step: {skill_name} ---")
    prompt = f"""Evaluate the following rewritten AI Agent Skill definition for {skill_name}.
Score it strictly out of 10 based on:
1. Completeness: Does it address edge cases?
2. Specificity: Are instructions concrete and detailed?
3. 2026 Best Practices: Does it leverage modern tools/workflows effectively?
4. Feasibility: Are the commands and rules executable?
5. Risk Awareness: Does it mention failure fallbacks?

Return ONLY a valid JSON object with EXACTLY two fields:
"score" (a number between 0 and 10, e.g., 8.5)
"feedback" (a brief 1-2 sentence string on why it got that score and what to fix if any).

Do NOT include ```json tags. Output raw JSON only.

SKILL CONTENT TO SCORE:
=======================
{content}
"""
    out_query = run_cmd(['nlm', 'notebook', 'query', nb_id, prompt])
    if not out_query:
        print("Failed to get query output from NLM")
        return 0, "Failed to query NLM", content

    try:
        query_json = json.loads(out_query)
        if "value" in query_json and "answer" in query_json["value"]:
            ans = query_json["value"]["answer"]
            
            # Clean up potential markdown formatting
            ans = ans.strip()
            if ans.startswith("```json"): ans = ans[7:]
            elif ans.startswith("```"): ans = ans[3:]
            if ans.endswith("```"): ans = ans[:-3]
            ans = ans.strip()

            result = json.loads(ans)
            score = float(result.get("score", 0))
            feedback = result.get("feedback", "No feedback.")
            return score, feedback, content
    except Exception as e:
        print(f"Failed to parse LLM evaluation: {e}\nRaw output: {out_query}")
        return 0, "JSON Parsing Error", content
    return 0, "Unknown Output Format", content

def improve_skill(nb_id, skill_name, skill_file, previous_content, feedback):
    print(f"   -> Retrying rewrite for {skill_name}. Feedback: {feedback}")
    prompt = f"""You previously rewrote the skill '{skill_name}', but it scored poorly in evaluation.
The evaluator gave this feedback: {feedback}

Here is the rejected version:
{previous_content}

Please rewrite the SKILL.md. Fix the issues mentioned in the evaluation feedback. Make it 10/10 quality.
CRITICAL INSTRUCTIONS:
1. Retain the exact YAML frontmatter at the top (name, description, etc.).
2. You must output ONLY raw Markdown text. Do NOT wrap it in ```markdown...``` codeblocks. Do not say "Here is the rewritten version". Output the full markdown strictly.
"""
    out_query = run_cmd(['nlm', 'notebook', 'query', nb_id, prompt])
    if not out_query: return False

    try:
        query_json = json.loads(out_query)
        if "value" in query_json and "answer" in query_json["value"]:
            ans = query_json["value"]["answer"]
            
            if ans.startswith("```markdown\n"): ans = ans[12:]
            elif ans.startswith("```\n"): ans = ans[4:]
            if ans.endswith("```"): ans = ans[:-3]
            ans = ans.strip() + "\n"
            
            with open(skill_file, 'w', encoding='utf-8') as f:
                f.write(ans)
            return True
    except Exception as e:
        print(f"Failed to extract re-written skill: {e}")
        return False
    return False

def git_commit_push(skill_name, skill_file, score):
    print(f"   -> [GIT] Committing {skill_name} with score {score}/10")
    run_cmd(['git', 'add', skill_file])
    commit_msg = f"upgrade(agent): {skill_name} to 2026 standards (Score: {score}/10)"
    run_cmd(['git', 'commit', '-m', commit_msg])
    run_cmd(['git', 'push'])

def process_batch(nb_id, skills_list):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for skill in skills_list:
        skill_file = os.path.join(base_dir, 'skills', skill, 'SKILL.md')
        if not os.path.exists(skill_file):
            continue

        attempts = 0
        success = False
        while attempts < 3:
            attempts += 1
            score, feedback, content = evaluate_skill(nb_id, skill, skill_file)
            print(f"   Attempt {attempts} | Score: {score}/10 | Feedback: {feedback}")
            
            if score >= 9.0:
                print(f"   ✓ Quality Gate PASSED ({score}/10). Committing...")
                git_commit_push(skill, skill_file, score)
                success = True
                break
            else:
                print(f"   ✗ Quality Gate FAILED ({score}/10). Asking for improvement...")
                improve_skill(nb_id, skill, skill_file, content, feedback)
                time.sleep(3)
                
        if not success:
            print(f"   !!! FAILED to reach 9.0/10 for {skill} after 3 attempts.")

if __name__ == '__main__':
    # Validate Batch 2
    process_batch('aebeba14-ea5f-4273-8c86-5f81236c6df3',
        ['ux-researcher','ui-designer','mobile-engineer','mobile-tester','accessibility-engineer','api-designer'])
    # Validate Batch 3
    process_batch('a1e19aa3-7310-4db3-9abf-f9deb85cb061',
        ['devops','qa-engineer','sre','data-engineer','data-scientist','web-scraper','xlsx-engineer'])
