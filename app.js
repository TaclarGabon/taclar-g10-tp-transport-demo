
const STORAGE_KEY = "g10_tp_transport_demo_v1";
const CAPACITY = 24;

const BUS_DEFINITIONS = [
  {
    id:"bus1",
    label:"Bus 1",
    axis:"Axe 1",
    routeName:"Owendo → La Poste → Centre-ville",
    startTime:"06h30",
    stops:[
      {name:"Owendo", time:"06h30"},
      {name:"La Poste", time:"07h15"},
      {name:"Centre-ville", time:"07h45"}
    ]
  },
  {
    id:"bus2",
    label:"Bus 2",
    axis:"Axe 1",
    routeName:"Centre-ville → La Poste → Owendo",
    startTime:"06h30",
    stops:[
      {name:"Centre-ville", time:"06h30"},
      {name:"La Poste", time:"06h45"},
      {name:"Owendo", time:"07h40"}
    ]
  },
  {
    id:"bus3",
    label:"Bus 3",
    axis:"Axe 2",
    routeName:"Owendo → Nzeng-Ayong → PK5 → PK12",
    startTime:"06h45",
    stops:[
      {name:"Owendo", time:"06h45"},
      {name:"Nzeng-Ayong", time:"07h20"},
      {name:"PK5", time:"07h45"},
      {name:"PK12", time:"08h15"}
    ]
  },
  {
    id:"bus4",
    label:"Bus 4",
    axis:"Axe 2",
    routeName:"PK12 → PK5 → Nzeng-Ayong → Owendo",
    startTime:"06h45",
    stops:[
      {name:"PK12", time:"06h45"},
      {name:"PK5", time:"07h15"},
      {name:"Nzeng-Ayong", time:"07h40"},
      {name:"Owendo", time:"08h20"}
    ]
  },
  {
    id:"bus5",
    label:"Bus 5",
    axis:"Axe 3",
    routeName:"Akanda → Alibandeng → La Poste → Centre-ville",
    startTime:"07h00",
    stops:[
      {name:"Akanda", time:"07h00"},
      {name:"Alibandeng", time:"07h25"},
      {name:"La Poste", time:"08h00"},
      {name:"Centre-ville", time:"08h15"}
    ]
  },
  {
    id:"bus6",
    label:"Bus 6",
    axis:"Axe 3",
    routeName:"Centre-ville → La Poste → Alibandeng → Akanda",
    startTime:"07h00",
    stops:[
      {name:"Centre-ville", time:"07h00"},
      {name:"La Poste", time:"07h15"},
      {name:"Alibandeng", time:"07h50"},
      {name:"Akanda", time:"08h20"}
    ]
  }
];

function defaultState(){
  const buses = {};
  BUS_DEFINITIONS.forEach(bus => {
    buses[bus.id] = {
      stage:0,
      reservations:[],
      log:[]
    };
  });

  // quelques données démo dans Bus 1 pour montrer la liste chauffeur
  buses.bus1.reservations = [
    {id:uid(), name:"MJK", phone:"", boarding:"Owendo", seats:1, ref:"G10-B1-1001", createdAt:nowLabel()},
    {id:uid(), name:"NANCY", phone:"", boarding:"Owendo", seats:1, ref:"G10-B1-1002", createdAt:nowLabel()},
    {id:uid(), name:"EDAN", phone:"", boarding:"La Poste", seats:4, ref:"G10-B1-1003", createdAt:nowLabel()}
  ];

  return { buses };
}

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    const state = defaultState();
    saveState(state);
    return state;
  }
  try{
    const state = JSON.parse(raw);
    BUS_DEFINITIONS.forEach(bus => {
      if(!state.buses[bus.id]){
        state.buses[bus.id] = {stage:0,reservations:[],log:[]};
      }
    });
    return state;
  }catch(e){
    const state = defaultState();
    saveState(state);
    return state;
  }
}

function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetAll(){
  localStorage.removeItem(STORAGE_KEY);
  const state = defaultState();
  saveState(state);
  return state;
}

function clearAllEmpty(){
  const state = defaultState();
  Object.keys(state.buses).forEach(id => {
    state.buses[id].reservations = [];
    state.buses[id].stage = 0;
    state.buses[id].log = [];
  });
  saveState(state);
  return state;
}

function getBusDef(busId){
  return BUS_DEFINITIONS.find(b => b.id === busId) || BUS_DEFINITIONS[0];
}

function totalReserved(busState){
  return busState.reservations.reduce((sum,r)=>sum + Number(r.seats || 0), 0);
}

function remainingSeats(busState){
  return CAPACITY - totalReserved(busState);
}

function currentStatus(busState){
  if(busState.stage === 0){
    if(remainingSeats(busState) <= 0) return {label:"Bus complet", cls:"pill pill-full"};
    return {label:"Réservations ouvertes", cls:"pill pill-open"};
  }
  const stage = busState.stage;
  if(stage % 2 === 1) return {label:"En route", cls:"pill pill-road"};
  if(stage >= 2) return {label:"Arrêt / Embarquement", cls:"pill pill-stop"};
  return {label:"En cours", cls:"pill pill-neutral"};
}

