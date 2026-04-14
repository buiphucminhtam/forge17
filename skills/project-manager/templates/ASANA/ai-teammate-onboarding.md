# Asana AI Teammate Onboarding Template

> 专为 Asana AI Teammate 功能设计的新成员入职配置模板，包含 AI 引导的工作流设置。

---

## AI Teammate Onboarding Overview

### What is AI Teammate Onboarding?
> 使用 Asana AI Teammate 自动引导新成员完成入职流程，提供任务、检查清单和资源。

### Configuration URL
```
https://app.asana.com/0/[workspace]/settings/teammates
```

---

## Onboarding Workflow Structure

### Workflow Template
```yaml
workflow:
  name: "[Team] Onboarding"
  trigger:
    type: member_added
    OR: form_submitted
  status: active

start_date: "{member.start_date}"
end_date: "{member.start_date} + 30d"

phases:
  - phase: 1
    name: "Week 1: Orientation"
    duration: "7 days"
    
  - phase: 2
    name: "Week 2-3: Training"
    duration: "14 days"
    
  - phase: 3
    name: "Week 4: Integration"
    duration: "7 days"
```

---

## Phase 1: Orientation (Week 1)

### Week 1 Tasks
```yaml
week_1:
  title: "Orientation & Setup"
  
  tasks:
    - name: "Complete HR paperwork"
      due: "Day 1"
      assignee: "{new_member}"
      automated: false
      
    - name: "Set up workstation and accounts"
      due: "Day 1"
      assignee: "{new_member}"
      checklist:
        - [ ] Laptop configured
        - [ ] Email set up
        - [ ] Slack joined
        - [ ] GitHub access granted
        - [ ] Asana account created
        
    - name: "Meet with manager"
      due: "Day 1"
      type: "meeting"
      duration: "1 hour"
      
    - name: "Team introduction meeting"
      due: "Day 2"
      type: "meeting"
      participants: ["{new_member}", "{team}"]
      
    - name: "Review team handbook"
      due: "Day 3"
      resource: "[handbook_link]"
      
    - name: "Complete security training"
      due: "Day 5"
      type: "training"
      duration: "2 hours"
```

### AI-Generated Checklist
```yaml
ai_generated_checklist:
  task: "Complete first week orientation"
  
  auto_created_checkboxes:
    - "✅ Met with manager"
    - "✅ Introduced to team"
    - "✅ Reviewed handbook"
    - "✅ Completed security training"
    - "✅ Set up all accounts"
    
  ai_reminder: "Remember to schedule 1:1s with your buddy this week!"
```

---

## Phase 2: Training (Weeks 2-3)

### Week 2-3 Tasks
```yaml
weeks_2_3:
  title: "Training & Learning"
  
  learning_path:
    - category: "Technical Training"
      tasks:
        - name: "Complete [Product] technical deep-dive"
          due: "Week 2"
          duration: "4 hours"
          
        - name: "Review architecture documentation"
          due: "Week 2"
          resource: "[docs_link]"
          
        - name: "Shadow code review sessions"
          due: "Week 2"
          duration: "3 sessions"
          
        - name: "Complete coding guidelines training"
          due: "Week 2"
          duration: "2 hours"
          
    - category: "Process Training"
      tasks:
        - name: "Learn sprint planning process"
          due: "Week 2"
          meeting_with: "@scrum-master"
          
        - name: "Review bug triage workflow"
          due: "Week 2"
          resource: "[workflow_doc]"
          
        - name: "Observe team ceremonies"
          due: "Week 3"
          include:
            - "Daily standup (3x)"
            - "Sprint planning (1x)"
            - "Retrospective (1x)"
            
    - category: "Project Familiarity"
      tasks:
        - name: "Review [Project A] codebase"
          due: "Week 3"
          buddy: "@buddy_name"
          
        - name: "Complete first PR (starter task)"
          due: "Week 3"
          task: "[starter_task_link]"
```

