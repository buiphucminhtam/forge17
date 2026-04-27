"use client";
import { useEffect, useState } from "react";

// --- Login Gatekeeper --- //
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (pass.trim().toLowerCase() === "tieumo2026") {
      localStorage.setItem("tieumo_pass", "tieumo2026");
      onLogin();
    } else {
      setError(true);
      setPass("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black font-sans selection:bg-[#0071E3] selection:text-white p-4">
      <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-[40px] p-10 rounded-[32px] shadow-2xl border border-black/5 dark:border-white/10 w-full max-w-sm text-center">
        <h1 className="text-[28px] font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Workspace</h1>
        <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8 font-medium">Verify your access</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(false); }}
            placeholder="Passcode"
            className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-[#2C2C2E] rounded-[16px] text-center text-[17px] font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${error ? 'ring-2 ring-red-500/50' : 'focus:ring-[#0071E3]/50 border border-black/5 dark:border-white/5'}`}
          />
          <button type="submit" className="w-full py-3.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-[16px] text-[15px] transition-all active:scale-[0.98]">
            Vào Bảng Điều Khiển
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Kanban Column --- //
const KanbanColumn = ({ title, statusId, projects, onClickProject }: any) => {
  const filtered = projects.filter((p: any) => p.status === statusId);
  return (
    <div className="flex flex-col gap-4 bg-[#F5F5F7]/60 dark:bg-[#1C1C1E]/60 rounded-[24px] p-[20px] h-full min-h-[500px] border border-black/5 dark:border-white/5 backdrop-blur-[20px]">
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.04]">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-800 dark:text-white uppercase">{title}</h2>
        <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
          {filtered.length}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto mt-1 scrollbar-hide">
        {filtered.map((proj: any) => (
          <div 
            key={proj.id} onClick={() => onClickProject(proj)}
            className="group cursor-pointer p-[18px] bg-white dark:bg-[#2C2C2E] rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.15)] border border-black/[0.04] dark:border-white/[0.04] transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[15px] font-semibold text-slate-900 dark:text-white truncate max-w-[140px] tracking-tight">{proj.id}</span>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-[#EBEBF5]/60 leading-relaxed line-clamp-3">{proj.task}</p>
            {proj.deploy_url && proj.status === 'READY' && (
              <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-end gap-2">
                <a href={proj.deploy_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 bg-[#0071E3]/10 text-[#0071E3] dark:text-[#47A1FF] rounded-full text-[12px] font-semibold hover:bg-[#0071E3]/20 transition-colors">Vercel URL</a>
                <a href={proj.github || `https://github.com/aicode82-sketch/${proj.id}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-[#EBEBF5] rounded-full text-[12px] font-semibold hover:bg-black/10 transition-colors">GitHub</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  // Dispatcher State
  const [dispatchMode, setDispatchMode] = useState("NEW"); // "NEW" or "EXISTING"
  const [dispatchProj, setDispatchProj] = useState("");
  const [dispatchRepo, setDispatchRepo] = useState("");
  const [dispatchTask, setDispatchTask] = useState("");
  const [dispatchAdminPass, setDispatchAdminPass] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editGithub, setEditGithub] = useState("");

  useEffect(() => {
    if (selected) {
        setEditGithub(selected.github || "");
    }
  }, [selected?.id, selected?.github]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("tieumo_pass") === "tieumo2026") {
      setAuth(true);
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
      // Auto-update selected proj if properties changed
      setSelected((prev: any) => {
        if (!prev) return null;
        return data.projects.find((p: any) => p.id === prev.id) || prev;
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (!auth) return;
    fetchProjects();
    const interval = setInterval(fetchProjects, 2000);
    return () => clearInterval(interval);
  }, [auth]);

  const handleDispatch = async (e: any) => {
    e.preventDefault();
    if (!dispatchProj || !dispatchTask) return;
    setLoading(true);
    try {
      await fetch("/api/dispatch", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-pass": dispatchAdminPass },
        body: JSON.stringify({ project: dispatchProj, task: dispatchTask, repoUrl: dispatchRepo })
      });
      setDispatchTask("");
      if (dispatchMode === "NEW") {
         setDispatchProj("");
         setDispatchRepo("");
      }
      fetchProjects();
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    await fetch("/api/projects", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id })
    });
    setSelected(null);
    setDeleteConfirm(false);
    fetchProjects();
  };

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white p-6 md:p-8 font-sans tracking-tight selection:bg-[#0071E3] selection:text-white">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- Header & Analytics --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[34px] font-bold mb-1 tracking-tight">Tiểu Mơ Workspace</h1>
            <p className="text-[17px] text-slate-500 dark:text-[#EBEBF5]/60 font-medium">PM Operations & Direct Dispatching</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] px-5 py-3 rounded-[20px] border border-black/5 dark:border-white/5">
              <span className="block text-[12px] font-semibold text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-[28px] font-bold leading-none">{projects.length}</span>
            </div>
            <div className="bg-[#E8F2FF] dark:bg-[#0071E3]/10 px-5 py-3 rounded-[20px] border border-[#0071E3]/10">
              <span className="block text-[12px] font-semibold text-[#0071E3] dark:text-[#47A1FF] uppercase tracking-widest">Deployed</span>
              <span className="text-[28px] font-bold leading-none text-[#004B99] dark:text-[#47A1FF]">{projects.filter(p => p.status === 'READY').length}</span>
            </div>
            <div className="bg-[#FFF4E5] dark:bg-[#FF9F0A]/10 px-5 py-3 rounded-[20px] border border-[#FF9F0A]/10">
              <span className="block text-[12px] font-semibold text-[#FF9F0A] uppercase tracking-widest">Active</span>
              <span className="text-[28px] font-bold leading-none text-[#E67A00] dark:text-[#FF9F0A]">{projects.filter(p => p.status !== 'READY').length}</span>
            </div>
          </div>
        </div>

        {/* --- Task Dispatcher UI --- */}
        <div className="mb-8 p-6 bg-[#F5F5F7]/80 dark:bg-[#1C1C1E]/80 backdrop-blur-[24px] rounded-[28px] border border-black/5 dark:border-white/5 shadow-sm">
          <h2 className="text-[18px] font-semibold tracking-tight mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0071E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Direct Task Dispatcher (Giao Việc Nhanh)
          </h2>
          <form onSubmit={handleDispatch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
               {/* Mode Selection Toggle */}
               <div className="flex bg-black/5 dark:bg-white/5 rounded-[12px] p-1 h-[52px]">
                   <button type="button" onClick={() => { setDispatchMode("EXISTING"); setDispatchProj(projects[0]?.id || ""); setDispatchRepo(""); }} className={`px-4 text-sm font-semibold rounded-[8px] transition-colors ${dispatchMode === "EXISTING" ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-amber-50"}`}>Dự án có sẵn</button>
                   <button type="button" onClick={() => { setDispatchMode("NEW"); setDispatchProj(""); setDispatchRepo(""); }} className={`px-4 text-sm font-semibold rounded-[8px] transition-colors ${dispatchMode === "NEW" ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-amber-50"}`}>Thêm mới</button>
                   <button type="button" onClick={() => { setDispatchMode("FORGEWRIGHT"); setDispatchProj("forgewright"); setDispatchRepo("https://github.com/aicode82-sketch/forgewright.git"); }} className={`px-4 text-sm font-semibold rounded-[8px] transition-colors ${dispatchMode === "FORGEWRIGHT" ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-amber-50"}`}>Forgewright Core</button>
                   <button type="button" onClick={() => { setDispatchMode("TIEUMO"); setDispatchProj("tieumo"); setDispatchRepo("https://github.com/aicode82-sketch/tieumo_openclaw.git"); }} className={`px-4 text-sm font-semibold rounded-[8px] transition-colors ${dispatchMode === "TIEUMO" ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-amber-50"}`}>Tiểu Mơ System</button>
               </div>
               
               {/* Dropdown or Input based on mode */}
               {dispatchMode === "EXISTING" ? (
                   <select 
                      required value={dispatchProj} onChange={e => setDispatchProj(e.target.value)}
                      className="md:w-[240px] px-4 py-3.5 bg-white dark:bg-[#2C2C2E] rounded-[16px] text-[15px] font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0071E3]/50 border border-black/5 dark:border-white/5"
                   >
                      <option value="" disabled>-- Chọn dự án cũ --</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                   </select>
               ) : (
                   <input 
                      required type="text" placeholder="Project ID mới (viết liền k dấu)" 
                      value={dispatchProj} onChange={e => setDispatchProj(e.target.value)}
                      readOnly={dispatchMode === "FORGEWRIGHT" || dispatchMode === "TIEUMO"}
                      className={`md:w-[240px] px-5 py-3.5 bg-white dark:bg-[#2C2C2E] rounded-[16px] text-[15px] font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0071E3]/50 border border-black/5 dark:border-white/5 ${(dispatchMode === "FORGEWRIGHT" || dispatchMode === "TIEUMO") ? 'opacity-80 cursor-not-allowed bg-slate-50 dark:bg-[#1C1C1E]' : ''}`}
                   />
               )}

               <input 
                  required type="text" placeholder="Nhập tóm tắt yêu cầu cần Code / Fix bug..." 
                  value={dispatchTask} onChange={e => setDispatchTask(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-white dark:bg-[#2C2C2E] rounded-[16px] text-[15px] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0071E3]/50 border border-black/5 dark:border-white/5 transition-all"
               />
               <button disabled={loading} type="submit" className="md:w-[140px] py-3.5 bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white font-semibold rounded-[16px] text-[15px] transition-all active:scale-[0.98]">
                  {loading ? "Đang Giao..." : "Run Task"}
               </button>
            </div>
            {/* System Level & BYO Inputs */}
            <div className="flex flex-col gap-3">
                {dispatchMode === "NEW" && (
                    <input 
                        type="url" placeholder="[Tùy chọn] Link Github đồng bộ (Nạp Code Base & Push thẳng lên Repo này)" 
                        value={dispatchRepo} onChange={e => setDispatchRepo(e.target.value)}
                        className="w-full px-5 py-3 bg-white/60 dark:bg-[#2C2C2E]/60 text-slate-600 dark:text-slate-300 rounded-[12px] text-[14px] outline-none focus:ring-2 focus:ring-[#0071E3]/30 border border-black/5 dark:border-white/5 border-dashed transition-all"
                    />
                )}
                {(dispatchMode === "FORGEWRIGHT" || dispatchMode === "TIEUMO") && (
                    <div className="flex gap-4">
                        <input 
                            required type="password" placeholder="System Admin Password" 
                            value={dispatchAdminPass} onChange={e => setDispatchAdminPass(e.target.value)}
                            className="md:w-[320px] px-5 py-3 bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-[12px] text-[14px] font-semibold outline-none focus:ring-2 focus:ring-red-500/50 border border-red-500/20"
                        />
                        <input 
                            type="text" readOnly
                            value={dispatchRepo}
                            className="w-full px-5 py-3 bg-white/40 dark:bg-black/20 text-slate-500 dark:text-slate-400 rounded-[12px] text-[14px] outline-none border border-black/5 dark:border-white/5 border-dashed cursor-not-allowed hidden md:block"
                        />
                    </div>
                )}
            </div>
          </form>
        </div>

        {/* --- Kanban --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[65vh]">
          <KanbanColumn title="Backlog / Clarify" statusId="QUEUED" projects={projects} onClickProject={setSelected} />
          <KanbanColumn title="Planning Phase" statusId="PLAN" projects={projects} onClickProject={setSelected} />
          <KanbanColumn title="Execution & Sync" statusId="EXECUTE" projects={projects} onClickProject={setSelected} />
          <KanbanColumn title="Deployed (Ready)" statusId="READY" projects={projects} onClickProject={setSelected} />
        </div>
      </div>

      {/* --- Detail Modal --- */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-[24px]" onClick={() => setSelected(null)}></div>
          <div className="relative bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-[40px] w-full max-w-[800px] max-h-[85vh] overflow-y-auto rounded-[32px] p-[40px] shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-in fade-in zoom-in-95 duration-200">
            <button id="mo-task-close-btn" onClick={() => setSelected(null)} className="absolute top-8 right-8 p-2.5 bg-black/5 dark:bg-white/10 rounded-full text-slate-500 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-[32px] font-bold tracking-tight mb-8 pr-12">{selected.id}</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-400 mb-3">Project Requirement</h3>
                <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[24px] text-[15px]">{selected.task}</div>
              </div>
              {selected.clarify && (
                 <div>
                  <h3 className="text-[13px] font-semibold text-[#0071E3]/70 mb-3">Clarification Notes</h3>
                  <div className="bg-[#0071E3]/[0.06] p-6 rounded-[24px] text-[15px] text-[#004B99] dark:text-[#47A1FF] whitespace-pre-wrap">{selected.clarify}</div>
                </div>
              )}
              {selected.plan && (
                 <div>
                  <h3 className="text-[13px] font-semibold text-[#5E5CE6]/70 mb-3">Architecture Plan</h3>
                  <div className="bg-[#5E5CE6]/[0.06] p-6 rounded-[24px] text-[14px] text-[#30109E] dark:text-[#B4B1FA] whitespace-pre-wrap font-mono">{selected.plan}</div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white mb-3">Update Task Detail / Reply to AI Clarification</h3>
                <div className="flex flex-col gap-4">
                  <textarea 
                    id="detail-task-update"
                    defaultValue={selected.task}
                    className="w-full px-5 py-4 bg-black/5 dark:bg-white/5 rounded-[16px] outline-none border border-black/10 dark:border-white/10 focus:border-[#0071E3] text-[14px] min-h-[140px]"
                    placeholder="Enter new requirements, reply to clarification, or edit the existing prompt..."
                  />
                  <div className="flex justify-end gap-3">
                    <button onClick={async () => {
                      const el = document.getElementById("detail-task-update") as HTMLTextAreaElement;
                      if (!el || !el.value.trim()) return;
                      await fetch("/api/dispatch", {
                         method: "POST", headers: { "Content-Type": "application/json", "x-admin-pass": "" },
                         body: JSON.stringify({ project: selected.id, task: el.value, repoUrl: selected.github || "" })
                      });
                      document.getElementById("mo-task-close-btn")?.click();
                    }} className="px-6 py-3.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-[14px] text-[14px] font-semibold transition-all shadow-md active:scale-[0.98]">
                      Update & Rerun Pipeline
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Settings Section */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                <h3 className="text-[13px] font-semibold text-slate-400 mb-3">Project Link (BYO Repository)</h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                   <input type="url" placeholder="Link GitHub tùy chọn..." value={editGithub} onChange={e => setEditGithub(e.target.value)} className="flex-1 px-5 py-3 bg-black/5 dark:bg-white/5 rounded-[12px] outline-none border border-black/5 dark:border-white/5 text-[14px]" />
                   <button onClick={async () => {
                       await fetch("/api/projects", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id: selected.id, github: editGithub}) });
                       fetchProjects();
                   }} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[12px] text-[14px] font-semibold hover:bg-slate-800 transition-colors">Lưu Trữ</button>
                </div>
            </div>

            {/* Delete Project Section */}
            <div className="mt-8 pt-6 border-t border-red-500/10 flex justify-end">
               {!deleteConfirm ? (
                   <button onClick={() => setDeleteConfirm(true)} className="px-5 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold rounded-[14px] text-[14px] hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">🗑️ Phá Huỷ Dự Án Tuyệt Đối</button>
               ) : (
                   <div className="flex items-center gap-4 bg-red-50/50 dark:bg-red-900/20 p-2 pl-4 rounded-[16px] border border-red-500/20">
                       <span className="text-[14px] font-semibold text-red-600 dark:text-red-400">Không thể khôi phục. Xoá?</span>
                       <button onClick={() => setDeleteConfirm(false)} className="px-5 py-2 bg-white dark:bg-[#2C2C2E] text-slate-700 dark:text-white font-semibold rounded-[12px] text-[14px] hover:bg-slate-50 transition-colors border border-black/5 dark:border-white/5">Huỷ</button>
                       <button onClick={handleDelete} className="px-5 py-2 bg-red-600 text-white font-semibold rounded-[12px] text-[14px] hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-600/20">Xác Nhận Xoá</button>
                   </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
