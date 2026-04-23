const state = {
  currentStep: 0,
  projectType: '',
  brand: 'handelsmarke',
  heatSource: '',
  thermostat: 'Analog',
  extraInsulationEnabled: 'ja',
  distributionMode: 'auto',
  floors: [],
  maxUnlockedStep: 0,
  services: []
};

const totalSteps = 11;
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
const summaryCabinetMounting = document.getElementById('summaryCabinetMounting');
const summaryDistributionMode = document.getElementById('summaryDistributionMode');
const summaryRegulationVoltage = document.getElementById('summaryRegulationVoltage');
const summaryDistributionItems = document.getElementById('summaryDistributionItems');
const summaryRegulationItems = document.getElementById('summaryRegulationItems');
const finalCheck = document.getElementById('finalCheck');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const serviceCheckboxes = document.querySelectorAll('input[name="service"]');
const extraInsulationOptions = document.getElementById('extraInsulationOptions');
const distributionManualFields = document.getElementById('distributionManualFields');
const distributionTypeFields = document.querySelectorAll('.distribution-type');
const distributionQtyFields = document.querySelectorAll('.distribution-qty');
const regulationCheckboxes = document.querySelectorAll('.regulation-checkbox');
const regulationQtyFields = document.querySelectorAll('.regulation-qty');
const thermostatOptions = document.getElementById('thermostatOptions');
const summaryEstrichRange = document.getElementById('summaryEstrichRange');
const summaryEstrichAdditives = document.getElementById('summaryEstrichAdditives');
const summaryDryConstruction = document.getElementById('summaryDryConstruction');
const estrichRangeCheckboxes = document.querySelectorAll('input[name="estrichRange"]');
const estrichAdditiveCheckboxes = document.querySelectorAll('input[name="estrichAdditive"]');
const dryConstructionCheckboxes = document.querySelectorAll('input[name="dryConstruction"]');
const millingSystemCheckboxes = document.querySelectorAll('input[name="millingSystem"]');
const millingSetupCheckbox = document.getElementById('millingSetupCheckbox');
const floorSurchargeCheckbox = document.getElementById('floorSurchargeCheckbox');
const millingBlock = document.getElementById('millingBlock');
const estrichBlock = document.getElementById('estrichBlock');
const dryConstructionBlock = document.getElementById('dryConstructionBlock');
const wlgBlock = document.getElementById('wlgBlock');
const insulationThicknessBlock = document.getElementById('insulationThicknessBlock');
const pipeTypeBlock = document.getElementById('pipeTypeBlock');
const pipeSizeBlock = document.getElementById('pipeSizeBlock');
const systemBlock = document.getElementById('systemBlock');
const systemSanierungBlock = document.getElementById('systemSanierungBlock');


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
  const allowedStep = Math.max(0, Math.min(state.maxUnlockedStep, totalSteps - 1));
  state.currentStep = Math.max(0, Math.min(step, allowedStep));

  document.querySelectorAll('.step-item').forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle('active', itemStep === state.currentStep);
    item.classList.toggle('clickable', itemStep <= state.maxUnlockedStep);
    item.classList.toggle('locked', itemStep > state.maxUnlockedStep);
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
    return true;
  }
  if (state.currentStep === 1) {
    return state.projectType !== '';
  }
  if (state.currentStep === 2) {
    return state.heatSource !== '';
  }
  if (state.currentStep === 3) {
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

  renderSystemBlocksByProjectType();
}

function renderSystemBlocksByProjectType() {
  const isNeubau = state.projectType === 'neubau';
  const isSanierung = state.projectType === 'sanierung';

  // System Neubau
  systemBlock.classList.toggle('hidden', !isNeubau);

  // System Sanierung
  systemSanierungBlock.classList.toggle('hidden', !isSanierung);

  // Fräsen
  millingBlock.classList.toggle('hidden', isNeubau);

  // Immer sichtbar
  estrichBlock.classList.remove('hidden');
  dryConstructionBlock.classList.remove('hidden');

  // Nur Neubau
  wlgBlock.classList.toggle('hidden', isSanierung);
  insulationThicknessBlock.classList.toggle('hidden', isSanierung);
  pipeTypeBlock.classList.toggle('hidden', isSanierung);
  pipeSizeBlock.classList.toggle('hidden', isSanierung);

  // Automatisch System setzen bei Sanierung
  if (isSanierung) {
    state.system = 'Klett 3mm';
  }
}