### Training Progress Tracking
```yaml
progress_tracking:
  format: "custom_field"
  
  fields:
    - name: "Training Progress"
      type: "percentage"
      values: [0, 25, 50, 75, 100]
      
    - name: "Training Phase"
      type: "enum"
      values: ["Week 1", "Week 2", "Week 3", "Complete"]
```

---

## Phase 3: Integration (Week 4)

### Week 4 Tasks
```yaml
week_4:
  title: "Full Integration"
  
  tasks:
    - name: "Take on first real task"
      due: "Day 22"
      source: "Sprint backlog"
      criteria: "starter task with guidance available"
      
    - name: "Conduct first solo code review"
      due: "Day 24"
      prerequisites:
        - "Observed 3+ reviews"
        - "Completed PR training"
        
    - name: "Lead daily standup update"
      due: "Day 23"
      preparation: "AI can help draft update"
      
    - name: "Complete onboarding survey"
      due: "Day 28"
      form: "[feedback_form_link]"
```

---

## AI Teammate Configuration

### AI Teammate: Onboarding Buddy
```yaml
ai_teammate:
  name: "Onboarding Buddy"
  role: "Onboarding Assistant"
  
  description: "Helps new team members get up to speed with AI-guided tasks and reminders"
  
  capabilities:
    - name: "Task guidance"
      description: "Provides context and tips for each onboarding task"
      
    - name: "Progress tracking"
      description: "Monitors onboarding progress and sends reminders"
      
    - name: "Q&A answering"
      description: "Answers questions about team processes and culture"
      
    - name: "Resource suggestion"
      description: "Suggests relevant documentation and training"
```

### AI Teammate Memory
```yaml
memory:
  team_processes:
    - "Sprint starts on Monday, planning at 10am"
    - "Code review requires 2 approvals"
    - "Daily standup at 9:30am"
    - "Tech blog posts are encouraged"
    
  common_questions:
    - "How do I request PTO?" → "Contact [hr_email]"
    - "Who do I ask about benefits?" → "Contact [hr_email]"
    - "How do I set up dev environment?" → "See [dev-setup-link]"
    
  escalation_path:
    - "Tech issues → @buddy or @tech-lead"
    - "HR questions → @hr-contact"
    - "Process questions → @pm"
```

---

## Automation Rules

### Rule 1: Auto-Create Onboarding Tasks
```yaml
rule:
  name: "New member onboarding setup"
  trigger:
    type: user_added_to_team
    OR: "custom_field changed: Start Date"
    
  actions:
    - create_project:
        name: "Onboarding: {user.name}"
        template: "onboarding_template"
        start_date: "{user.start_date}"
        
    - add_to_team_channel: "#{team}-onboarding"
    
    - send_welcome_message:
        channel: "@{user}"
        message: |
          👋 Welcome to the team, {user.name}!
          
          Your onboarding project has been created.
          Meet your Onboarding Buddy AI who will guide you through your first month.
          
          First steps:
          1. Review your onboarding project
          2. Meet with your manager today
          3. Set up your workstation
```

### Rule 2: Progress Check-ins
```yaml
rule:
  name: "Weekly onboarding check-in"
  trigger:
    type: scheduled
    schedule: "Every Monday 9:00 AM"
    
  conditions:
    - user.start_date within 30 days
    
  actions:
    - create_task:
        title: "Week {week} Check-in: {user.name}"
        assignee: "{user}"
        due_date: "+2d"
        notes: |
          🤖 Onboarding Check-in
          
          Review your progress this week:
          - What did you complete?
          - What's in progress?
          - Any blockers?
          
          Remember: Your buddy and manager are here to help!
```

