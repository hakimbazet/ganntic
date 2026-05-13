const XLSX = require("xlsx");
const path = require("path");

const outDir = path.join(__dirname);

function writeWorkbook(filename, data, sheetName = "Sheet1") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, path.join(outDir, filename));
  console.log(`Created: ${filename}`);
}

// 1. Standard project plan
writeWorkbook("sample-project-plan.xlsx", [
  { "Task Name": "Project Kickoff", "Start Date": "2026-05-01", "End Date": "2026-05-03", "Progress %": 100, "PIC": "Alice", "Category": "Planning", "Priority": "High", "Remarks": "Initial alignment done" },
  { "Task Name": "Requirements Gathering", "Start Date": "2026-05-04", "End Date": "2026-05-10", "Progress %": 100, "PIC": "Bob", "Category": "Planning", "Priority": "High", "Remarks": "Signed off by stakeholders" },
  { "Task Name": "Design Phase", "Start Date": "2026-05-11", "End Date": "2026-05-20", "Progress %": 80, "PIC": "Charlie", "Category": "Design", "Priority": "Medium", "Remarks": "Waiting for client feedback" },
  { "Task Name": "UI Review", "Start Date": "2026-05-18", "End Date": "2026-05-22", "Progress %": 60, "PIC": "Alice", "Category": "Design", "Priority": "Low", "Remarks": "" },
  { "Task Name": "Development Sprint 1", "Start Date": "2026-05-21", "End Date": "2026-06-05", "Progress %": 45, "PIC": "Dave", "Category": "Development", "Priority": "High", "Remarks": "Blocked by API specs" },
  { "Task Name": "Development Sprint 2", "Start Date": "2026-06-06", "End Date": "2026-06-20", "Progress %": 10, "PIC": "Dave", "Category": "Development", "Priority": "High", "Remarks": "" },
  { "Task Name": "API Integration", "Start Date": "2026-06-10", "End Date": "2026-06-18", "Progress %": 5, "PIC": "Eve", "Category": "Development", "Priority": "Medium", "Remarks": "Pending access credentials" },
  { "Task Name": "QA Testing", "Start Date": "2026-06-21", "End Date": "2026-06-28", "Progress %": 0, "PIC": "Frank", "Category": "QA", "Priority": "High", "Remarks": "" },
  { "Task Name": "UAT", "Start Date": "2026-06-25", "End Date": "2026-07-02", "Progress %": 0, "PIC": "Grace", "Category": "QA", "Priority": "Medium", "Remarks": "Schedule with client TBD" },
  { "Task Name": "Deployment", "Start Date": "2026-07-03", "End Date": "2026-07-05", "Progress %": 0, "PIC": "Dave", "Category": "DevOps", "Priority": "High", "Remarks": "" },
  { "Task Name": "Project Closure", "Start Date": "2026-07-06", "End Date": "2026-07-10", "Progress %": 0, "PIC": "Alice", "Category": "Planning", "Priority": "Low", "Remarks": "" },
]);

// 2. Alternative column names
writeWorkbook("sample-alternative-columns.xlsx", [
  { "Activity": "Market Research", "From Date": "2026-04-15", "To Date": "2026-04-25", "Completion": "100%", "Owner": "Sarah", "Group": "Research", "Level": "High", "Notes": "Survey completed" },
  { "Activity": "Competitor Analysis", "From Date": "2026-04-20", "To Date": "2026-05-01", "Completion": "90%", "Owner": "James", "Group": "Research", "Level": "Medium", "Notes": "" },
  { "Activity": "Strategy Planning", "From Date": "2026-05-02", "To Date": "2026-05-12", "Completion": "75%", "Owner": "Sarah", "Group": "Strategy", "Level": "High", "Notes": "Draft ready" },
  { "Activity": "Budget Allocation", "From Date": "2026-05-10", "To Date": "2026-05-18", "Completion": "50%", "Owner": "Maria", "Group": "Finance", "Level": "Low", "Notes": "Awaiting approval" },
  { "Activity": "Team Onboarding", "From Date": "2026-05-15", "To Date": "2026-05-25", "Completion": "30%", "Owner": "James", "Group": "HR", "Level": "Medium", "Notes": "" },
  { "Activity": "Kickoff Meeting", "From Date": "2026-05-26", "To Date": "2026-05-27", "Completion": "0%", "Owner": "Sarah", "Group": "Strategy", "Level": "High", "Notes": "Room booked" },
]);