function renderBrand() {
  document.querySelectorAll('#brandChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.brand === state.brand);
  });
  summaryBrand.textContent = state.brand === 'uponor' ? 'Uponor' : state.brand === 'roth' ? 'Roth' : 'Handelsmarke';
}

function renderHeatSource() {
  document.querySelectorAll('#heatSourceChoices .choice-card').forEach((card) => {
    const isNone = card.dataset.heatSource === 'Keine Angabe';
    const disableOtherCards = state.heatSource === 'Keine Angabe' && !isNone;

    card.classList.toggle('active', card.dataset.heatSource === state.heatSource);
    card.classList.toggle('disabled-card', disableOtherCards);
  });

  summaryHeatSource.textContent = state.heatSource || 'Noch nicht gewählt';
}

function renderThermostat() {
  document.querySelectorAll('#thermostatChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.thermostat === state.thermostat);
  });
  document.getElementById('summaryThermostat').textContent = state.thermostat;
}

function renderThermostatToggle() {
  document.querySelectorAll('#thermostatToggleChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.thermostatToggle === state.thermostatEnabled);
  });

  const disabled = state.thermostatEnabled === 'nein';
  thermostatOptions.classList.toggle('disabled-block', disabled);

  if (disabled) {
    thermostatOptions.querySelectorAll('.choice-card').forEach((card) => {
      card.classList.remove('active');
    });
    document.getElementById('summaryThermostat').textContent = 'Kein Thermostat';
  } else {
    renderThermostat();
  }
}

function renderExtraInsulationToggle() {
  document.querySelectorAll('#extraInsulationToggleChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.extraInsulationToggle === state.extraInsulationEnabled);
  });

  const disabled = state.extraInsulationEnabled === 'nein';
  extraInsulationOptions.classList.toggle('disabled-block', disabled);

  extraInsulationOptions.querySelectorAll('input').forEach((input) => {
    input.disabled = disabled;
  });

  if (disabled) {
    document.getElementById('summaryExtraInsulation').textContent = 'Keine';
    document.getElementById('summaryExtraInsulationWlg').textContent = '-';
    document.getElementById('summaryExtraInsulationThickness').textContent = '-';
  } else {
    if (state.extraInsulationEnabled === 'nein') {
      document.getElementById('summaryExtraInsulation').textContent = 'Keine';
      document.getElementById('summaryExtraInsulationWlg').textContent = '-';
      document.getElementById('summaryExtraInsulationThickness').textContent = '-';
    } else {
      document.getElementById('summaryExtraInsulation').textContent = getRadioValue('extraInsulation');
      document.getElementById('summaryExtraInsulationWlg').textContent = getRadioValue('extraInsulationWlg');
      document.getElementById('summaryExtraInsulationThickness').textContent = getRadioValue('extraInsulationThickness');
    }
  }
}

function renderDistributionMode() {
  document.querySelectorAll('#distributionModeChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.distributionMode === state.distributionMode);
  });

  const disabled = state.distributionMode === 'auto';
  distributionManualFields.classList.toggle('disabled-block', disabled);

  distributionTypeFields.forEach((field) => {
    field.disabled = disabled;
  });

  distributionQtyFields.forEach((field) => {
    field.disabled = disabled;
  });
}

function getManualDistributionEntries() {
  const entries = [];

  distributionTypeFields.forEach((typeField, index) => {
    const qtyField = distributionQtyFields[index];
    const typeValue = typeField.value.trim();
    const qtyValue = qtyField.value.trim();

    if (typeValue && qtyValue && Number(qtyValue) > 0) {
      entries.push(`${typeValue} x ${qtyValue}`);
    }
  });

  return entries;
}

