const months = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];
const daysOfWeek = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];

let currentDate = new Date();
let selectedDate = new Date();

function prevMonth() {
  selectedDate.setMonth(selectedDate.getMonth() - 1);
  resetTime(selectedDate);
  renderCalendar();
}

function nextMonth() {
  selectedDate.setMonth(selectedDate.getMonth() + 1);
  resetTime(selectedDate);
  renderCalendar();
}

function addTask() {
  const taskDateInput = document.getElementById("taskDate");
  const taskNameInput = document.getElementById("taskName");
  const taskDate = new Date(taskDateInput.value);
  const taskName = taskNameInput.value;

  if (!taskDateInput.value || !taskName) {
    alert("Wprowadź poprawną datę i nazwę zadania.");
    return;
  }

  taskDate.setHours(0, 0, 0, 0);

  const dateWithoutTime = taskDate;

  saveTaskToLocalStorage(dateWithoutTime, taskName);

  showTasksForDate(dateWithoutTime);

  taskDateInput.value = "";
  taskNameInput.value = "";

  showAllTasks();

  alert("Zadanie zostało dodane.");
}

function resetTime(date) {
  date.setHours(0, 0, 0, 0);
}

function renderCalendar() {
  const monthYearElement = document.getElementById("monthYear");
  const daysElement = document.querySelector(".days");
  const datesElement = document.querySelector(".dates");

  monthYearElement.innerHTML = "";
  daysElement.innerHTML = "";
  datesElement.innerHTML = "";

  monthYearElement.innerText =
    months[selectedDate.getMonth()] + " " + selectedDate.getFullYear();

  for (let i = 0; i < 7; i++) {
    const dayLabel = document.createElement("div");
    dayLabel.innerText = daysOfWeek[i];
    daysElement.appendChild(dayLabel);
  }

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );
  let dayOfWeek = firstDayOfMonth.getDay();
  if (dayOfWeek === 0) {
    dayOfWeek = 7; //
  }

  // Find the first day of the previous month
  const firstDayOfPreviousMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() - 1,
    1
  );
  const lastDayOfPreviousMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    0
  );
  const daysInPreviousMonth = lastDayOfPreviousMonth.getDate();

  for (
    let i = daysInPreviousMonth - dayOfWeek + 1;
    i <= daysInPreviousMonth;
    i++
  ) {
    const dayCell = document.createElement("div");
    dayCell.innerText = i;
    dayCell.classList.add("day-cell", "outside-month");
    datesElement.appendChild(dayCell);
  }

  const lastDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  );
  const daysInMonth = lastDayOfMonth.getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const dayCell = document.createElement("div");
    dayCell.innerText = i;
    dayCell.classList.add("day-cell");

    dayCell.addEventListener("click", function () {
      showTasksForDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i)
      );
    });

    datesElement.appendChild(dayCell);

    if (
      currentDate.getDate() === i &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    ) {
      dayCell.classList.add("current-day");
    }
  }

  let nextDayOfWeek = (lastDayOfMonth.getDay() + 1) % 7;
  for (
    let i = 1;
    nextDayOfWeek != 1;
    i++, nextDayOfWeek = (nextDayOfWeek + 1) % 7
  ) {
    const dayCell = document.createElement("div");
    dayCell.innerText = i;
    dayCell.classList.add("day-cell", "outside-month");
    datesElement.appendChild(dayCell);
  }
}

function showTasksForDate(date) {
  const taskListElement = document.getElementById("taskList");
  taskListElement.innerHTML = "";

  const storedTasks = getTasksFromLocalStorage(date);

  if (storedTasks.length === 0) {
    const emptyTask = document.createElement("li");
    emptyTask.innerText = "Brak zadań na ten dzień.";
    taskListElement.appendChild(emptyTask);
  } else {
    storedTasks.forEach((task, index) => {
      const taskItem = document.createElement("li");
      taskItem.innerText = task;

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Usuń";
      deleteButton.addEventListener("click", function () {
        deleteTask(date, index);
      });

      taskItem.appendChild(deleteButton);
      taskListElement.appendChild(taskItem);
    });
  }
}

function showAllTasks() {
  const allTasksList = document.getElementById("allTasksList");
  allTasksList.innerHTML = "";

  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    const date = new Date(key);

    if (!isNaN(date)) {
      const storedTasks = getTasksFromLocalStorage(date);

      if (storedTasks.length > 0) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        // Add one day to the date
        const nextDay = addOneDay(date);

        link.href = "#";
        link.innerText = formatDate(nextDay) + " (" + storedTasks.length + ")";
        link.addEventListener("click", function () {
          showTasksForDate(date);
        });
        listItem.appendChild(link);
        allTasksList.appendChild(listItem);
      }
    }
  });
}

function addOneDay(date) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 1);
  return newDate;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${day} ${month} ${year}`;
}

function deleteTask(date, index) {
  const storedTasks = getTasksFromLocalStorage(date);
  storedTasks.splice(index, 1);
  localStorage.setItem(getDateString(date), JSON.stringify(storedTasks));

  showTasksForDate(date);

  showAllTasks();
}

function saveTaskToLocalStorage(date, task) {
  const storedTasks = getTasksFromLocalStorage(date);
  storedTasks.push(task);
  localStorage.setItem(getDateString(date), JSON.stringify(storedTasks));
}

function getTasksFromLocalStorage(date) {
  const storedTasks = localStorage.getItem(getDateString(date));
  return storedTasks ? JSON.parse(storedTasks) : [];
}

function getDateString(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateWithoutTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day);
}
function handleEnter(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    addTask();
  }
}

document.getElementById("prevBtn").addEventListener("click", prevMonth);
document.getElementById("nextBtn").addEventListener("click", nextMonth);
document.getElementById("addBtn").addEventListener("click", addTask);
document.getElementById("openTasksBtn").addEventListener("click", function () {
  document.querySelector(".all-tasks").style.transform = "translateX(0)";
});

document.getElementById("closeTasksBtn").addEventListener("click", function () {
  document.querySelector(".all-tasks").style.transform = "translateX(100%)";
});

renderCalendar();
showAllTasks();
