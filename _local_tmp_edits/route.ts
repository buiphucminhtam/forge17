import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { task, project, repoUrl } = await req.json();
    if (!task || !project) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const safeTask = task.replace(/'/g, "''").replace(/\n/g, " "); 
    const safeProject = project.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeRepo = repoUrl ? repoUrl.replace(/'/g, "''") : "";

    // Phase 16: Admin Gatekeeper for System Core
    if (["tieumo", "forgewright", "openclaw"].includes(safeProject.toLowerCase())) {
        if (!task.includes("157932486Mt") && req.headers.get("x-admin-pass") !== "157932486Mt") {
            return NextResponse.json({ error: "Missing Core Admin Password 157932486Mt" }, { status: 403 });
        }
    }

    // Phase 17: Optimistic State Synchronization
    // Pre-create the directory and write progress.json synchronously
    try {
        const progressFilePath = path.join("/root/state", `progress_${safeProject}.json`);
        const skeletonProgress = {
            status: "QUEUED",
            message: "Project requested via Dashboard UI (Optimistic Initialization)",
            task: task, // use the raw task for display
            github: repoUrl || "",
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(progressFilePath, JSON.stringify(skeletonProgress, null, 2), "utf8");
    } catch (fsError) {
        console.error("Failed to optimistically create project state:", fsError);
        // We do not return 500 here; if optimistic write fails, the background job will still try to do it.
    }

    // Launch task runner via bash in background without chat_id (UI mode)
    const cmd = `nohup /root/scripts/task-runner.sh '${safeTask}' '${safeProject}' '' '${safeRepo}' > /root/state/ui_dispatch.log 2>&1 &`;
    
    exec(cmd, (err) => {
      if (err) console.error("Dispatch Error:", err);
    });

    return NextResponse.json({ success: true, message: "Task dispatched directly to System" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to dispatch" }, { status: 500 });
  }
}
