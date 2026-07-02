
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
      log:[],
      actualTimes:{},
      delayMinutes:0,
      incidentLog:[]
    };
  });

  // quelques données démo dans Bus 1 pour montrer la liste chauffeur
  buses.bus1.reservations = [
    {id:uid(), name:"MJK", phone:"", boarding:"Owendo", seats:1, ref:"G10-B1-1001", createdAt:nowLabel(), farePerSeat:1000, totalAmount:1000, paymentMethod:"Réservation app", paymentStatus:"Payé", boardingStatus:"Absent"},
    {id:uid(), name:"NANCY", phone:"", boarding:"Owendo", seats:1, ref:"G10-B1-1002", createdAt:nowLabel(), farePerSeat:1000, totalAmount:1000, paymentMethod:"Réservation app", paymentStatus:"Payé", boardingStatus:"Absent"},
    {id:uid(), name:"EDAN", phone:"", boarding:"La Poste", seats:4, ref:"G10-B1-1003", createdAt:nowLabel(), farePerSeat:300, totalAmount:1200, paymentMethod:"Réservation app", paymentStatus:"Payé"}
  ];

  return { buses, completedTrips: [] };
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
        state.buses[bus.id] = {stage:0,reservations:[],log:[],actualTimes:{},
      delayMinutes:0,
      incidentLog:[]};
      }
      if(!state.buses[bus.id].actualTimes){ state.buses[bus.id].actualTimes = {}; }
      if(state.buses[bus.id].delayMinutes === undefined){ state.buses[bus.id].delayMinutes = 0; }
      if(!state.buses[bus.id].incidentLog){ state.buses[bus.id].incidentLog = []; }
    });
    if(!state.completedTrips){ state.completedTrips = []; }
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
    state.buses[id].actualTimes = {};
    state.buses[id].delayMinutes = 0;
    state.buses[id].incidentLog = [];
  });
  state.completedTrips = [];
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
  const timeText = recordActualTimeForStage(busDef, busState);

  const departingStop = currentBoardingStopForDeparture(busDef, busState);
  let absentCount = 0;
  if(departingStop && step.action.toLowerCase().startsWith("départ")){
    absentCount = markPendingAbsentAtStop(busState, departingStop);
  }

  const absentText = absentCount > 0 ? ` · ${absentCount} place(s) restée(s) absente(s) à ${departingStop}` : "";
  busState.log.unshift({time:realTime(), text:step.action + absentText + (timeText ? " · " + timeText : "")});
  busState.stage += 1;

  if(busState.stage >= finalStage){
    const record = recordCompletedTrip(state, busId);
    if(record){
      busState.log.unshift({
        time: realTime(),
        text: `Tournée enregistrée dans Recettes · ${formatMoney(record.revenue)}`
      });
    }
  }

  saveState(state);
  return state;
}

function resetTripOnly(busId){
  const state = loadState();
  state.buses[busId].stage = 0;
  state.buses[busId].log = [];
  state.buses[busId].actualTimes = {};
  state.buses[busId].delayMinutes = 0;
  state.buses[busId].incidentLog = [];
  saveState(state);
  return state;
}

