// Initializations
let taskField = document.querySelector(".tasks-form input");
let wrongMsg = document.querySelector(".tasks-form .wrong-message");
let tasksNames = doneTasks = [];
let tasksList = document.querySelector(".tasks-container ul");
let allTasks = tasksList.children;
let viewOpts = document.querySelectorAll(".select .opt");
let viewSwitch = document.querySelector(".select i");

// Storages
if (sessionStorage.taskName) taskField.value = sessionStorage.taskName;
if (sessionStorage.wrongMsg) invalidTask(sessionStorage.wrongMsg);
if (localStorage.tasksNames) {
  tasksNames = JSON.parse(localStorage.tasksNames);
  createTasks();
}
if (localStorage.doneTasks) {
  doneTasks = JSON.parse(localStorage.doneTasks);
  for (let i = 0; i < allTasks.length; i++)
    if (doneTasks.includes(i)) allTasks[i].style.opacity = ".5";
}
if (localStorage.selectedViewIndex)
  viewOpts[localStorage.selectedViewIndex].classList.add("selected");
else viewOpts[0].classList.add("selected");

// Statements
let vName = taskField.value;
taskField.addEventListener("input", function () {
  if (
    this.value[this.value.length - 1] === " " &&
    (this.value.length - 1 === 0 || this.value[this.value.length - 2] === " ")
  ) this.value = vName;
  else vName = this.value;
  sessionStorage.taskName = this.value;
});

colorEffect(document.querySelector(".tasks-form"), "i.add");

document.querySelector(".tasks-form .add").onclick = () => {
  let taskName = taskField.value.trimEnd();
  if (!taskName) invalidTask("Task name is required.");
  else if (tasksNames.includes(taskName)) invalidTask("Task name is already exist.", 1);
  else {
    validTask()
    sessionStorage.taskName = vName = taskField.value = "";
    tasksNames.push(taskName);
    localStorage.tasksNames = JSON.stringify(tasksNames);
    if (!allTasks.length)
      localStorage.selectedViewIndex = [...viewOpts].indexOf(document.querySelector(".select .selected"));
    createTasks();
    checkTasks();
    checkMargin();
    if (document.querySelector(".select .selected").textContent === "Done") {
      allTasks[0].style.opacity = ".5";
      getDoneTasks();
    }
  }
};

setView();
validOpt();

viewSwitch.onclick = selectView;

// Functions
function invalidTask(message, s = 0) {
  taskField.style.borderBottomColor = "var(--error-message-color)";
  taskField.addEventListener("input", validTask);
  wrongMsg.style.display = "flex";
  wrongMsg.querySelector("span").textContent = message;
  if (s) sessionStorage.wrongMsg = message;
}
function validTask() {
  taskField.style.borderBottomColor = wrongMsg.style.display = null;
  taskField.removeEventListener("input", validTask);
  sessionStorage.removeItem("wrongMsg");
}
function colorEffect(parent, query = "i") {
  let icons = parent.querySelectorAll(query);
  for (let i = 0; i < icons.length; i++)
    icons[i].onmouseover =  icons[i].onmouseout = function () {
      this.classList.toggle("fa-regular");
      this.classList.toggle("fa-solid");
    }
}
function createTasks() {
  if (allTasks.length > 0) {
    doneTasks = doneTasks.map(e => e + 1);
    localStorage.doneTasks = JSON.stringify(doneTasks);  
  }

  let newTask;
  for (let i = allTasks.length; i < tasksNames.length; i++) {
    newTask = document.createElement("li");
    newTask.innerHTML = `
      <i class="action check fa-regular fa-square-check"></i>
      <p>${tasksNames[i]}</p>
      <i class="action remove fa-regular fa-square-minus"></i>
    `;
    colorEffect(newTask);
    doneEffect();
    removeEffect();
    tasksList.prepend(newTask);
    scrollCheck();
  }

  function doneEffect() {
    newTask.querySelector(".check").onclick = function () {
      this.parentElement.style.opacity =
        this.parentElement.style.opacity === "" ? ".5" : "";
      getDoneTasks();
      setView();
    };
  }
  function removeEffect() {
    newTask.querySelector(".remove").onclick = function () {
      this.parentElement.remove();
      if (this.parentElement.querySelector("p").textContent === taskField.value.trimEnd())
        validTask();
      checkTasks();
      checkMargin();
      scrollCheck();
      getDoneTasks();
      tasksNames.splice(tasksNames.indexOf(this.parentElement.querySelector("p").textContent), 1)
      tasksNames.length > 0
        ? localStorage.tasksNames = JSON.stringify(tasksNames)
        : localStorage.clear();
    };
  }
}
function getDoneTasks() {
  doneTasks = [];
  for (let i = 0; i < allTasks.length; i++)
    if (allTasks[i].style.opacity === "0.5") doneTasks.push(i);
  localStorage.doneTasks = JSON.stringify(doneTasks);
}
function validOpt() {
  for (let i = 0; i < viewOpts.length; i++) {
    if (!viewOpts[i].classList.contains("selected")) {
      viewOpts[i].style.display = "none";
      viewOpts[i].onclick = function () {
        document.querySelector(".select .selected").classList.remove("selected");
        this.classList.add("selected");
        if (allTasks.length)
          localStorage.selectedViewIndex = i;
        selectView();
        setView();
        validOpt();
      }
    } else viewOpts[i].onclick = "";
  }
}
function selectView() {
  viewSwitch.classList.toggle("fade-animation");
  for (let i = 0; i < viewOpts.length; i++) {
    if (!viewOpts[i].classList.contains("selected")) 
      viewOpts[i].style.display =
        viewOpts[i].style.display === "none" ? "block" : "none";
  }
}
function setView() {
  let name = document.querySelector(".select .selected").textContent;
  if (name === "Active")
    for (let i = 0; i < allTasks.length; i++)
      allTasks[i].style.display =
        allTasks[i].style.opacity === "0.5" ? "none" : "flex";
  else if (name === "Done")
    for (let i = 0; i < allTasks.length; i++)
      allTasks[i].style.display =
        allTasks[i].style.opacity === "0.5" ? "flex" : "none";
  else
    for (let i = 0; i < allTasks.length; i++)
      allTasks[i].style.display = "flex";
  checkTasks();
  checkMargin();
  scrollCheck();
}
function checkTasks() {
  let n = 0;
  for (let i = 0; i < allTasks.length; i++)
    if (allTasks[i].style.display !== "none") n++;
  let noTasksMessage = document.querySelector(".no-tasks");
  if (!n) {
    let viewName = document.querySelector(".select .selected").textContent;
    noTasksMessage.style.display = "block";
    switch (viewName) {
      case "All":
        noTasksMessage.textContent = "You don't has any tasks yet!";
        break;
      case "Active":
        noTasksMessage.textContent = "You don't has any active tasks!";
        break;
      case "Done":
        noTasksMessage.textContent = "You don't has any done tasks!";
    }
  } else noTasksMessage.style.display = "none";
}
function checkMargin() {
  let l = 0;
  for (let i = allTasks.length - 1; i >= 0; i--)
    if (allTasks[i].style.display === "flex") {
      if (!l) {
        allTasks[i].style.marginBottom = "0";
        l = 1;
      } else allTasks[i].style.marginBottom = "10px";
    }
}
function scrollCheck() {
  tasksList.style.paddingRight =
    tasksList.scrollHeight > tasksList.clientHeight
      ? "8px"
      : "";
}