function getRegulationEntries() {
  const entries = [];

  regulationCheckboxes.forEach((checkbox, index) => {
    const qtyField = regulationQtyFields[index];
    const qtyValue = qtyField.value.trim();

    if (checkbox.checked) {
      const qtyText = qtyValue && Number(qtyValue) > 0 ? ` x ${qtyValue}` : '';
      entries.push(`${checkbox.dataset.label}${qtyText}`);
    }
  });

  return entries;
}

function getEstrichRangeEntries() {
  return Array.from(estrichRangeCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function getEstrichAdditiveEntries() {
  return Array.from(estrichAdditiveCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function getDryConstructionEntries() {
  return Array.from(dryConstructionCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function syncEstrichAdditivesRules() {
  const additiveCheckboxes = Array.from(estrichAdditiveCheckboxes);

  const exclusiveCheckboxes = additiveCheckboxes.slice(1);
  const selectedExclusive = exclusiveCheckboxes.find((checkbox) => checkbox.checked);

  exclusiveCheckboxes.forEach((checkbox) => {
    if (selectedExclusive && checkbox !== selectedExclusive) {
      checkbox.disabled = true;
      checkbox.closest('.check-option')?.classList.add('disabled-option');
    } else {
      checkbox.disabled = false;
      checkbox.closest('.check-option')?.classList.remove('disabled-option');
    }
  });
}

function syncEstrichRangeRules() {
  const rangeCheckboxes = Array.from(estrichRangeCheckboxes);
  const selected = rangeCheckboxes.find((checkbox) => checkbox.checked);

  rangeCheckboxes.forEach((checkbox) => {
    if (selected && checkbox !== selected) {
      checkbox.disabled = true;
      checkbox.closest('.check-option')?.classList.add('disabled-option');
    } else {
      checkbox.disabled = false;
      checkbox.closest('.check-option')?.classList.remove('disabled-option');
    }
  });
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

function syncMillingSystemRules() {
  const millingCheckbox = Array.from(millingSystemCheckboxes)
    .find(cb => cb.value === 'Fräsen');

  // Regel 1: Fräsen → Baustelleneinrichtung Pflicht
  if (millingCheckbox && millingCheckbox.checked) {
    millingSetupCheckbox.checked = true;
    millingSetupCheckbox.disabled = true;
  } else {
    millingSetupCheckbox.disabled = false;
  }

  // Regel 2: mehr als 1 Etage → Etagenzuschuss Pflicht
  if (state.floors.length > 1) {
    floorSurchargeCheckbox.checked = true;
    floorSurchargeCheckbox.disabled = true;
  } else {
    floorSurchargeCheckbox.disabled = false;
  }
}

function updateLayerPreview() {
  const extraInsulationText =
    state.extraInsulationEnabled === 'nein'
      ? 'keine'
      : getRadioValue('extraInsulationThickness');

  const layers = [
    ['B: Systemdämmung', getRadioValue('insulationThickness')],
    ['C: Zusatzdämmung', extraInsulationText]
  ];

  document.getElementById('layerList').innerHTML = layers
    .map(([label, value]) => `<div class="layer-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}

function updateSummary() {
  summaryPlz.textContent = document.getElementById('plz').value.trim() || 'PLZ offen';
  document.getElementById('summarySystem').textContent =
    state.projectType === 'sanierung'
      ? 'Klett 3mm'
      : getRadioValue('system');
  document.getElementById('summaryWlg').textContent = wlgBlock.classList.contains('hidden') ? '-' : getRadioValue('wlg');
  document.getElementById('summaryInsulationThickness').textContent = insulationThicknessBlock.classList.contains('hidden') ? '-' : getRadioValue('insulationThickness');
  document.getElementById('summaryPipeType').textContent = pipeTypeBlock.classList.contains('hidden') ? '-' : getRadioValue('pipeType');
  document.getElementById('summaryPipeSize').textContent = pipeSizeBlock.classList.contains('hidden') ? '-' : getRadioValue('pipeSize');
  summaryCabinetMounting.textContent = getRadioValue('cabinetMounting');
  summaryDistributionMode.textContent =
    state.distributionMode === 'auto' ? 'Automatische Ermittlung' : 'Manuelle Eingabe';
  summaryRegulationVoltage.textContent = getRadioValue('regulationVoltage');

  const manualDistributionEntries = getManualDistributionEntries();
  summaryDistributionItems.textContent =
    state.distributionMode === 'auto'
      ? 'Verteiler werden automatisch ermittelt.'
      : (manualDistributionEntries.length
        ? manualDistributionEntries.join(', ')
        : 'Keine manuelle Verteilerauswahl erfasst.');

  const regulationEntries = getRegulationEntries();
  summaryRegulationItems.textContent =
    regulationEntries.length
      ? regulationEntries.join(', ')
      : 'Keine Regeltechnik ausgewählt.';
  document.getElementById('summaryExtraInsulation').textContent = getRadioValue('extraInsulation');
  document.getElementById('summaryExtraInsulationWlg').textContent = getRadioValue('extraInsulationWlg');
  document.getElementById('summaryExtraInsulationThickness').textContent = getRadioValue('extraInsulationThickness');

  const estrichRangeEntries = getEstrichRangeEntries();
  summaryEstrichRange.textContent =
    estrichRangeEntries.length
      ? `Estrich: ${estrichRangeEntries.join(', ')}`
      : 'Kein Estrich gewählt.';

  const estrichAdditiveEntries = getEstrichAdditiveEntries();
  summaryEstrichAdditives.textContent =
    estrichAdditiveEntries.length
      ? `Zusatzmittel: ${estrichAdditiveEntries.join(', ')}`
      : 'Keine Zusatzmittel gewählt.';

  const dryConstructionEntries = getDryConstructionEntries();
  summaryDryConstruction.textContent =
    dryConstructionEntries.length
      ? `Trockenbau: ${dryConstructionEntries.join(', ')}`
      : 'Kein Trockenbau gewählt.';

  syncEstrichRangeRules();
  syncEstrichAdditivesRules();
  syncMillingSystemRules();

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

  state.services = Array.from(serviceCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  updateLayerPreview();
  updateFinalCheck();
  nextBtn.disabled = !canProceedToNextStep();
}

function updateFinalCheck() {
  const roomsCount = state.floors.reduce((sum, floor) => sum + floor.rooms.length, 0);
  const servicesText = state.services.length ? state.services.join(', ') : 'Keine zusätzlichen Dienstleistungen gewählt';
  const manualDistributionEntries = getManualDistributionEntries();
  const regulationEntries = getRegulationEntries();
  const estrichRangeEntries = getEstrichRangeEntries();
  const estrichAdditiveEntries = getEstrichAdditiveEntries();
  const dryConstructionEntries = getDryConstructionEntries();

  finalCheck.innerHTML = `
    <div><strong>Projekt:</strong> ${summaryProjectType.textContent}${state.projectType === 'neubau' ? ' / ' + summaryBrand.textContent : ''}</div>
    <div><strong>Wärmeerzeuger:</strong> ${summaryHeatSource.textContent}</div>
    <div><strong>PLZ:</strong> ${summaryPlz.textContent}</div>
    <div><strong>System:</strong> ${getRadioValue('system')}, ${getRadioValue('wlg')}, ${getRadioValue('insulationThickness')}</div>
    <div><strong>Rohr:</strong> ${getRadioValue('pipeType')} / ${getRadioValue('pipeSize')}</div>
    <div><strong>Estrich:</strong> ${estrichRangeEntries.length ? estrichRangeEntries.join(', ') : 'Keine Auswahl'}</div>
<div><strong>Zusatzmittel:</strong> ${estrichAdditiveEntries.length ? estrichAdditiveEntries.join(', ') : 'Keine Auswahl'}</div>
<div><strong>Trockenbau:</strong> ${dryConstructionEntries.length ? dryConstructionEntries.join(', ') : 'Keine Auswahl'}</div>
    <div><strong>Thermostat:</strong> ${state.thermostatEnabled === 'nein' ? 'Kein Thermostat' : state.thermostat}</div>
    <div><strong>Verteilerschrank-Art:</strong> ${getRadioValue('cabinetMounting')}</div>
<div><strong>Verteiler Menge & Typ:</strong> ${state.distributionMode === 'auto' ? 'Automatische Ermittlung' : (manualDistributionEntries.length ? manualDistributionEntries.join(', ') : 'Keine manuelle Eingabe')}</div>
<div><strong>Regeltechnik:</strong> ${getRadioValue('regulationVoltage')} / ${regulationEntries.length ? regulationEntries.join(', ') : 'Keine Zusatzkomponenten'}</div>
    <div><strong>Zusatzdämmung:</strong> ${state.extraInsulationEnabled === 'nein' ? 'Keine' : `${getRadioValue('extraInsulation')} / ${getRadioValue('extraInsulationWlg')} / ${getRadioValue('extraInsulationThickness')}`}</div>
    <div><strong>Etagen / Räume:</strong> ${state.floors.length} / ${roomsCount}</div>
    <div><strong>Dienstleistungen:</strong> ${servicesText}</div>
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
    const selectedValue = card.dataset.heatSource;

    if (selectedValue === 'Keine Angabe' && state.heatSource === 'Keine Angabe') {
      state.heatSource = '';
    } else if (card.classList.contains('disabled-card')) {
      return;
    } else {
      state.heatSource = selectedValue;
    }

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

document.querySelectorAll('#thermostatToggleChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.thermostatEnabled = card.dataset.thermostatToggle;
    renderThermostatToggle();
    updateSummary();
  });
});

document.querySelectorAll('#extraInsulationToggleChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.extraInsulationEnabled = card.dataset.extraInsulationToggle;
    renderExtraInsulationToggle();
    updateSummary();
  });
});

document.querySelectorAll('#distributionModeChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.distributionMode = card.dataset.distributionMode;
    renderDistributionMode();
    updateSummary();
  });
});