function resetBusFull(busId){
  const state = loadState();
  state.buses[busId].stage = 0;
  state.buses[busId].log = [];
  state.buses[busId].actualTimes = {};
  state.buses[busId].delayMinutes = 0;
  state.buses[busId].incidentLog = [];
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

  const fare = farePerSeat(busId, data.boarding);
  if(fare === null){
    return {ok:false, message:"Tarif non défini pour ce bus / point de montée."};
  }

  const def = getBusDef(busId);
  const ref = `G10-${def.label.replace("Bus ","B")}-${Math.floor(1000 + Math.random()*9000)}`;
  const total = fare * seats;

  busState.reservations.push({
    id:uid(),
    name:data.name.trim(),
    phone:(data.phone || "").trim(),
    boarding:data.boarding,
    seats,
    ref,
    createdAt:nowLabel(),
    farePerSeat:fare,
    totalAmount:total,
    paymentMethod:"Réservation app",
    paymentStatus:"Payé",
    boardingStatus:"Absent"
  });
  saveState(state);
  return {ok:true, message:`Réservation confirmée : ${seats} place(s) depuis ${data.boarding}. Montant payé : ${formatMoney(total)}. Référence : ${ref}`};
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
      <thead><tr><th>Nom</th><th>Montée</th><th>Places</th><th>Statut</th><th>Paiement</th><th>Réf.</th></tr></thead>
      <tbody>
  `;
  let currentGroup = "";
  sorted.forEach(r => {
    if(r.boarding !== currentGroup){
      currentGroup = r.boarding;
      html += `
        <tr class="group-row">
          <td colspan="6">📍 Montée ${currentGroup} — ${groupTotal(busState, currentGroup)} place(s)</td>
        </tr>
      `;
    }
    html += `<tr>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.boarding)}</td>
      <td>${r.seats}</td>
      <td><span class="badge ${passengerStatusClass(r)}">${escapeHtml(passengerStatusLabel(r))}</span></td>
      <td><span class="badge ${paymentBadgeClass(r)}">${formatMoney(r.totalAmount || 0)}</span></td>
      <td>${escapeHtml(r.ref)}</td>
    </tr>`;
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
        <span class="plan-time">Prévu ${escapeHtml(stop.time)}</span>
        ${actualTimeHtml(stop.name, busState)}
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


const FARE_RULES = {
  bus1: {
    "Owendo": {km:16, fare:1000},
    "La Poste": {km:2, fare:300}
  },
  bus2: {
    "Centre-ville": {km:16, fare:1000},
    "La Poste": {km:15, fare:900}
  },
  bus3: {
    "Owendo": {km:22, fare:1350},
    "Nzeng-Ayong": {km:10, fare:600},
    "PK5": {km:7, fare:450}
  },
  bus4: {
    "PK12": {km:22, fare:1350},
    "PK5": {km:15, fare:900},
    "Nzeng-Ayong": {km:12, fare:750}
  },
  bus5: {
    "Akanda": {km:31, fare:1900},
    "Alibandeng": {km:9, fare:550},
    "La Poste": {km:2, fare:300}
  },
  bus6: {
    "Centre-ville": {km:31, fare:1900},
    "La Poste": {km:30, fare:1800},
    "Alibandeng": {km:22, fare:1350}
  }
};

function roundFareTo50(amount){
  return Math.ceil(Number(amount) / 50) * 50;
}

function formatMoney(amount){
  if(amount === null || amount === undefined || Number.isNaN(Number(amount))) return "Tarif à confirmer";
  return `${Number(amount).toLocaleString("fr-FR")} FCFA`;
}

function fareInfo(busId, boarding){
  const rule = FARE_RULES[busId];
  if(!rule || !rule[boarding]) return null;
  return rule[boarding];
}

function farePerSeat(busId, boarding){
  const info = fareInfo(busId, boarding);
  if(!info) return null;
  return info.fare;
}

function kmForFare(busId, boarding){
  const info = fareInfo(busId, boarding);
  if(!info) return null;
  return info.km;
}

function reservationTotal(busId, boarding, seats){
  const fare = farePerSeat(busId, boarding);
  if(fare === null) return null;
  return fare * Number(seats || 0);
}

function busRevenue(busState){
  return busState.reservations.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
}

function paymentBadgeClass(r){
  if(r.paymentMethod === "Cash chauffeur") return "payment-cash";
  if(r.paymentStatus === "Payé") return "payment-paid";
  return "payment-pending";
}

function addCashPassenger(busId, data){
  const state = loadState();
  const busState = state.buses[busId];
  const busDef = getBusDef(busId);
  const activeStop = currentBoardingStopForDeparture(busDef, busState);

  if(!activeStop){
    return {ok:false, message:"Cash impossible : le bus est en route ou la course est terminée. Encaissement seulement à un point de montée actif."};
  }

  if(data.boarding !== activeStop){
    return {ok:false, message:`Cash impossible : le point de montée actif est ${activeStop}.`};
  }

  const seats = Number(data.seats);
  if(!Number.isInteger(seats) || seats < 1){
    return {ok:false, message:"Merci d’entrer un nombre de places valide."};
  }

  if(seats > remainingSeats(busState)){
    return {ok:false, message:`Encaissement impossible : il reste seulement ${remainingSeats(busState)} place(s).`};
  }

  const fare = farePerSeat(busId, data.boarding);
  if(fare === null){
    return {ok:false, message:"Tarif non défini pour ce bus / point de montée."};
  }

  const total = fare * seats;
  const ref = `CASH-${busDef.label.replace("Bus ","B")}-${Math.floor(1000 + Math.random()*9000)}`;

  busState.reservations.push({
    id:uid(),
    name:(data.name && data.name.trim()) ? data.name.trim() : "Passager cash",
    phone:"",
    boarding:data.boarding,
    seats,
    ref,
    createdAt:nowLabel(),
    farePerSeat:fare,
    totalAmount:total,
    paymentMethod:"Cash chauffeur",
    paymentStatus:"Payé",
    boardingStatus:"Monté et payé",
    boarded:true
  });

  saveState(state);
  return {ok:true, message:`Cash encaissé : ${formatMoney(total)} pour ${seats} place(s). Référence : ${ref}`};
}


function passengerStatusLabel(r){
  return r.boardingStatus === "Monté et payé" ? "Monté et payé" : "Absent";
}

function passengerStatusClass(r){
  return passengerStatusLabel(r) === "Monté et payé" ? "status-boarded" : "status-absent";
}

function setPassengerStatus(busId, passengerId, status){
  const state = loadState();
  const busState = state.buses[busId];
  const p = busState.reservations.find(r => r.id === passengerId);
  if(!p) return {ok:false, message:"Passager introuvable."};

  status = status === "Monté et payé" ? "Monté et payé" : "Absent";
  p.boardingStatus = status;
  p.boarded = status === "Monté et payé";

  saveState(state);
  return {ok:true, message:`Statut mis à jour : ${p.name} — ${status}.`};
}

function currentBoardingStopForDeparture(busDef, busState){
  const stage = busState.stage;
  if(stage === 0) return busDef.stops[0].name;

  if(stage % 2 === 0){
    const stopIndex = Math.floor((stage + 1) / 2);
    if(stopIndex < busDef.stops.length - 1) return busDef.stops[stopIndex].name;
  }

  return null;
}

function confirmAllAtCurrentStop(busId){
  const state = loadState();
  const busDef = getBusDef(busId);
  const busState = state.buses[busId];
  const stopName = currentBoardingStopForDeparture(busDef, busState);
  if(!stopName) return {ok:false, message:"Aucun point de montée actif à confirmer."};

  let count = 0;
  busState.reservations.forEach(r => {
    if(r.boarding === stopName && passengerStatusLabel(r) === "Absent"){
      r.boardingStatus = "Monté et payé";
      r.boarded = true;
      count += Number(r.seats || 0);
    }
  });

  saveState(state);
  return {ok:true, message:`${count} place(s) confirmée(s) comme montées à ${stopName}.`};
}

function markPendingAbsentAtStop(busState, stopName){
  let count = 0;
  busState.reservations.forEach(r => {
    if(r.boarding === stopName && passengerStatusLabel(r) === "Absent"){
      count += Number(r.seats || 0);
    }
  });
  return count;
}

function boardingSummary(busDef, busState){
  const rows = busDef.stops.slice(0,-1).map(stop => {
    const list = busState.reservations.filter(r => r.boarding === stop.name);
    return {
      stop: stop.name,
      total: list.reduce((sum,r)=>sum+Number(r.seats||0),0),
      boarded: list.filter(r => passengerStatusLabel(r) === "Monté et payé").reduce((sum,r)=>sum+Number(r.seats||0),0),
      absent: list.filter(r => passengerStatusLabel(r) === "Absent").reduce((sum,r)=>sum+Number(r.seats||0),0)
    };
  });
  return rows;
}


function ensureActualTimes(busState){
  if(!busState.actualTimes) busState.actualTimes = {};
  return busState.actualTimes;
}

function recordActualTimeForStage(busDef, busState){
  const stage = busState.stage;
  const actual = ensureActualTimes(busState);
  const current = realTime();

  if(stage === 0){
    const stop = busDef.stops[0].name;
    actual[stop] = actual[stop] || {};
    actual[stop].departure = current;
    return `Départ réel ${stop} : ${current}`;
  }

  if(stage % 2 === 1){
    const stopIndex = Math.floor((stage + 1) / 2);
    const stop = busDef.stops[stopIndex].name;
    actual[stop] = actual[stop] || {};
    actual[stop].arrival = current;
    return `Arrivée réelle ${stop} : ${current}`;
  }

  if(stage % 2 === 0){
    const stopIndex = Math.floor((stage + 1) / 2);
    const stop = busDef.stops[stopIndex].name;
    actual[stop] = actual[stop] || {};
    actual[stop].departure = current;
    return `Départ réel ${stop} : ${current}`;
  }

  return "";
}

function actualTimeHtml(stopName, busState){
  const actual = ensureActualTimes(busState)[stopName] || {};
  const rows = [];
  if(actual.arrival) rows.push(`<span class="real-time">(arrivée réelle ${actual.arrival})</span>`);
  if(actual.departure) rows.push(`<span class="real-time">(départ réel ${actual.departure})</span>`);
  if(rows.length === 0) return `<span class="real-time empty">(réel —)</span>`;
  return rows.join("");
}


function parsePlanTimeToMinutes(planTime){
  const cleaned = String(planTime).replace("h", ":");
  const [h, m] = cleaned.split(":").map(Number);
  return h * 60 + m;
}

function minutesToPlanTime(totalMinutes){
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2,"0")}h${String(m).padStart(2,"0")}`;
}

