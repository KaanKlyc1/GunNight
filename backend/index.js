const gameSpawn = [
  { x: 1250, y: 450 },
  { x: 2180, y: 430 },
  { x: 2287, y: 1327 },
  { x: 2883, y: 2027 },
  { x: 2600, y: 2980 },
  { x: 1047, y: 1328 },
  { x: 861, y: 2022 },
  { x: 824, y: 2852 },
  { x: 1824, y: 3488 },
  { x: 2487, y: 3205 }
];


const configs = {
  local: {
    baseUrl: "",
    server: "localhost:3001",
    eventApiEndpoint: "https://event-staging.zapapa.gamedistribution.com",
    port: 3001,
  },
  staging: {
    baseUrl: "",
    server: "localhost:3001",
    eventApiEndpoint: "https://event-staging.zapapa.gamedistribution.com",
    port: 3001,
  },
  production: {
    baseUrl: "",
    server: "localhost:3001",
    eventApiEndpoint: "https://event-staging.zapapa.gamedistribution.com",
    port: 3001,
  },
};

const EVENT_API_UPDATE_SCORE_INTERVAL_VALUE_MS =
    process.env.EVENT_API_UPDATE_INTERVAL || 10000;

let gameConfig = configs[process.env.NODE_ENV || "local"];

let express = require("express");
let axios = require("axios");
let app = express();
const http = require("http").Server(app);

const io = require("socket.io")(http, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
  path: "/gunnightio",
});

app.get("/gunnightio", function (req, res) {
  res.json({ status: 1 });
});

let rooms = {};
let randomLocationCounter = 0;

io.on("connection", (socket) => {
  const room = socket.handshake.query.room;
  let userData;

  socket.on('verifyPlayer', async function (token) {
    const data = {token: token};
    if (data.token) {
      userData = await verifyTokenRequest(data);
      console.log(userData);
      // io.to(room).emit('verifiedPlayer', userData.userId);
      // console.log('verified Player');

    if (checkUserData(userData)){
      console.log('userdata okey')
        console.log('herşey okey');
        console.log(socket.id, " is connected");
        socket.join(room);


        io.to(room).emit('verifiedPlayer', userData.userId);


        if (!rooms[userData.roomId]) {
          await createRoom(userData,userData.roomId);
        }
        console.log(room);
        console.log(rooms[room].started);
        socket.on("newPlayer", function (pid) {
          rooms[room].players[pid] = {
            pid: pid,
            sid: socket.id,
            token: data.token,
            isOnline: true,
            nickname: userData.username,
            x: gameSpawn[(randomLocationCounter++)%10].x,
            y: gameSpawn[(randomLocationCounter++)%10].y,
            isAlive: true,
            lastDeadTime: Date.now()
          };
          io.to(room).emit("currentPlayers", rooms[room].players);
          socket.to(room).broadcast.emit("newPlayer", rooms[room].players[pid]);
          console.log("player [" + pid + "] connected to room [" + room + "]");
          // console.log(rooms[room].players[pid]);
          console.log(rooms[room].started);
        });



        socket.on("disconnect", async () => {
          try {
            let pid = findPIDwithSID(room, socket.id);
            if (pid) {
              console.log("player [" + pid + "] disconnected");
            if (rooms[room].currentTotalPlayers === 1) {
              clearInterval(rooms[room].countDown);
              delete rooms[room];
            } else {
              rooms[room].currentTotalPlayers--;
              rooms[room].players[pid].isOnline =  false;
              // delete rooms[room].players[pid];
            }

            io.to(room).emit("playerDisconnected", pid);

          }
          } catch(e){
            console.log(e);
          }
        });
        socket.on("move", ({ id, x, y, angle }) => {
          rooms[room].players[id].x = x;
          rooms[room].players[id].y = y;
          rooms[room].players[id].angle = angle;
          socket.to(room).broadcast.emit("move", { id, x, y, angle });
        });
        socket.on("moveEnd", ({ id}) => {
          socket.to(room).broadcast.emit("moveEnd", { id });
        });


        socket.on("makeBullet", ({ id }) => {
          socket.to(room).broadcast.emit("makeBullet", { id });
        });

        socket.on("bulletCollide", ({ killer, death }) => {
          if (rooms[room].players[death].lastDeadTime < Date.now()){
            console.log(killer + "killed " + death);
            addKill(room, killer);
            addDeath(room, death);
            sendPoint(room,rooms[room].players[killer].pid);
            console.log(rooms[room].kills);
            console.log(rooms[room].deaths);
            io.to(room).emit("bulletCollide", { killer, death });
            rooms[room].players[death].lastDeadTime = Date.now() + 3000;
          }

        });

        socket.on("respawnPlayer", ({ id}) => {
          console.log(id)
          let x = gameSpawn[randomLocationCounter++%10].x;
          let y = gameSpawn[randomLocationCounter%10].y;
          rooms[room].players[id].x = x;
          rooms[room].players[id].y = y;
          io.to(room).emit("respawnPlayer", { id,x,y});
        });
        socket.on("getKills", () => {
          var pKill = rooms[room].kills;
          console.log("pkill: ", pKill);
          io.to(socket.id).emit("getKills", pKill);
        });
        socket.on("getDeaths", () => {
          var pDeath = rooms[room].deaths;
          console.log("pdeath: ", pDeath);
          io.to(socket.id).emit("getDeaths", pDeath);
        });
        if (!rooms[room].started) {
          basicTimer(room);
        }
    } else {
      socket.emit('Error', 'Your user data is corrupted.');
    }
  }  else {
    socket.emit('Error', 'You do not have or invalid game token.');
  } });
  });