### Rule 3: Onboarding Survey
```yaml
rule:
  name: "Week 2 feedback"
  trigger:
    type: scheduled
    schedule: "Day 10 at 10:00 AM"
    
  actions:
    - create_task:
        title: "Week 2 Onboarding Feedback - {user.name}"
        assignee: "{user}"
        due_date: "+3d"
        notes: |
          📊 Two-Week Check-in Survey
          
          How's your onboarding going? Please rate:
          
          1. Clarity of expectations: [1-5]
          2. Quality of training: [1-5]
          3. Team helpfulness: [1-5]
          4. Access to resources: [1-5]
          5. Overall satisfaction: [1-5]
          
          What's going well?
          [Free text]
          
          What could be improved?
          [Free text]
```

---

## Onboarding Checklist Template

### Comprehensive Checklist
```markdown
## Onboarding Checklist - [Team Name]

**New Member:** {name}
**Start Date:** {date}
**Buddy:** @buddy

### 📋 Pre-Start (HR)
- [ ] Offer letter signed
- [ ] Background check complete
- [ ] Equipment ordered
- [ ] Access provisioned

### 📅 Day 1
- [ ] First day welcome
- [ ] Workstation set up
- [ ] Accounts created (Email, Slack, GitHub, Asana)
- [ ] Meet manager
- [ ] Team introduction

### 📅 Week 1
- [ ] Complete HR paperwork
- [ ] Security training
- [ ] Review team handbook
- [ ] Meet buddy
- [ ] Set up development environment
- [ ] Review coding guidelines
- [ ] Shadow first sprint planning

### 📅 Week 2
- [ ] Technical training
- [ ] Codebase walkthrough
- [ ] First code review (observe)
- [ ] Learn bug workflow
- [ ] Attend all team ceremonies

### 📅 Week 3
- [ ] First starter task
- [ ] First PR submitted
- [ ] First code review (participate)
- [ ] Mid-check-in with manager

### 📅 Week 4
- [ ] First real task (solo)
- [ ] Lead standup update
- [ ] Complete onboarding survey
- [ ] Final check-in with manager

### 🎉 30-Day Milestones
- [ ] All required training complete
- [ ] First PR merged
- [ ] Comfortable with team processes
- [ ] Feedback shared
```

---

## Example: Engineer Onboarding

### Configuration
```yaml
workflow:
  name: "Engineering Team Onboarding"
  trigger:
    type: user_added_to_team
    filter: "team = Engineering"
    
  template: "engineering_onboarding"
  
  phases:
    - name: "Week 1: Orientation"
      tasks: 8
      key_deliverable: "Setup complete"
      
    - name: "Week 2: Technical Training"
      tasks: 6
      key_deliverable: "Architecture understood"
      
    - name: "Week 3: Project Work"
      tasks: 5
      key_deliverable: "First PR merged"
      
    - name: "Week 4: Integration"
      tasks: 4
      key_deliverable: "Independent contributor"
```

### AI Teammate Interactions
```markdown
## Day 1 - Welcome Message

🤖 Onboarding Buddy:
Welcome to the Engineering team, [Name]!

I'm your Onboarding Buddy AI. I'll help you through your first month.

**Today:**
- [ ] Set up your laptop (guide attached)
- [ ] Create accounts (checklist in your project)
- [ ] Meet @manager at [time]

**Resources:**
- Engineering handbook: [link]
- Development setup: [link]

Questions? Just ask me! 😊

---

## Day 3 - Progress Check

🤖 Onboarding Buddy:
How's it going? 

I noticed you haven't completed the security training yet.
It should take about 2 hours and is due by end of week.

Need help with anything? Your buddy @buddy is also available.

---

## Day 14 - Week 2 Check-in

🤖 Onboarding Buddy:
You're halfway through onboarding!

**Progress:** 65%
**Completed:** Security training, team handbook, dev setup
**In Progress:** Architecture review

**Tip:** Schedule time with @buddy for a codebase walkthrough this week.

Any blockers I can help with?
```

### Onboarding Metrics
| Metric | Target | Track |
|--------|--------|-------|
| Checklist completion | 100% by Day 30 | — |
| First PR merged | By Day 21 | — |
| Training completion | By Day 14 | — |
| Survey satisfaction | >4.5/5 | — |