function addDelayToPlanTime(planTime, delay){
  return minutesToPlanTime(parsePlanTimeToMinutes(planTime) + Number(delay || 0));
}

function eligibleBoardingStopsForAlerts(busDef, busState){
  const stage = busState.stage;
  const boardingStops = busDef.stops.slice(0, -1);

  return boardingStops
    .filter((stop, index) => {
      if(index === 0) return stage === 0;
      return stage <= index * 2;
    })
    .map(stop => stop.name);
}

function passengersToNotifyForIncident(busDef, busState){
  const stops = eligibleBoardingStopsForAlerts(busDef, busState);
  return busState.reservations.filter(r =>
    stops.includes(r.boarding) && passengerStatusLabel(r) !== "Monté et payé"
  );
}

function signalIncident(busId, data){
  const state = loadState();
  const busDef = getBusDef(busId);
  const busState = state.buses[busId];

  if(!busState.incidentLog) busState.incidentLog = [];
  if(busState.delayMinutes === undefined) busState.delayMinutes = 0;

  const delay = Number(data.delayMinutes || 0);
  if(![15,30,45,60].includes(delay)){
    return {ok:false, message:"Choisis une estimation de retard valide : 15, 30, 45 minutes ou 1 heure."};
  }

  const incidentType = data.incidentType || "Incident";
  const note = (data.note || "").trim();
  busState.delayMinutes += delay;

  const notifyList = passengersToNotifyForIncident(busDef, busState);
  const notifySeats = notifyList.reduce((sum, r) => sum + Number(r.seats || 0), 0);

  const nextStops = eligibleBoardingStopsForAlerts(busDef, busState);
  const updatedTimes = busDef.stops
    .filter(stop => nextStops.includes(stop.name) || stop.name === terminalName(busDef))
    .map(stop => `${stop.name} ${addDelayToPlanTime(stop.time, busState.delayMinutes)}`)
    .join(" · ");

  const entry = {
    time: realTime(),
    type: incidentType,
    addedDelay: delay,
    totalDelay: busState.delayMinutes,
    note,
    notifySeats,
    notifyPassengers: notifyList.map(r => ({name:r.name, phone:r.phone || "", boarding:r.boarding, seats:r.seats})),
    updatedTimes
  };

  busState.incidentLog.unshift(entry);
  busState.log.unshift({
    time: realTime(),
    text: `${incidentType} · retard +${delay} min · retard cumulé ${busState.delayMinutes} min · ${notifySeats} place(s) à prévenir`
  });

  saveState(state);
  return {
    ok:true,
    message:`Incident déclaré : ${incidentType}. Retard cumulé ${busState.delayMinutes} min. ${notifySeats} place(s) à prévenir.`,
    notifySeats,
    updatedTimes
  };
}

