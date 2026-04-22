const state = {
  currentStep: 0,
  projectType: 'neubau',
  brand: 'handelsmarke',
  thermostat: 'analog',
  floors: []
};

const totalSteps = 7;
const floorsContainer = document.getElementById('floorsContainer');
const floorTemplate = document.getElementById('floorTemplate');
const roomTemplate = document.getElementById('roomTemplate');
const brandBlock = document.getElementById('brandBlock');
const summaryProjectType = document.getElementById('summaryProjectType');
const summaryBrand = document.getElementById('summaryBrand');
const summaryBrandBox = document.getElementById('summaryBrandBox');
const summaryRooms = document.getElementById('summaryRooms');
const finalCheck = document.getElementById('finalCheck');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function formatProjectType(value) {
  return value === 'neubau' ? 'Neubau' : 'Sanierung';
}

function formatBrand(value) {
  const map = { handelsmarke: 'Handelsmarke', uponor: 'Uponor', roth: 'Roth' };
  return map[value] || value;
}

function formatThermostat(value) {
  const map = { analog: 'Analog', lcd: 'LCD', smart: 'Smart' };
  return map[value] || value;
}

function createFloor() {
  return { name: '', type: 'Erdgeschoss', rooms: [createRoom()] };
}

function createRoom() {
  return {
    name: '',
    type: 'Wohnzimmer',
    area: '',
    flooring: 'Fliese',
    loop: 'Ja',
    note: ''
  };
}

function showStep(step) {
  state.currentStep = Math.max(0, Math.min(totalSteps - 1, step));

  document.querySelectorAll('.step-item').forEach(item => {
    item.classList.toggle('active', Number(item.dataset.step) === state.currentStep);
  });

  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.toggle('active', Number(panel.dataset.stepPanel) === state.currentStep);
  });

  prevBtn.style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.style.display = state.currentStep === totalSteps - 1 ? 'none' : 'inline-flex';
}

function renderProjectType() {
  document.querySelectorAll('#projectTypeChoices .choice-card').forEach(card => {
    card.classList.toggle('active', card.dataset.type === state.projectType);
  });
  brandBlock.classList.toggle('hidden', state.projectType !== 'neubau');
  summaryProjectType.textContent = formatProjectType(state.projectType);
  summaryBrandBox.classList.toggle('hidden', state.projectType !== 'neubau');
  updateFinalCheck();
}

function renderBrand() {
  document.querySelectorAll('#brandChoices .choice-card').forEach(card => {
    card.classList.toggle('active', card.dataset.brand === state.brand);
  });
  summaryBrand.textContent = formatBrand(state.brand);
  updateFinalCheck();
}

function renderThermostat() {
  document.querySelectorAll('#thermostatChoices .choice-card').forEach(card => {
    card.classList.toggle('active', card.dataset.thermostat === state.thermostat);
  });
  document.getElementById('summaryThermostat').textContent = formatThermostat(state.thermostat);
  updateFinalCheck();
}

