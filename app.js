const board = {
  todo: [],
  inProgress: [],
  done: []
};

const columns = ["todo", "inProgress", "done"];

function addTask(column) {
  const text = prompt("Enter task");
  if (!text) return;

  board[column].push(text);

  console.log("Board after push:", board);

  render();
}
function moveTask(column, index, direction) {
  const currentIndex = columns.indexOf(column);
  const newColumn = columns[currentIndex + direction];

  if (!newColumn) return;

  const task = board[column].splice(index, 1)[0];
  board[newColumn].push(task);

  render();
}

function deleteTask(column, index) {
  board[column].splice(index, 1);
  render();
}




/*function render() {
  for (let column in board) {
    const container = document.getElementById(column);
    container.innerHTML = "";

    board[column].forEach(task => {
      const div = document.createElement("div");
      div.className = "task";
      div.innerText = task;

      container.appendChild(div);
    });
  }
}*/
function render() {
  for (let column in board) {
    const container = document.getElementById(column);
    container.innerHTML = "";

    board[column].forEach((task, index) => {
      const div = document.createElement("div");
      div.className = "task";
      div.innerText = task;

      // Move left
      if (column !== "todo") {
        const leftBtn = document.createElement("button");
        leftBtn.innerText = "←";
        leftBtn.onclick = () => moveTask(column, index, -1);
        div.appendChild(leftBtn);
      }

      // Move right
      if (column !== "done") {
        const rightBtn = document.createElement("button");
        rightBtn.innerText = "→";
        rightBtn.onclick = () => moveTask(column, index, 1);
        div.appendChild(rightBtn);
      }

      // Delete
      const delBtn = document.createElement("button");
      delBtn.innerText = "✕";
      delBtn.onclick = () => deleteTask(column, index);
      div.appendChild(delBtn);

      container.appendChild(div);
    });
  }
}

render();

