const state = {
  currentStep: 0,
  projectType: '',
  brand: 'handelsmarke',
  heatSource: '',
  thermostat: 'Analog',
  floors: []
};

const totalSteps = 9;
const floorsContainer = document.getElementById('floorsContainer');
const floorTemplate = document.getElementById('floorTemplate');
const roomTemplate = document.getElementById('roomTemplate');
const brandBlock = document.getElementById('brandBlock');
const summaryProjectType = document.getElementById('summaryProjectType');
const summaryBrand = document.getElementById('summaryBrand');
const summaryBrandBox = document.getElementById('summaryBrandBox');
const summaryHeatSource = document.getElementById('summaryHeatSource');
const summaryPlz = document.getElementById('summaryPlz');
const summaryRooms = document.getElementById('summaryRooms');
const finalCheck = document.getElementById('finalCheck');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function createFloor() {
  return { name: '', rooms: [createRoom()] };
}

function createRoom() {
  return {
    name: '',
    function: 'Wohnraum',
    spacing: 'VA 100',
    area: ''
  };
}

function showStep(step) {
  state.currentStep = Math.max(0, Math.min(totalSteps - 1, step));

  document.querySelectorAll('.step-item').forEach((item) => {
    item.classList.toggle('active', Number(item.dataset.step) === state.currentStep);
  });

  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.stepPanel) === state.currentStep);
  });

  prevBtn.style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.style.display = state.currentStep === totalSteps - 1 ? 'none' : 'inline-flex';
  nextBtn.disabled = !canProceedToNextStep();
}

function canProceedToNextStep() {
  if (state.currentStep === 0) {
    return state.projectType !== '';
  }
  if (state.currentStep === 1) {
    return state.heatSource !== '';
  }
  if (state.currentStep === 2) {
    return /^\d{5}$/.test(document.getElementById('plz').value.trim());
  }
  return true;
}

function renderProjectType() {
  document.querySelectorAll('#projectTypeChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.type === state.projectType);
  });

  const showBrand = state.projectType === 'neubau';
  brandBlock.classList.toggle('hidden', !showBrand);
  summaryBrandBox.classList.toggle('hidden', !showBrand);
  summaryProjectType.textContent = state.projectType ? (state.projectType === 'neubau' ? 'Neubau' : 'Sanierung') : 'Noch nicht gewählt';
  summaryBrand.textContent = state.brand === 'uponor' ? 'Uponor' : state.brand === 'roth' ? 'Roth' : 'Handelsmarke';
}

function renderBrand() {
  document.querySelectorAll('#brandChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.brand === state.brand);
  });
  summaryBrand.textContent = state.brand === 'uponor' ? 'Uponor' : state.brand === 'roth' ? 'Roth' : 'Handelsmarke';
}

function renderHeatSource() {
  document.querySelectorAll('#heatSourceChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.heatSource === state.heatSource);
  });
  summaryHeatSource.textContent = state.heatSource || 'Noch nicht gewählt';
}

function renderThermostat() {
  document.querySelectorAll('#thermostatChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.thermostat === state.thermostat);
  });
  document.getElementById('summaryThermostat').textContent = state.thermostat;
}