// 3. Using native dates
writeWorkbook("sample-native-dates.xlsx", [
  { "Task": "Foundation Work", "Start": new Date(2026, 3, 1), "Finish": new Date(2026, 3, 15), "Done": 1.0, "Lead": "Tom", "Phase": "Construction", "Urgency": "High", "Comments": "Permit approved" },
  { "Task": "Framing", "Start": new Date(2026, 3, 10), "Finish": new Date(2026, 3, 30), "Done": 0.7, "Lead": "Jerry", "Phase": "Construction", "Urgency": "Medium", "Comments": "" },
  { "Task": "Electrical", "Start": new Date(2026, 4, 1), "Finish": new Date(2026, 4, 20), "Done": 0.4, "Lead": "Tom", "Phase": "MEP", "Urgency": "High", "Comments": "Material delay" },
  { "Task": "Plumbing", "Start": new Date(2026, 4, 5), "Finish": new Date(2026, 4, 25), "Done": 0.2, "Lead": "Jerry", "Phase": "MEP", "Urgency": "Medium", "Comments": "" },
  { "Task": "Drywall", "Start": new Date(2026, 4, 22), "Finish": new Date(2026, 5, 10), "Done": 0.0, "Lead": "Tom", "Phase": "Interior", "Urgency": "Low", "Comments": "" },
  { "Task": "Painting", "Start": new Date(2026, 5, 8), "Finish": new Date(2026, 5, 25), "Done": 0.0, "Lead": "Jerry", "Phase": "Interior", "Urgency": "Low", "Comments": "Waiting for paint selection" },
  { "Task": "Flooring", "Start": new Date(2026, 5, 20), "Finish": new Date(2026, 6, 5), "Done": 0.0, "Lead": "Tom", "Phase": "Interior", "Urgency": "Medium", "Comments": "" },
  { "Task": "Final Inspection", "Start": new Date(2026, 6, 6), "Finish": new Date(2026, 6, 10), "Done": 0.0, "Lead": "Jerry", "Phase": "Closeout", "Urgency": "High", "Comments": "" },
]);

// 4. Mixed formats
writeWorkbook("sample-mixed-formats.xlsx", [
  { "Name": "Research", "Begin": "2026/03/01", "End": "2026/03/15", "Pct": 1, "Assignee": "Anna", "Type": "Discovery", "Importance": "H", "Note": "Literature review done" },
  { "Name": "Prototype", "Begin": "2026/03/12", "End": "2026/04/05", "Pct": 0.85, "Assignee": "Ben", "Type": "Build", "Importance": "M", "Note": "" },
  { "Name": "Internal Review", "Begin": "2026/04/01", "End": "2026/04/10", "Pct": 0.6, "Assignee": "Anna", "Type": "Review", "Importance": "L", "Note": "Feedback collected" },
  { "Name": "Client Demo", "Begin": "2026/04/08", "End": "2026/04/18", "Pct": 0.35, "Assignee": "Ben", "Type": "Review", "Importance": "H", "Note": "Reschedule requested" },
  { "Name": "Refinement", "Begin": "2026/04/15", "End": "2026/05/05", "Pct": 0.1, "Assignee": "Anna", "Type": "Build", "Importance": "M", "Note": "" },
  { "Name": "Final Delivery", "Begin": "2026/05/01", "End": "2026/05/10", "Pct": 0, "Assignee": "Ben", "Type": "Closeout", "Importance": "H", "Note": "" },
]);

// 5. Large project
const largeTasks = [];
const baseDate = new Date(2026, 0, 6);
const phases = ["Design", "Development", "Testing", "Review", "Deploy"];
const assignees = ["Alex", "Blake", "Casey", "Drew", "Ellis"];
const priorities = ["High", "Medium", "Low"];
const remarksPool = ["On track", "Needs review", "Blocked", "", "Client pending"];
for (let i = 1; i <= 20; i++) {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + (i - 1) * 3);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.floor(Math.random() * 8) + 3);
  largeTasks.push({
    "Task Description": `Task ${i.toString().padStart(2, "0")}: ${phases[i % 5]} Module ${i}`,
    "Planned Start": start,
    "Planned End": end,
    "% Done": Math.floor(Math.random() * 101),
    "Lead": assignees[i % 5],
    "Phase": phases[i % 5],
    "Priority": priorities[i % 3],
    "Remarks": remarksPool[i % 5],
  });
}
writeWorkbook("sample-large-project.xlsx", largeTasks);

console.log("\nAll sample Excel files created in sample-data/");
