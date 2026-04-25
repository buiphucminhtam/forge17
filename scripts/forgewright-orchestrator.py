import os
import sys
import json
import asyncio
import requests
from typing import List, Dict, Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

API_KEY = os.environ.get('MINIMAX_API_KEY', 'sk-cp-2vP0SZLSFnl_sbVSpxX2S213n39WcIWf4Lo0rkJyxRsrq4JcnoRplWIM4nPQQJ_tPmyn1dhY2ZB9ApwYY3QnxBJlTNPV6WwT3rscQsUxYlEI8oFNoKH0b00')
BASE_URL = 'https://api.minimax.io/v1/text/chatcompletion_v2'

class ForgewrightAgent:
    def __init__(self, project_id: str, code_dir: str):
        self.project_id = project_id
        self.code_dir = code_dir
        self.messages = []
        
    def _call_minimax(self, tools: List[Dict]) -> Dict:
        headers = {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'MiniMax-M2.7',
            'messages': self.messages,
            'temperature': 0.1
        }
        if tools:
            data['tools'] = tools
            
        print(f"[*] Calling MiniMax (Messages: {len(self.messages)})...")
        resp = requests.post(BASE_URL, headers=headers, json=data, timeout=120)
        resp_json = resp.json()
        
        if 'choices' not in resp_json:
            print(f"[!] API Error: {resp_json}")
            sys.exit(1)
            
        return resp_json['choices'][0]['message']

    async def run(self, task: str):
        # Set environment variables for the MCP Server to scope it to the correct project
        server_env = {**os.environ}
        server_env["FORGEWRIGHT_WORKSPACE"] = self.code_dir
        server_env["FORGEWRIGHT_TOOL_SANDBOX"] = "false"
        
        server_params = StdioServerParameters(
            command="npx",
            args=["tsx", "/root/forgewright/forgenexus/src/server.ts"],
            env=server_env
        )
        
        system_prompt = f"""
Bạn là Tiểu Mơ - Siêu Trí Tuệ Forgewright (Level 4 Agent Executor).
Dự án bạn đang làm việc: '{self.project_id}'
Thư mục mã nguồn cục bộ: '{self.code_dir}'

[YÊU CẦU BẮT BUỘC]:
1. Bạn phải TỰ CHỦ sử dụng các Function Tools (do hệ thống MCP cung cấp) để dọc mã nguồn, tạo thư mục, viết/sửa code theo yêu cầu của Sếp.
2. Cấm "đoán" cấu trúc thư mục, hãy dùng lệnh thích hợp để list file trước khi sửa hoặc viết đè.
3. Luôn đảm bảo bạn tự kiểm tra code sau khi viết. 
4. Nếu có tool hỗ trợ chạy Terminal, bạn được phép gọi các lệnh như `npm run build` hoặc `test` để tự Debug kết quả.

Nhiệm vụ từ Sếp: {task}
Khi bạn nghĩ rằng mình ĐÃ THỰC THI XONG VÀ HOÀN CHỈNH CODE, hãy trả về kết quả bằng văn bản bình thường (không gọi tool nữa) để hệ thống kết thúc và deploy.
"""
        self.messages.append({"role": "system", "content": system_prompt.strip()})
        self.messages.append({"role": "user", "content": f"Bắt đầu xử lý tính năng: {task}"})
        
        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    print("[✓] MCP Server connected via stdio")
                    
                    while True:
                        # 1. Fetch available MCP Tools dynamically on each loop
                        mcp_tools = await session.list_tools()
                        tools_payload = []
                        for t in mcp_tools.tools:
                            tools_payload.append({
                                "type": "function",
                                "function": {
                                    "name": t.name,
                                    "description": t.description,
                                    "parameters": t.inputSchema
                                }
                            })
                            
                        # 2. ReAct reasoning with MiniMax
                        reply = self._call_minimax(tools_payload)
                        self.messages.append(reply)
                        
                        # 3. Tool Execution Phase
                        if "tool_calls" in reply and reply["tool_calls"]:
                            for tcall in reply["tool_calls"]:
                                tname = tcall["function"]["name"]
                                targs = json.loads(tcall["function"]["arguments"])
                                print(f" ⚙️  Thực thi Tool: {tname} | Args: {targs}")
                                
                                try:
                                    result = await session.call_tool(tname, arguments=targs)
                                    res_text = "\n".join([c.text for c in result.content if hasattr(c, 'text')])
                                except Exception as e:
                                    res_text = f"Execution Error: {str(e)}"
                                    
                                self.messages.append({
                                    "role": "tool",
                                    "tool_call_id": tcall["id"],
                                    "name": tname,
                                    "content": res_text
                                })
                        else:
                            # Final output reached
                            final_str = reply.get('content', '')
                            print(f"\n[🏁 KẾT THÚC TASK]\n{final_str}")
                            break
        except Exception as err:
            print(f"[!] Orchestrator Error: {str(err)}")
            sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 forgewright-orchestrator.py <PROJECT_ID> <TASK_PROMPT> [CODE_DIR]")
        sys.exit(1)
        
    pid = sys.argv[1]
    task_desc = sys.argv[2]
    cdir = sys.argv[3] if len(sys.argv) > 3 else f"/root/projects/{pid}/code"
    
    agent = ForgewrightAgent(pid, cdir)
    asyncio.run(agent.run(task_desc))