function isTripFinished(busDef, busState){
  return busState.stage >= (busDef.stops.length * 2 - 2);
}

function getStepText(busDef, busState){
  const stage = busState.stage;
  const finalStage = busDef.stops.length * 2 - 2;
  if(stage === 0){
    return {
      current:`En attente du départ à ${busDef.stops[0].name}`,
      action:`Départ ${busDef.stops[0].name}`
    };
  }
  if(stage >= finalStage){
    return {
      current:`Bus arrivé à ${busDef.stops[busDef.stops.length - 1].name}`,
      action:"Course terminée"
    };
  }

  const moveIndex = Math.floor((stage + 1) / 2);
  if(stage % 2 === 1){
    return {
      current:`En route vers ${busDef.stops[moveIndex].name}`,
      action:`Arrivé à ${busDef.stops[moveIndex].name}`
    };
  }

  return {
    current:`Arrêt ${busDef.stops[moveIndex].name} — embarquement`,
    action:`Départ ${busDef.stops[moveIndex].name}`
  };
}

function advanceTrip(busId){
  const state = loadState();
  const busDef = getBusDef(busId);
  const busState = state.buses[busId];
  const finalStage = busDef.stops.length * 2 - 2;
  if(busState.stage >= finalStage) return state;

  const step = getStepText(busDef, busState);
  busState.log.unshift({time:realTime(), text:step.action});
  busState.stage += 1;
  saveState(state);
  return state;
}

function resetTripOnly(busId){
  const state = loadState();
  state.buses[busId].stage = 0;
  state.buses[busId].log = [];
  saveState(state);
  return state;
}

function resetBusFull(busId){
  const state = loadState();
  state.buses[busId].stage = 0;
  state.buses[busId].log = [];
  state.buses[busId].reservations = [];
  saveState(state);
  return state;
}

function addReservation(busId, data){
  const state = loadState();
  const busState = state.buses[busId];
  if(busState.stage > 0){
    return {ok:false, message:"Réservation fermée : le bus est déjà parti."};
  }
  const seats = Number(data.seats);
  if(!data.name || !data.name.trim()){
    return {ok:false, message:"Merci d’entrer le nom complet."};
  }
  if(!Number.isInteger(seats) || seats < 1){
    return {ok:false, message:"Merci d’entrer un nombre de places valide."};
  }
  if(seats > remainingSeats(busState)){
    return {ok:false, message:`Réservation impossible : il reste seulement ${remainingSeats(busState)} place(s).`};
  }

  const def = getBusDef(busId);
  const ref = `G10-${def.label.replace("Bus ","B")}-${Math.floor(1000 + Math.random()*9000)}`;
  busState.reservations.push({
    id:uid(),
    name:data.name.trim(),
    phone:(data.phone || "").trim(),
    boarding:data.boarding,
    seats,
    ref,
    createdAt:nowLabel()
  });
  saveState(state);
  return {ok:true, message:`Réservation confirmée : ${seats} place(s) depuis ${data.boarding}. Référence : ${ref}`};
}

function sortedReservations(busDef, busState){
  const order = {};
  busDef.stops.slice(0, -1).forEach((stop, i) => order[stop.name] = i + 1);
  return [...busState.reservations].sort((a,b)=>{
    const group = (order[a.boarding] || 99) - (order[b.boarding] || 99);
    if(group !== 0) return group;
    return a.name.localeCompare(b.name, "fr", {sensitivity:"base"});
  });
}

function groupTotal(busState, boarding){
  return busState.reservations.filter(r => r.boarding === boarding).reduce((sum,r)=>sum + Number(r.seats || 0), 0);
}

function renderReservationTable(target, busDef, busState){
  if(busState.reservations.length === 0){
    target.innerHTML = `<div class="empty">Aucune réservation pour cette course.</div>`;
    return;
  }
  const sorted = sortedReservations(busDef, busState);
  let html = `
    <table>
      <thead><tr><th>Nom</th><th>Montée</th><th>Places</th><th>Réf.</th></tr></thead>
      <tbody>
  `;
  let currentGroup = "";
  sorted.forEach(r => {
    if(r.boarding !== currentGroup){
      currentGroup = r.boarding;
      html += `
        <tr class="group-row">
          <td colspan="4">📍 Montée ${currentGroup} — ${groupTotal(busState, currentGroup)} place(s)</td>
        </tr>
      `;
    }
    html += `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.boarding)}</td><td>${r.seats}</td><td>${escapeHtml(r.ref)}</td></tr>`;
  });
  html += "</tbody></table>";
  target.innerHTML = html;
}