document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener('change', updateSummary);
});

distributionTypeFields.forEach((field) => {
  field.addEventListener('change', updateSummary);
});

distributionQtyFields.forEach((field) => {
  field.addEventListener('input', updateSummary);
});

regulationCheckboxes.forEach((field) => {
  field.addEventListener('change', updateSummary);
});

regulationQtyFields.forEach((field) => {
  field.addEventListener('input', updateSummary);
});

estrichRangeCheckboxes.forEach((field) => {
  field.addEventListener('change', () => {
    syncEstrichRangeRules();
    updateSummary();
  });
});

estrichAdditiveCheckboxes.forEach((field) => {
  field.addEventListener('change', () => {
    syncEstrichAdditivesRules();
    updateSummary();
  });
});

dryConstructionCheckboxes.forEach((field) => {
  field.addEventListener('change', updateSummary);
});

millingSystemCheckboxes.forEach((field) => {
  field.addEventListener('change', updateSummary);
});

serviceCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', updateSummary);
});

document.getElementById('plz').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
  updateSummary();
});

document.querySelectorAll('.step-item').forEach((item) => {
  item.addEventListener('click', () => {
    const targetStep = Number(item.dataset.step);
    if (targetStep <= state.maxUnlockedStep) {
      showStep(targetStep);
    }
  });
});

prevBtn.addEventListener('click', () => showStep(state.currentStep - 1));

nextBtn.addEventListener('click', () => {
  if (!canProceedToNextStep()) return;

  const nextStep = state.currentStep + 1;
  if (nextStep > state.maxUnlockedStep) {
    state.maxUnlockedStep = nextStep;
  }

  showStep(nextStep);
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
renderSystemBlocksByProjectType();
renderBrand();
renderHeatSource();
renderThermostat();
renderThermostatToggle();
renderExtraInsulationToggle();
renderDistributionMode();
renderFloors();
syncEstrichAdditivesRules();
syncEstrichRangeRules();
updateSummary();
showStep(0);