function renderFloors() {
  floorsContainer.innerHTML = '';

  state.floors.forEach((floor, floorIndex) => {
    const floorNode = floorTemplate.content.firstElementChild.cloneNode(true);
    floorNode.querySelector('.floor-title').textContent = `Etage ${floorIndex + 1}`;

    const removeFloorBtn = floorNode.querySelector('.remove-floor-btn');
    removeFloorBtn.disabled = state.floors.length === 1;
    removeFloorBtn.style.opacity = state.floors.length === 1 ? '0.45' : '1';
    removeFloorBtn.style.cursor = state.floors.length === 1 ? 'not-allowed' : 'pointer';

    const floorNameInput = floorNode.querySelector('.floor-name');
    const floorTypeSelect = floorNode.querySelector('.floor-type');
    const roomsContainer = floorNode.querySelector('.rooms-container');
    const addRoomBtn = floorNode.querySelector('.add-room-btn');

    floorNameInput.value = floor.name;
    floorTypeSelect.value = floor.type;

    floorNameInput.addEventListener('input', e => {
      state.floors[floorIndex].name = e.target.value;
      updateSummary();
    });

    floorTypeSelect.addEventListener('change', e => {
      state.floors[floorIndex].type = e.target.value;
      updateSummary();
    });

    removeFloorBtn.addEventListener('click', () => {
      if (state.floors.length === 1) return;
      state.floors.splice(floorIndex, 1);
      document.getElementById('stockwerke').value = state.floors.length;
      renderFloors();
      updateSummary();
    });

    addRoomBtn.addEventListener('click', () => {
      state.floors[floorIndex].rooms.push(createRoom());
      renderFloors();
      updateSummary();
    });

    floor.rooms.forEach((room, roomIndex) => {
      const roomNode = roomTemplate.content.firstElementChild.cloneNode(true);
      roomNode.querySelector('.room-title').textContent = `Raum ${roomIndex + 1}`;

      const roomNameInput = roomNode.querySelector('.room-name');
      const roomTypeSelect = roomNode.querySelector('.room-type');
      const roomAreaInput = roomNode.querySelector('.room-area');
      const roomFlooringSelect = roomNode.querySelector('.room-flooring');
      const roomLoopSelect = roomNode.querySelector('.room-loop');
      const roomNoteInput = roomNode.querySelector('.room-note');
      const removeRoomBtn = roomNode.querySelector('.remove-room-btn');

      roomNameInput.value = room.name;
      roomTypeSelect.value = room.type;
      roomAreaInput.value = room.area;
      roomFlooringSelect.value = room.flooring;
      roomLoopSelect.value = room.loop;
      roomNoteInput.value = room.note;

      roomNameInput.addEventListener('input', e => {
        state.floors[floorIndex].rooms[roomIndex].name = e.target.value;
        updateSummary();
      });
      roomTypeSelect.addEventListener('change', e => {
        state.floors[floorIndex].rooms[roomIndex].type = e.target.value;
        updateSummary();
      });
      roomAreaInput.addEventListener('input', e => {
        state.floors[floorIndex].rooms[roomIndex].area = e.target.value;
        updateSummary();
      });
      roomFlooringSelect.addEventListener('change', e => {
        state.floors[floorIndex].rooms[roomIndex].flooring = e.target.value;
        updateSummary();
      });
      roomLoopSelect.addEventListener('change', e => {
        state.floors[floorIndex].rooms[roomIndex].loop = e.target.value;
        updateSummary();
      });
      roomNoteInput.addEventListener('input', e => {
        state.floors[floorIndex].rooms[roomIndex].note = e.target.value;
        updateSummary();
      });

      removeRoomBtn.addEventListener('click', () => {
        state.floors[floorIndex].rooms.splice(roomIndex, 1);
        if (state.floors[floorIndex].rooms.length === 0) {
          state.floors[floorIndex].rooms.push(createRoom());
        }
        renderFloors();
        updateSummary();
      });

      roomsContainer.appendChild(roomNode);
    });

    floorsContainer.appendChild(floorNode);
  });
}