function renderTimeline(target, busDef, busState){
  const stops = busDef.stops;
  const stage = busState.stage;
  const finalStage = busDef.stops.length * 2 - 2;
  const activeStopIndex = getActiveStopIndex(stage, stops.length);

  let progressClass = "progress-0";
  if(stops.length === 3){
    if(stage <= 0) progressClass = "progress-0";
    else if(stage === 1) progressClass = "progress-1"; // en route vers arrêt 2
    else if(stage === 2) progressClass = "progress-2"; // arrivé arrêt 2
    else if(stage === 3) progressClass = "progress-3"; // en route terminus
    else progressClass = "progress-4";
  } else {
    const ratio = finalStage > 0 ? Math.min(stage / finalStage, 1) : 0;
    if(ratio <= 0) progressClass = "progress-0";
    else if(ratio <= .34) progressClass = "progress-1";
    else if(ratio <= .67) progressClass = "progress-2";
    else if(ratio < 1) progressClass = "progress-3";
    else progressClass = "progress-4";
  }

  target.className = `timeline ${stops.length === 3 ? "stops-3" : ""} ${progressClass}`;

  const movingToIndex = stage % 2 === 1 ? Math.floor((stage + 1) / 2) : -1;

  target.innerHTML = stops.map((stop, index) => {
    const finished = isTripFinished(busDef, busState);
    const done = index < activeStopIndex || finished;
    const active = index === activeStopIndex && !finished && movingToIndex === -1;
    const moving = index === movingToIndex && !finished;
    return `
      <div class="stop ${done ? "done" : ""} ${active ? "active" : ""} ${moving ? "moving" : ""}">
        <div class="dot"></div>
        <strong>${escapeHtml(stop.name)}</strong>
        <span>${escapeHtml(stop.time)}</span>
      </div>
    `;
  }).join("");

  const oldMotion = target.parentElement ? target.parentElement.querySelector(".route-motion") : null;
  if(oldMotion) oldMotion.remove();

  const motion = movementStatus(busDef, busState);
  target.insertAdjacentHTML("afterend", `<div class="route-motion ${motion.lineCls.includes("road") ? "" : motion.lineCls.includes("stop") ? "stop" : motion.lineCls.includes("done") ? "done" : "wait"}">${motion.label}</div>`);
}

function getActiveStopIndex(stage, stopCount){
  if(stage === 0) return 0;
  const index = Math.floor((stage + 1) / 2);
  return Math.min(index, stopCount - 1);
}

function uid(){
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function realTime(){
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function nowLabel(){
  return new Date().toISOString();
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function fillBusSelect(selectEl){
  selectEl.innerHTML = BUS_DEFINITIONS.map(b => `<option value="${b.id}">${b.label} — ${b.routeName}</option>`).join("");
}

function fillBoardingSelect(selectEl, busDef){
  selectEl.innerHTML = busDef.stops.slice(0,-1).map(stop => `<option value="${stop.name}">${stop.name} — ${stop.time}</option>`).join("");
}

function terminalName(busDef){
  return busDef.stops[busDef.stops.length - 1].name;
}


function occupancyStatus(busState){
  const reserved = totalReserved(busState);
  const remaining = remainingSeats(busState);
  if(remaining <= 0) return {label:"Complet", cls:"badge badge-full", cardCls:"bus-full", statReserved:"full", statRemaining:"zero"};
  if(reserved > 0) return {label:"Places en cours", cls:"badge badge-partial", cardCls:"bus-partial", statReserved:"partial", statRemaining:"partial"};
  return {label:"Vide", cls:"badge badge-open", cardCls:"bus-open", statReserved:"open", statRemaining:"open"};
}

function movementStatus(busDef, busState){
  const stage = busState.stage;
  const finalStage = busDef.stops.length * 2 - 2;

  if(stage === 0){
    return {
      label:`En attente au départ : ${busDef.stops[0].name}`,
      short:"En attente départ",
      cls:"badge badge-wait",
      lineCls:"status-line wait",
      cardCls:"bus-open"
    };
  }

  if(stage >= finalStage){
    return {
      label:`Arrivé au terminus : ${busDef.stops[busDef.stops.length - 1].name}`,
      short:"Course terminée",
      cls:"badge badge-done",
      lineCls:"status-line done",
      cardCls:"bus-done"
    };
  }

  const moveIndex = Math.floor((stage + 1) / 2);

  if(stage % 2 === 1){
    return {
      label:`En route vers ${busDef.stops[moveIndex].name}`,
      short:`Vers ${busDef.stops[moveIndex].name}`,
      cls:"badge badge-road",
      lineCls:"status-line road",
      cardCls:"bus-road"
    };
  }

  return {
    label:`À l’arrêt : ${busDef.stops[moveIndex].name} — embarquement`,
    short:`Arrêt ${busDef.stops[moveIndex].name}`,
    cls:"badge badge-stop",
    lineCls:"status-line stop",
    cardCls:"bus-stop"
  };
}

window.G10TP = {
  BUS_DEFINITIONS, CAPACITY, loadState, saveState, resetAll, clearAllEmpty, getBusDef,
  totalReserved, remainingSeats, currentStatus, isTripFinished, getStepText, advanceTrip,
  resetTripOnly, resetBusFull, addReservation, sortedReservations, groupTotal,
  renderReservationTable, renderTimeline, fillBusSelect, fillBoardingSelect, terminalName, occupancyStatus, movementStatus
};
