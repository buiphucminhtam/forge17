import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

export async function GET() {
  const stateDir = "/root/state";
  const projects = [];

  try {
    if (fs.existsSync(stateDir)) {
      const files = fs.readdirSync(stateDir);
      for (const file of files) {
        if (file.startsWith("progress_") && file.endsWith(".json")) {
          const projectId = file.replace("progress_", "").replace(".json", "");
          const content = fs.readFileSync(path.join(stateDir, file), "utf-8");
          try {
            const data = JSON.parse(content);
            projects.push({ id: projectId, ...data });
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ projects });
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    if (safeId.length < 2) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const cmd = `rm -rf /root/projects/${safeId} && rm -f /root/state/progress_${safeId}.json /root/state/lock_${safeId}.lock`;
    return new Promise<Response>((resolve) => {
        exec(cmd, (err) => {
           if (err) resolve(NextResponse.json({ error: "Delete failed" }, { status: 500 }));
           else resolve(NextResponse.json({ success: true }));
        });
    });
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, github } = await req.json();
    if (!id || typeof github === 'undefined') return NextResponse.json({ error: "Missing ID or github field" }, { status: 400 });

    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    if (safeId.length < 2) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const statePath = path.join("/root/state", `progress_${safeId}.json`);
    if (!fs.existsSync(statePath)) return NextResponse.json({ error: "Project state not found" }, { status: 404 });

    const content = fs.readFileSync(statePath, "utf-8");
    const data = JSON.parse(content);
    data.github = github;
    fs.writeFileSync(statePath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, project: { id: safeId, ...data } });
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
