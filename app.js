const board = {
  todo: [],
  inProgress: [],
  done: []
};

function addTask(column) {
  const text = prompt("Enter task");
  if (!text) return;

  board[column].push(text);

  console.log("Board after push:", board);

  render();
}



function render() {
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
}
render();

