
let db;


function openDB() {
    console.log("openDB called");
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("kanbanDB", 1);

    request.onupgradeneeded = event => {
      db = event.target.result;
      db.createObjectStore("board", { keyPath: "id" });
    };

    request.onsuccess = event => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = event => {
      reject("Error opening DB");
    };
  });
  
}
const dbReady = openDB();   

async function saveBoard() {
  await dbReady;

  const tx = db.transaction("board", "readwrite");
  const store = tx.objectStore("board");

  store.put({
    id: "main",
    data: board
  });
}



function loadBoard() {
  return new Promise(resolve => {
    const tx = db.transaction("board", "readonly");
    const store = tx.objectStore("board");
    const request = store.get("main");

    request.onsuccess = () => {
      if (request.result) {
        Object.assign(board, request.result.data);
      }
      resolve();
    };
  });
}


if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error("SW registration failed:", err));
}

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
  saveBoard();
  render();
}

function moveTask(column, index, direction) {
  const currentIndex = columns.indexOf(column);
  const newColumn = columns[currentIndex + direction];
  if (!newColumn) return;

  const task = board[column].splice(index, 1)[0];
  board[newColumn].push(task);

  saveBoard();
  render();
}


function deleteTask(column, index) {
  board[column].splice(index, 1);
  saveBoard();
  render();
}



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

dbReady.then(() => {
  loadBoard().then(() => {
    render();
  });
});