function delayLabel(busState){
  const delay = Number(busState.delayMinutes || 0);
  return delay > 0 ? `Retard +${delay} min` : "Aucun retard déclaré";
}


function tripRecordId(busId, busState){
  const lastLog = (busState.log && busState.log[0] && busState.log[0].time) ? busState.log[0].time : realTime();
  return `${busId}-${lastLog}-${totalReserved(busState)}-${busRevenue(busState)}`;
}

function completedTripExists(state, id){
  return (state.completedTrips || []).some(t => t.id === id);
}

function recordCompletedTrip(state, busId){
  const busDef = getBusDef(busId);
  const busState = state.buses[busId];
  if(!state.completedTrips) state.completedTrips = [];

  const id = tripRecordId(busId, busState);
  if(completedTripExists(state, id)) return null;

  const summary = boardingSummary(busDef, busState);
  const boarded = busState.reservations
    .filter(r => passengerStatusLabel(r) === "Monté et payé")
    .reduce((sum,r)=>sum+Number(r.seats||0),0);
  const absent = busState.reservations
    .filter(r => passengerStatusLabel(r) === "Absent")
    .reduce((sum,r)=>sum+Number(r.seats||0),0);

  const record = {
    id,
    busId,
    busLabel: busDef.label,
    axis: busDef.axis,
    routeName: busDef.routeName,
    terminal: terminalName(busDef),
    completedAt: realTime(),
    plannedStart: busDef.startTime,
    revenue: busRevenue(busState),
    reservedSeats: totalReserved(busState),
    remainingSeats: remainingSeats(busState),
    boardedSeats: boarded,
    absentSeats: absent,
    delayMinutes: Number(busState.delayMinutes || 0),
    boardingSummary: summary,
    actualTimes: busState.actualTimes || {}
  };

  state.completedTrips.unshift(record);
  return record;
}

