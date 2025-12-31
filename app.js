
let db;


function openDB() {
    
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("kanbanDB", 2);// opens a database for the app

  request.onupgradeneeded = event => { //runs when DB created for the ifrst time or when version number changes
  db = event.target.result;//the opened DB

  if (!db.objectStoreNames.contains("board")) {
    db.createObjectStore("board", { keyPath: "id" });
  }

  if (!db.objectStoreNames.contains("actions")) {
    db.createObjectStore("actions", {
      autoIncrement: true
    });
  }
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

async function saveBoard() { //done after every state change
  await dbReady;

  const tx = db.transaction("board", "readwrite");
  const store = tx.objectStore("board");

  store.put({
    id: "main",
    data: board
  });
}



function loadBoard() { // loads saved state when app starts
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

async function queueAction(action) {
  await dbReady; 

  const tx = db.transaction("actions", "readwrite");
  const store = tx.objectStore("actions");

  store.add({
    ...action,
    timestamp: Date.now()
  });
}
function getAllActions() {
  return new Promise(async resolve => {
    await dbReady;

    const tx = db.transaction("actions", "readonly");
    const store = tx.objectStore("actions");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}
function clearActions() {
  const tx = db.transaction("actions", "readwrite");
  tx.objectStore("actions").clear();
}
async function syncActions() {
  if (!navigator.onLine) return;

  const actions = await getAllActions();
  if (actions.length === 0) return;

  try {
    const response = await fetch("http://127.0.0.1:8000/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(actions)
    });

    if (response.ok) {
      clearActions();
      console.log("Actions synced successfully");
    }
  } catch (err) {
    console.log("Sync failed, will retry later");
  }
}
window.addEventListener("online", () => {
  console.log("Back online — syncing actions");
  syncActions();
});






if ("serviceWorker" in navigator) { //ensures browser supports service worker
  navigator.serviceWorker
    .register("/service-worker.js") //tells browser to install sw
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
  render();        // UI first

  saveBoard();     // persist state
  queueAction({    // record action
    type: "ADD_TASK",
    payload: { column, text }
  });
}


function moveTask(column, index, direction) {
  const currentIndex = columns.indexOf(column);
  const newColumn = columns[currentIndex + direction];
  if (!newColumn) return;

  const task = board[column].splice(index, 1)[0];
  board[newColumn].push(task);

  queueAction({
    type: "MOVE_TASK",
    payload: { from: column, to: newColumn, task }
  });

  saveBoard();
  render();
}



function deleteTask(column, index) {
  const task = board[column][index];
  board[column].splice(index, 1);

  queueAction({
    type: "DELETE_TASK",
    payload: { column, task }
  });

  saveBoard();
  render();
}




function render() {
  for (let column in board) {
    const container = document.getElementById(column);
    container.innerHTML = "";

    board[column].forEach((task, index) => {

      const div = document.createElement("div");// to represent the task box
      div.className = "task";
      div.innerText = task;

      // Move left
      if (column !== "todo") {
        const leftBtn = document.createElement("button");
        leftBtn.innerText = "←";
        leftBtn.onclick = () => moveTask(column, index, -1);
        div.appendChild(leftBtn);//creates the button inside the div
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
async function initApp() {
  await dbReady;     // wait for IndexedDB
  await loadBoard(); // restore saved state
  render();          // render UI
}

initApp();

window.addEventListener("load", () => {
  syncActions();
});