http.listen(3001, () => {
  console.log(`server listening on localhost:${gameConfig.port}`);
});

function getCountOfPlayers(room) {
  return Object.keys(rooms[room].players).length;
}

async function createRoom(userData,room) {
  let roomobject = {
    id: room,
    eventId: userData.eventId,
    players: {},
    currentTotalPlayers: 0,
    kills: {},
    deaths: {},
    started: false,
    totalPlayer: 2,
    countDown: undefined
  };

  rooms[room] = roomobject;
}

async function verifyTokenRequest(data) {
  let config = {
    headers: {
      'Authorization': 'public'
    }
  }
  const userData = await axios.post(
      `${gameConfig.eventApiEndpoint}/verifytoken`,
      data,config
  );


  return userData.data.data;
}

function addKill(room, id) {
  if (!rooms[room].kills[id]) {
    rooms[room].kills[id] = 1;
  } else {
    rooms[room].kills[id]++;
  }
}
function addDeath(room, id) {
  if (!rooms[room].deaths[id]) {
    rooms[room].deaths[id] = 1;
  } else {
    rooms[room].deaths[id]++;
  }
}

function checkUserData(userData){
  // console.log('userdatabudur',userData);
  if ( userData.userId && userData.roomId && userData.username && userData.userId !== null && userData.roomId !== null
      && userData.username !== null){
    return true;
  }
  return false;
}

function playerIsAlreadyJoined(room, playerID) {
  if (!rooms[room]){
    return false;
  }
  let isAlready = false;

  let playerList = rooms[room].players;

  Object.keys(playerList).forEach(function (pID) {
    if (playerList[pID].pid === playerID) {
      isAlready = true;
    }
  });
  console.log('isAlready',isAlready);
  return isAlready;
}

function basicTimer(room) {
  rooms[room].started = true;
  let counter = 300;
  let voteCountdown = setInterval(function () {
    counter--;
    io.to(room).emit("countDownTimer", counter);
    if (counter <= 0) {
      rooms[room].started = false;
      console.log(rooms[room].started);
      //io.to(room).emit(signal);
      clearInterval(voteCountdown);
    }
  }, 1000);
  rooms[room].countDown = voteCountdown;
}

function sendPoint(room,pid) {
  axios.post(
          `${gameConfig.eventApiEndpoint}/score/${rooms[room].eventId}/${rooms[room].players[pid].nickname}/10/1`, null,
          {
            headers: {
              Authorization: "public",
            },
          }
      ).then((res) => {
        console.log("[score update]", res.data);
      }).catch((err) => console.log("[score update error]", err.data));


    }
    

function findPIDwithSID(room, sid) {
  let playerList = rooms[room].players;
  let returnPID;
  if (playerList) {
    Object.keys(playerList).forEach(function (pID) {
      if (playerList[pID].sid === sid) {
        returnPID = pID;
      }
    });
  }

  return returnPID;
}