function shiftRevenueTotal(state){
  return (state.completedTrips || []).reduce((sum,t)=>sum+Number(t.revenue||0),0);
}

function shiftSeatsTotal(state){
  return (state.completedTrips || []).reduce((sum,t)=>sum+Number(t.reservedSeats||0),0);
}

function tripsByBus(state){
  const rows = {};
  BUS_DEFINITIONS.forEach(bus => {
    rows[bus.id] = {busId:bus.id,busLabel:bus.label,routeName:bus.routeName,count:0,revenue:0,seats:0};
  });
  (state.completedTrips || []).forEach(t => {
    if(!rows[t.busId]) rows[t.busId] = {busId:t.busId,busLabel:t.busLabel,routeName:t.routeName,count:0,revenue:0,seats:0};
    rows[t.busId].count += 1;
    rows[t.busId].revenue += Number(t.revenue || 0);
    rows[t.busId].seats += Number(t.reservedSeats || 0);
  });
  return Object.values(rows);
}

window.G10TP = {
  BUS_DEFINITIONS, CAPACITY, loadState, saveState, resetAll, clearAllEmpty, getBusDef,
  totalReserved, remainingSeats, currentStatus, isTripFinished, getStepText, advanceTrip,
  resetTripOnly, resetBusFull, addReservation, sortedReservations, groupTotal,
  renderReservationTable, renderTimeline, fillBusSelect, fillBoardingSelect, terminalName, occupancyStatus, movementStatus, formatMoney, fareInfo, farePerSeat, kmForFare, reservationTotal, busRevenue, addCashPassenger, passengerStatusLabel, passengerStatusClass, setPassengerStatus, currentBoardingStopForDeparture, confirmAllAtCurrentStop, boardingSummary, actualTimeHtml, recordActualTimeForStage, signalIncident, delayLabel, passengersToNotifyForIncident, eligibleBoardingStopsForAlerts, addDelayToPlanTime, recordCompletedTrip, shiftRevenueTotal, shiftSeatsTotal, tripsByBus
};
