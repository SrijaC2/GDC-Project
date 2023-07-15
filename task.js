const fs = require("fs");

let Info = () => {
  let usage = `Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`;
  console.log(usage);
  return usage;
};

let tasks = [];
let GetTasksFromFile = (fileContent) => {
  let lines = fileContent.split("\n");
  return lines
    .map((line) => {
      let [p, ...Parts] = line.trim().split(" ");
      let text = Parts.join(" ");
      return { p: parseInt(p), text };
    })
    .filter((task) => task.text);
};

let loadTasks = () => {
  try {
    let fileContent = fs.readFileSync("task.txt", "utf8");
    tasks = GetTasksFromFile(fileContent);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error reading tasks from file:", err);
    }
    tasks = [];
  }
};

loadTasks();

let Taskslist = () => {
  try {
    OrderingTasks();
    let fileStorage = tasks.map((task) => `${task.p} ${task.text}`).join("\n");
    fs.writeFileSync("task.txt", fileStorage + "\n", "utf8");
  } catch (err) {
    console.error("Error occured while adding tasks to task.txt:", err);
  }
};

let CompletedTaskslist = (record) => {
  try {
    let fileStorage = record.map((record) => `${record.text}`).join("\n");
    fs.appendFileSync("completed.txt", fileStorage + "\n", "utf8");
  } catch (err) {
    console.error("Error occured while adding tasks to completed.txt:", err);
  }
};

let DeleteTask = (index) => {
  if (index < 1 || index > tasks.length) {
    console.log(
      `Error: task with index #${index} does not exist. Nothing deleted.`
    );
    return;
  }
  let deletedTask = tasks.splice(index - 1, 1);
  console.log(`Deleted task #${index}`);
  Taskslist();
  return deletedTask;
};

let TaskInput = (p, text) => {
  tasks.push({ p, text });
  console.log(`Added task: "${text}" with priority ${p}`);
  Taskslist();
};

let OrderingTasks = () => {
  tasks.sort((a, b) => a.p - b.p);
};

let DisplayTasks = () => {
  if (tasks.length == 0) {
    console.log("There are no pending tasks!");
    return;
  }
  OrderingTasks();
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.text} [${task.p}]`);
  });
};

let DoneTask = (index) => {
  if (index < 1 || index > tasks.length) {
    console.log(`Error: no incomplete item with index #${index} exists.`);
    return;
  }
  let deletedTask = tasks.splice(index - 1, 1);
  Taskslist();
  CompletedTaskslist(deletedTask);
  console.log("Marked item as done.");
};

let Report = () => {
  let fileContent = fs.readFileSync("task.txt", "utf8");
  let lines = fileContent.split("\n");
  console.log("Pending :", lines.length - 1);
  OrderingTasks();
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.text} [${task.p}]`);
  });
  fileContent = fs.readFileSync("completed.txt", "utf8");
  lines = fileContent.split("\n");
  console.log("\nCompleted :", lines.length - 1);
  completed = lines.slice(0, -1);
  completed.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
};

let args = process.argv.slice(2);

if (args.length === 0) {
  Info();
} else {
  if (args[0] === "help") {
    Info();
  } else if (args[0] === "add") {
    if (args.length < 3) {
      console.log("Error: Missing tasks string. Nothing added!");
      return "Error: Missing tasks string. Nothing added!";
    } else {
      let priority = parseInt(args[1]);
      let text = args.slice(2).join(" ");
      TaskInput(priority, text);
    }
  } else if (args[0] === "ls") {
    DisplayTasks();
  } else if (args[0] === "del") {
    if (args.length < 2) {
      console.log("Error: Missing NUMBER for deleting tasks.");
    } else {
      let id = parseInt(args[1]);
      DeleteTask(id);
    }
  } else if (args[0] === "done") {
    if (args.length < 2) {
      console.log("Error: Missing NUMBER for marking tasks as done.");
    } else {
      let id = parseInt(args[1]);
      DoneTask(id);
    }
  } else if (args[0] === "report") {
    Report();
  }
}
