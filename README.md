##KANBAN BOARD


This project is an offline-first Kanban board built using HTML, CSS, and JavaScript.  
The application works fully without internet by caching the app shell and storing data locally.  
When internet connectivity is restored, offline user actions are synchronized with a FastAPI backend.

##PHASE 1

Phase 1 builds the visual and structural foundation of the Kanban board.
 I built the Kanban board UI using HTML and Flexbox-based CSS. I structured the board into column components, prepared unique IDs for JavaScript-driven rendering in later phases and assigned classes to style them easily using CSS.
•	HTML (index.html) was used to create structure.
•	CSS(style.css) controls layout.
•	Browser loads HTML ..applies CSS ..shows UI

##PHASE 2 (State Manipulation)

Phase 2 makes the board interactive.
I created a JavaScript object in app.js to store state and wrote functions to add task and to render them into the DOM for the user to see. All user actions modify the state first, and the UI is re-rendered from it.
 
•	JS was used to create elements and to modify HTML dynamically.


##PHASE 3

Phase 3 allows users to move tasks and to delete tasks.
Fisrt ordering of columns are done to loop over the board elements easily.
addTask(), moveTask() and deleteTask() changes the data in the board (JS object). Array manipulation techniques like push and splice were used. In render(), we use buttons created dynamically so as to call the functions to update the state object.
After every state change, the render function is called to rebuild the UI so that the UI can be free from duplicate and old elements.

##PHASE 4 

Phase 4 makes the app load even with internet off.
• This phase does NOT save tasks
• This phase ONLY caches files
This phase caches the App Shell including the minimum set of files needed to show the app’s UI so that the files can be loaded offline.
•	Added service-worker.js
•	Cached :  index.html
            style.css
	          app.js
I learnt about service workers and how they work. A youtube video (https://youtu.be/A6MHtKkA0CA?si=drOclbybHIWYYYuI) from udacity helped me understand the concept of service workers. The installation of a service worker in a browser and to use them to fetch the files whenever required.

##PHASE 5 (Local Data Persistance)

After phase 4, app loads offline. Tasks were stored in JS variables. So, on refresh, JS memory resets and tasks were lost. Main goal of phase 5 is to save the tasks and all the data offline. We use IndexedDB to resolve that.
Inside the database, kanbanDB, we create an object store called board with id as the primary key.
“await dbReady;” was a major bug fix
Without this:
•	db was sometimes undefined
•	Transactions failed silently
Now, db is guaranteed to be ready.
This phase:
•	Makes the app reliable
•	Enables true offline usage

##PHASE 6 (Offline Action Queue)

The goal of phase 6 is to track what actions happened offline, not just the final board state so that server knows what all changed. An offline action queue was implemented so user actions could be replayed later when syncing with backend.
A second IndexedDB object store called actions was created in which every action done by the user is stored.
•	Prevents data loss
•	Makes backend sync possible 

##PHASE 7 (Backend Synchronization)

In phase 7, we sync the offline actions that we queued in phase 6 to FastAPI so that when the internet comes back, we can send all queued actions to the backend and clear the queue.
A lightweight backend was created using FastAPI which exposes a /sync endpoint that the frontend calls to send offline actions as JSON when connectivity is restored.
 The browser’s online event is used to detect when connectivity is restored.
When triggered, all queued offline actions are read from IndexedDB.
Actions are sent to the backend using fetch and actions object store is cleared.

What FastAPI does is:
•	It accepts actions
•	Lets us decide what to do with the actions
After implementing Phase 7, I fixed integration issues like backend startup and CORS to ensure the sync worked end-to-end.


##Key Learnings


•	Understanding offline-first web architecture

•	Using Service Workers for caching

•	Persisting data with IndexedDB

•	Synchronizing offline actions with a backend