function updateLayerPreview() {
  const layerList = document.getElementById('layerList');
  const layers = [
    ['Bodenbelag', `${document.getElementById('bodenbelagStaerke').value || 0} mm`],
    ['Estrich', `${document.getElementById('estrichStaerke').value || 0} mm`],
    ['Rohrtyp', document.getElementById('rohrtyp').value],
    ['Systemplatte / Dämmung', `${document.getElementById('daemmungStaerke').value || 0} mm`],
    ['Trittschall', `${document.getElementById('trittschallStaerke').value || 0} mm`],
    ['Untergrund', document.getElementById('untergrund').value]
  ];
  layerList.innerHTML = layers.map(([label, value]) => `<div class="layer-item"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function updateSummary() {
  document.getElementById('summaryGebaeudeart').textContent = document.getElementById('gebaeudeart').value;
  document.getElementById('summaryWaermeerzeuger').textContent = document.getElementById('waermeerzeuger').value;
  document.getElementById('summarySystemplatte').textContent = document.getElementById('systemplatte').value;
  document.getElementById('summaryRohrtyp').textContent = document.getElementById('rohrtyp').value;
  document.getElementById('summaryVerlegeabstand').textContent = document.getElementById('verlegeabstand').value;
  document.getElementById('summaryVerteilerart').textContent = document.getElementById('verteilerart').value;
  document.getElementById('summaryVerteilerkasten').textContent = document.getElementById('verteilerkasten').value;
  document.getElementById('summaryDaemmung').textContent = `${document.getElementById('daemmungStaerke').value || 0} mm Dämmung`;
  document.getElementById('summaryEstrich').textContent = `${document.getElementById('estrichStaerke').value || 0} mm Estrich`;
  document.getElementById('summaryBodenbelag').textContent = `${document.getElementById('bodenbelagStaerke').value || 0} mm Bodenbelag`;

  const zd = document.getElementById('zusatzdaemmung').value;
  const zds = document.getElementById('zusatzdaemmungStaerke').value || 0;
  document.getElementById('summaryZusatzdaemmung').textContent = zd === 'keine' ? 'keine Zusatzdämmung' : `${zd} ${zds} mm`;

  const roomTexts = [];
  state.floors.forEach((floor, floorIndex) => {
    floor.rooms.forEach((room, roomIndex) => {
      const floorLabel = floor.name || floor.type || `Etage ${floorIndex + 1}`;
      const roomLabel = room.name || room.type || `Raum ${roomIndex + 1}`;
      const areaLabel = room.area ? ` – ${room.area} m²` : '';
      roomTexts.push(`${floorLabel}: ${roomLabel}${areaLabel}`);
    });
  });

  if (roomTexts.length) {
    summaryRooms.innerHTML = roomTexts.map(text => `<div class="tag" style="display:block; margin:0 0 8px 0; border-radius:10px;">${text}</div>`).join('');
  } else {
    summaryRooms.textContent = 'Noch keine Räume angelegt.';
  }

  updateLayerPreview();
  updateFinalCheck();
}

function updateFinalCheck() {
  const standortValue = document.getElementById('standort').value.trim() || 'offen';
  const roomsCount = state.floors.reduce((sum, floor) => sum + floor.rooms.length, 0);
  finalCheck.innerHTML = `
    <div><strong>Projekt:</strong> ${formatProjectType(state.projectType)}${state.projectType === 'neubau' ? ' / ' + formatBrand(state.brand) : ''}</div>
    <div><strong>Gebäude:</strong> ${document.getElementById('gebaeudeart').value}</div>
    <div><strong>Wärmeerzeuger:</strong> ${document.getElementById('waermeerzeuger').value}</div>
    <div><strong>Standort:</strong> ${standortValue}</div>
    <div><strong>System:</strong> ${document.getElementById('systemplatte').value}, ${document.getElementById('rohrtyp').value}, ${document.getElementById('verlegeabstand').value}</div>
    <div><strong>Thermostat:</strong> ${formatThermostat(state.thermostat)}</div>
    <div><strong>Verteilertechnik:</strong> ${document.getElementById('verteilerart').value}, ${document.getElementById('verteilerkasten').value}</div>
    <div><strong>Zusatzdämmung:</strong> ${document.getElementById('zusatzdaemmung').value} ${document.getElementById('zusatzdaemmungStaerke').value || 0} mm</div>
    <div><strong>Etagen / Räume:</strong> ${state.floors.length} / ${roomsCount}</div>
  `;
}

document.querySelectorAll('#projectTypeChoices .choice-card').forEach(card => {
  card.addEventListener('click', () => {
    state.projectType = card.dataset.type;
    renderProjectType();
    updateSummary();
  });
});

document.querySelectorAll('#brandChoices .choice-card').forEach(card => {
  card.addEventListener('click', () => {
    state.brand = card.dataset.brand;
    renderBrand();
    updateSummary();
  });
});

document.querySelectorAll('#thermostatChoices .choice-card').forEach(card => {
  card.addEventListener('click', () => {
    state.thermostat = card.dataset.thermostat;
    renderThermostat();
    updateSummary();
  });
});

document.querySelectorAll('.step-item').forEach(item => {
  item.addEventListener('click', () => showStep(Number(item.dataset.step)));
});

prevBtn.addEventListener('click', () => showStep(state.currentStep - 1));
nextBtn.addEventListener('click', () => showStep(state.currentStep + 1));

document.getElementById('addFloorBtn').addEventListener('click', () => {
  state.floors.push(createFloor());
  document.getElementById('stockwerke').value = state.floors.length;
  renderFloors();
  updateSummary();
});

document.getElementById('stockwerke').addEventListener('input', e => {
  const desired = Math.max(1, Number(e.target.value) || 1);
  while (state.floors.length < desired) state.floors.push(createFloor());
  while (state.floors.length > desired) state.floors.pop();
  renderFloors();
  updateSummary();
});

[
  'gebaeudeart','waermeerzeuger','standort','systemplatte','rohrtyp','verlegeabstand','estrichart',
  'daemmungStaerke','trittschallStaerke','estrichStaerke','bodenbelagStaerke','randdaemmstreifen','untergrund',
  'verteilerart','verteilerkasten','stellantrieb','anschlussset','zusatzdaemmung','zusatzdaemmungStaerke','zusatzhinweis'
].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', updateSummary);
  el.addEventListener('change', updateSummary);
});

document.getElementById('startCalculationBtn').addEventListener('click', () => {
  alert('Die Berechnungslogik wird im nächsten Schritt ergänzt. Der Button ist bereits korrekt auf der letzten Seite platziert.');
});

state.floors = [createFloor()];
renderProjectType();
renderBrand();
renderThermostat();
renderFloors();
updateSummary();
showStep(0);