function renderFloors() {
  floorsContainer.innerHTML = '';

  state.floors.forEach((floor, floorIndex) => {
    const floorNode = floorTemplate.content.firstElementChild.cloneNode(true);
    floorNode.querySelector('.floor-title').textContent = `Etage ${floorIndex + 1}`;

    const floorNameInput = floorNode.querySelector('.floor-name');
    const addRoomBtn = floorNode.querySelector('.add-room-btn');
    const removeFloorBtn = floorNode.querySelector('.remove-floor-btn');
    const roomsContainer = floorNode.querySelector('.rooms-container');

    floorNameInput.value = floor.name;
    floorNameInput.addEventListener('input', (e) => {
      state.floors[floorIndex].name = e.target.value;
      updateSummary();
    });

    addRoomBtn.addEventListener('click', () => {
      state.floors[floorIndex].rooms.push(createRoom());
      renderFloors();
      updateSummary();
    });

    removeFloorBtn.disabled = state.floors.length === 1;
    removeFloorBtn.addEventListener('click', () => {
      if (state.floors.length === 1) return;
      state.floors.splice(floorIndex, 1);
      renderFloors();
      updateSummary();
    });

    floor.rooms.forEach((room, roomIndex) => {
      const roomNode = roomTemplate.content.firstElementChild.cloneNode(true);
      roomNode.querySelector('.room-title').textContent = `Raum ${roomIndex + 1}`;

      const roomNameInput = roomNode.querySelector('.room-name');
      const roomFunctionSelect = roomNode.querySelector('.room-function');
      const roomSpacingSelect = roomNode.querySelector('.room-spacing');
      const roomAreaInput = roomNode.querySelector('.room-area');
      const removeRoomBtn = roomNode.querySelector('.remove-room-btn');

      roomNameInput.value = room.name;
      roomFunctionSelect.value = room.function;
      roomSpacingSelect.value = room.spacing;
      roomAreaInput.value = room.area;

      roomNameInput.addEventListener('input', (e) => {
        state.floors[floorIndex].rooms[roomIndex].name = e.target.value;
        updateSummary();
      });
      roomFunctionSelect.addEventListener('change', (e) => {
        state.floors[floorIndex].rooms[roomIndex].function = e.target.value;
        updateSummary();
      });
      roomSpacingSelect.addEventListener('change', (e) => {
        state.floors[floorIndex].rooms[roomIndex].spacing = e.target.value;
        updateSummary();
      });
      roomAreaInput.addEventListener('input', (e) => {
        state.floors[floorIndex].rooms[roomIndex].area = e.target.value;
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
  const layers = [
    ['System', getRadioValue('system')],
    ['Wärmeleitgruppe', getRadioValue('wlg')],
    ['Dämmungsdicke', getRadioValue('insulationThickness')],
    ['Heizrohr', getRadioValue('pipeType')],
    ['Heizrohr-Größe', getRadioValue('pipeSize')],
    ['Zusatzdämmung', getRadioValue('extraInsulation')],
    ['Zusatzdämmung-WLG', getRadioValue('extraInsulationWlg')],
    ['Zusatzdämmung-Dicke', getRadioValue('extraInsulationThickness')]
  ];

  document.getElementById('layerList').innerHTML = layers
    .map(([label, value]) => `<div class="layer-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}

function updateSummary() {
  summaryPlz.textContent = document.getElementById('plz').value.trim() || 'PLZ offen';
  document.getElementById('summarySystem').textContent = getRadioValue('system');
  document.getElementById('summaryWlg').textContent = getRadioValue('wlg');
  document.getElementById('summaryInsulationThickness').textContent = getRadioValue('insulationThickness');
  document.getElementById('summaryPipeType').textContent = getRadioValue('pipeType');
  document.getElementById('summaryPipeSize').textContent = getRadioValue('pipeSize');
  document.getElementById('summaryConnectionSet').textContent = getRadioValue('connectionSet');
  document.getElementById('summaryCabinetType').textContent = getRadioValue('cabinetType');
  document.getElementById('summaryCabinetMounting').textContent = getRadioValue('cabinetMounting');
  document.getElementById('summaryExtraInsulation').textContent = getRadioValue('extraInsulation');
  document.getElementById('summaryExtraInsulationWlg').textContent = getRadioValue('extraInsulationWlg');
  document.getElementById('summaryExtraInsulationThickness').textContent = getRadioValue('extraInsulationThickness');

  const roomTexts = [];
  state.floors.forEach((floor, floorIndex) => {
    floor.rooms.forEach((room, roomIndex) => {
      const floorLabel = floor.name || `Etage ${floorIndex + 1}`;
      const roomLabel = room.name || `Raum ${roomIndex + 1}`;
      const areaText = room.area ? ` – ${room.area} m²` : '';
      roomTexts.push(`${floorLabel}: ${roomLabel} / ${room.function} / ${room.spacing}${areaText}`);
    });
  });

  summaryRooms.innerHTML = roomTexts.length
    ? roomTexts.map((text) => `<div class="tag" style="display:block; margin:0 0 8px 0; border-radius:10px;">${text}</div>`).join('')
    : 'Noch keine Räume angelegt.';

  updateLayerPreview();
  updateFinalCheck();
  nextBtn.disabled = !canProceedToNextStep();
}

function updateFinalCheck() {
  const roomsCount = state.floors.reduce((sum, floor) => sum + floor.rooms.length, 0);
  finalCheck.innerHTML = `
  <div><strong>Projekt:</strong><br>${summaryProjectType.textContent}${state.projectType === 'neubau' ? ' / ' + summaryBrand.textContent : ''}</div><br>

  <div><strong>Wärmeerzeuger:</strong><br>${summaryHeatSource.textContent}</div><br>

  <div><strong>PLZ:</strong><br>${summaryPlz.textContent}</div><br>

  <div><strong>System:</strong><br>${getRadioValue('system')}, ${getRadioValue('wlg')}, ${getRadioValue('insulationThickness')}</div><br>

  <div><strong>Rohr:</strong><br>${getRadioValue('pipeType')} / ${getRadioValue('pipeSize')}</div><br>

  <div><strong>Thermostat:</strong><br>${state.thermostat}</div><br>

  <div><strong>Verteilertechnik:</strong><br>${getRadioValue('connectionSet')}, ${getRadioValue('cabinetType')}, ${getRadioValue('cabinetMounting')}</div><br>

  <div><strong>Zusatzdämmung:</strong><br>${getRadioValue('extraInsulation')} / ${getRadioValue('extraInsulationWlg')} / ${getRadioValue('extraInsulationThickness')}</div><br>

  <div><strong>Etagen / Räume:</strong><br>${state.floors.length} / ${roomsCount}</div>
`;
}

document.querySelectorAll('#projectTypeChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.projectType = card.dataset.type;
    renderProjectType();
    updateSummary();
  });
});

document.querySelectorAll('#brandChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.brand = card.dataset.brand;
    renderBrand();
    updateSummary();
  });
});

document.querySelectorAll('#heatSourceChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.heatSource = card.dataset.heatSource;
    renderHeatSource();
    updateSummary();
  });
});

document.querySelectorAll('#thermostatChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.thermostat = card.dataset.thermostat;
    renderThermostat();
    updateSummary();
  });
});

document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener('change', updateSummary);
});

document.getElementById('plz').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
  updateSummary();
});

document.querySelectorAll('.step-item').forEach((item) => {
  item.addEventListener('click', () => showStep(Number(item.dataset.step)));
});

prevBtn.addEventListener('click', () => showStep(state.currentStep - 1));
nextBtn.addEventListener('click', () => {
  if (!canProceedToNextStep()) return;
  showStep(state.currentStep + 1);
});

document.getElementById('addFloorBtn').addEventListener('click', () => {
  state.floors.push(createFloor());
  renderFloors();
  updateSummary();
});

document.getElementById('startCalculationBtn').addEventListener('click', () => {
  alert('Die Berechnungslogik wird im nächsten Schritt ergänzt.');
});

state.floors = [createFloor()];
renderProjectType();
renderBrand();
renderHeatSource();
renderThermostat();
renderFloors();
updateSummary();
showStep(0);