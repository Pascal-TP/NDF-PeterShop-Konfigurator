const state = {
  currentStep: 0,
  projectType: '',
  brand: '',
  heatSource: '',
  thermostat: '',
  thermostatEnabled: '',
  extraInsulationEnabled: '',
  distributionMode: '',
  distributionEnabled: '',
  floors: [],
  maxUnlockedStep: 0,
  services: [],
  calculatedProducts: [],
  articleCatalog: [],
  selectedSystemFloorIndex: 0,
  isLocked: false
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
const pipeSizeBlock = document.getElementById('pipeSizeBlock') || { classList: { contains: () => true, toggle: () => { } } };
const systemBlock = document.getElementById('systemBlock');
const systemSanierungBlock = document.getElementById('systemSanierungBlock');
const systemOptionFlipfix = document.getElementById('systemOptionFlipfix');
const systemOptionPipeOnly = document.getElementById('systemOptionPipeOnly');
const systemInfoTacker = document.getElementById('systemInfoTacker');
const systemInfoNoppe = document.getElementById('systemInfoNoppe');
const systemInfoKlett = document.getElementById('systemInfoKlett');
const systemInfoKlett3mm = document.getElementById('systemInfoKlett3mm');
const mainLayout = document.getElementById('mainLayout');
const resultPanel = document.getElementById('resultPanel');
const resultTableBody = document.getElementById('resultTableBody');
const resultTotalNet = document.getElementById('resultTotalNet');
const savePdfBtn = document.getElementById('savePdfBtn');
const backToConfigBtn = document.getElementById('backToConfigBtn');
const printResultBtn = document.getElementById('printResultBtn');
const handoverShopBtn = document.getElementById('handoverShopBtn');
const distributionToggleChoices = document.getElementById('distributionToggleChoices');
const distributionOptions = document.getElementById('distributionOptions');
const systemFloorSelect = document.getElementById('systemFloorSelect');
const assignFloorSystemBtn = document.getElementById('assignFloorSystemBtn');

const appModal = document.getElementById('appModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalOkBtn = document.getElementById('modalOkBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');

const shopToken = new URLSearchParams(window.location.search).get('token');
const tokenStorageKey = shopToken ? `petershop-konfigurator-token-used-${shopToken}` : '';

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // optional: 'auto' wenn du kein weiches Scrollen willst
  });
}

function getCheckedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function getDisplayValue(name) {
  return getCheckedValue(name) || 'Keine Auswahl';
}

function setupSingleChoiceCheckboxGroup(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        document.querySelectorAll(`input[name="${name}"]`).forEach((otherCheckbox) => {
          if (otherCheckbox !== checkbox) {
            otherCheckbox.checked = false;
          }
        });
      }

      if (name === 'system') syncSystemOptionsByBrand();
      updateSummary();
    });
  });
}

function getSystemValue() {
  const selector =
    state.projectType === 'sanierung'
      ? '#systemSanierungBlock input[name="system"]:checked'
      : '#systemBlock input[name="system"]:checked';

  const checked = document.querySelector(selector);
  return checked ? checked.value : '';
}

function getFloorLabel(floor, index) {
  return floor.name || `Etage ${index + 1}`;
}

function floorHasHeatedRooms(floor) {
  return floor.rooms.some((room) => room.function === 'Wohnraum' || room.function === 'Bad');
}

function getCurrentSystemSelection() {
  return {
    system: getSystemValue(),
    wlg: getCheckedValue('wlg'),
    insulationThickness: getCheckedValue('insulationThickness'),
    pipeType: getCheckedValue('pipeType')
  };
}

function clearSystemSelection() {
  document.querySelectorAll('input[name="system"], input[name="wlg"], input[name="insulationThickness"], input[name="pipeType"]').forEach((input) => {
    input.checked = false;
  });
}

function setSystemSelection(selection) {
  clearSystemSelection();

  if (!selection) return;

  Object.entries({
    system: selection.system,
    wlg: selection.wlg,
    insulationThickness: selection.insulationThickness,
    pipeType: selection.pipeType
  }).forEach(([name, value]) => {
    if (!value) return;
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input && !input.disabled) {
      input.checked = true;
    }
  });
}

function renderSystemFloorSelect() {
  if (!systemFloorSelect) return;

  systemFloorSelect.innerHTML = state.floors.map((floor, index) => {
    const label = getFloorLabel(floor, index);
    const exemptText = floorHasHeatedRooms(floor) ? '' : ' (nur unbeheizt)';
    return `<option value="${index}">${label}${exemptText}</option>`;
  }).join('');

  if (state.selectedSystemFloorIndex >= state.floors.length) {
    state.selectedSystemFloorIndex = 0;
  }

  systemFloorSelect.value = String(state.selectedSystemFloorIndex);

  const selectedFloor = state.floors[state.selectedSystemFloorIndex];
  setSystemSelection(selectedFloor?.systemAssignment || null);

  updateAssignFloorSystemButton();
}

function currentSystemSelectionIsComplete() {
  const selection = getCurrentSystemSelection();

  if (state.projectType === 'sanierung') {
    return selection.system !== '';
  }

  return (
    selection.system !== '' &&
    selection.wlg !== '' &&
    selection.insulationThickness !== '' &&
    selection.pipeType !== ''
  );
}

function allHeatedFloorsHaveSystemAssignment() {
  return state.floors.every((floor) => {
    if (!floorHasHeatedRooms(floor)) return true;
    return !!floor.systemAssignment;
  });
}

function updateAssignFloorSystemButton() {
  if (!assignFloorSystemBtn) return;

  const floor = state.floors[state.selectedSystemFloorIndex];

  if (!floor || !floorHasHeatedRooms(floor)) {
    assignFloorSystemBtn.disabled = true;
    assignFloorSystemBtn.textContent = 'Etage benötigt kein System';
    return;
  }

  assignFloorSystemBtn.disabled = !currentSystemSelectionIsComplete();
  assignFloorSystemBtn.textContent = floor.systemAssignment
    ? 'System der Etage aktualisieren'
    : 'System der Etage zuweisen';
}

async function assignSystemToSelectedFloor() {
  const floor = state.floors[state.selectedSystemFloorIndex];

  if (!floor) return;

  if (!floorHasHeatedRooms(floor)) {
    await showAppModal({
      title: 'Hinweis',
      message: 'Diese Etage enthält nur unbeheizte Räume und benötigt keine Systemzuweisung.',
      confirmText: 'OK'
    });
    return;
  }

  if (!currentSystemSelectionIsComplete()) {
    await showAppModal({
      title: 'Auswahl unvollständig',
      message: 'Bitte wählen Sie zuerst alle notwendigen Systemangaben für diese Etage aus.',
      confirmText: 'OK'
    });
    return;
  }

  floor.systemAssignment = getCurrentSystemSelection();

  await showAppModal({
    title: 'Gespeichert',
    message: `Das System wurde der Etage "${getFloorLabel(floor, state.selectedSystemFloorIndex)}" zugewiesen.`,
    confirmText: 'OK'
  });

  updateAssignFloorSystemButton();
  updateSummary();
}

function showAppModal({ title = 'Hinweis', message = '', confirmText = 'OK', cancelText = null }) {
  return new Promise((resolve) => {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalOkBtn.textContent = confirmText;

    if (cancelText) {
      modalCancelBtn.textContent = cancelText;
      modalCancelBtn.classList.remove('hidden');
    } else {
      modalCancelBtn.classList.add('hidden');
    }

    appModal.classList.remove('hidden');

    const cleanup = (result) => {
      appModal.classList.add('hidden');
      modalOkBtn.onclick = null;
      modalCancelBtn.onclick = null;
      resolve(result);
    };

    modalOkBtn.onclick = () => cleanup(true);
    modalCancelBtn.onclick = () => cleanup(false);
  });
}

function createFloor() {
  return {
    name: '',
    systemAssignment: null,
    rooms: [createRoom()]
  };
}

function createRoom() {
  return {
    name: '',
    function: 'Wohnraum',
    spacing: 'VA 150',
    area: ''
  };
}

function resetFromProjectTypeForward() {
  state.heatSource = '';
  state.thermostat = '';
  state.thermostatEnabled = '';
  state.extraInsulationEnabled = '';
  state.distributionMode = '';
  state.services = [];
  state.floors = [createFloor()];
  state.maxUnlockedStep = 1;
  state.distributionEnabled = '';

  document.querySelectorAll('input').forEach((input) => {
    if (input.type === 'checkbox') input.checked = false;
    if (input.type === 'number' || input.type === 'text') input.value = '';
  });

  document.querySelectorAll('select').forEach((select) => {
    select.selectedIndex = 0;
  });

  renderHeatSource();
  renderThermostat();
  renderThermostatToggle();
  renderExtraInsulationToggle();
  renderDistributionMode();
  renderFloors();
  updateSummary();
}

async function confirmReturnToProjectType(targetStep) {
  if (targetStep === 1 && state.currentStep > 1) {
    return await showAppModal({
      title: 'Hinweis',
      message: 'Die Rückkehr zu diesem Schritt bewirkt ein Zurücksetzen sämtlicher Eingaben.',
      confirmText: 'Weiter',
      cancelText: 'Abbrechen'
    });
  }

  return true;
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

  const isSystemStep = state.currentStep === 5;
  assignFloorSystemBtn.classList.toggle('hidden', !isSystemStep);

  if (isSystemStep) {
    renderSystemFloorSelect();
  }

  scrollToTop();
}

function canProceedToNextStep() {
  if (state.currentStep === 0) {
    return true;
  }
  if (state.currentStep === 1) {
    if (state.projectType === 'neubau') {
      return state.brand !== '';
    }
    return state.projectType !== '';
  }
  if (state.currentStep === 2) {
    return state.heatSource !== '';
  }
  if (state.currentStep === 3) {
    return /^\d{5}$/.test(document.getElementById('plz').value.trim());
  }
  if (state.currentStep === 5) {
    return allHeatedFloorsHaveSystemAssignment();
  }

  if (state.currentStep === 6) {
    if (state.thermostatEnabled === 'nein') {
      return true;
    }

    if (state.thermostatEnabled === 'ja') {
      return state.thermostat !== '';
    }

    return false;
  }

  if (state.currentStep === 7) {
    return state.distributionEnabled !== '';
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
  summaryBrand.textContent =
    state.brand === 'uponor' ? 'Uponor' :
      state.brand === 'roth' ? 'Roth' :
        state.brand === 'handelsmarke' ? 'Handelsmarke' :
          'Keine Auswahl';

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

}

function renderBrand() {
  document.querySelectorAll('#brandChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.brand === state.brand);
  });

  summaryBrand.textContent =
    state.brand === 'uponor' ? 'Uponor' :
      state.brand === 'roth' ? 'Roth' :
        'Handelsmarke';

  syncSystemOptionsByBrand();
  updateSystemInfoTextsByBrand();
}

function syncSystemOptionsByBrand() {
  const neubauSystemCheckboxes = document.querySelectorAll('#systemBlock input[name="system"]');
  const sanierungSystemCheckbox = document.querySelector('#systemSanierungBlock input[name="system"]');

  const selectedSystem = getSystemValue();

  neubauSystemCheckboxes.forEach((checkbox) => {
    const optionLabel = checkbox.closest('.radio-option');

    let isAllowed = true;
    let isHidden = false;

    // Grundregel: Noppe erstmal bei allen Herstellern gesperrt
    if (checkbox.value === 'Noppe') {
      isAllowed = false;
    }

    // Handelsmarke und Roth: Klett gesperrt
    if ((state.brand === 'handelsmarke' || state.brand === 'roth') && checkbox.value === 'Klett') {
      isAllowed = false;
    }

    // Uponor: Flipfix ausblenden
    if (
      state.brand === 'uponor' &&
      checkbox.value === 'Systemplatte Flipfix (2mm Hohlkammer-Platte)'
    ) {
      isHidden = true;
      isAllowed = false;
    }

    // Wenn Tacker gewählt wurde: Klett und Noppe sperren
    if (selectedSystem === 'Tacker' && (checkbox.value === 'Klett' || checkbox.value === 'Noppe')) {
      isAllowed = false;
    }

    // Wenn Flipfix gewählt wurde: Klett sperren
    if (
      selectedSystem === 'Systemplatte Flipfix (2mm Hohlkammer-Platte)' &&
      checkbox.value === 'Klett'
    ) {
      isAllowed = false;
    }

    optionLabel?.classList.toggle('hidden', isHidden);
    checkbox.disabled = !isAllowed;
    optionLabel?.classList.toggle('disabled-radio-option', !isAllowed);

    if (!isAllowed || isHidden) {
      checkbox.checked = false;
    }
  });

  // Sanierungs-System bleibt unabhängig davon aktiv
  if (sanierungSystemCheckbox) {
    const sanierungLabel = sanierungSystemCheckbox.closest('.radio-option');
    sanierungSystemCheckbox.disabled = false;
    sanierungLabel?.classList.remove('disabled-radio-option');
  }
}

function updateSystemInfoTextsByBrand() {
  const texts = {
    handelsmarke: {
      Tacker: `...als Tackersystem liefern und montieren...
- Tackerplatte (diverse Wärmeleitgruppen)
- Heizrohr PE-RT 17x2 mm
- Tackernadeln für Heizrohr 14-17 mm
- PE-Randdämmstreifen 10/150 | Comfort - selbstklebend | mit Folienlasche | 50 lfm
- Klebeband extrem reißfest | 50 mm breit | Rolle = 66 m
- Klemmverschraubung 16/17x2,0 mm - einzeln
- Rohrverbinder (Kupplung) 16x16/17x17 mm, mit zwei gleichen Presshülsen
- Winkelspangen, Kunststoff schwarz, Rohrführung zum Umlenken der Heizrohre im Verteilerbereich, für Rohre 14-18 mm
- Dehnfugenschutzrohr zum Isolieren der Vor-/Rückläufe
- Dehnfugenschutzrohr geschlitzt für Rohr bis 20 mm im Bereich der Dehnfugen | ca. 300 mm lang
- Estrichnessstellenmarkierung
- nicht enthalten: Montage der Verteiler, Schränke, Klemmleisten, Stellantriebe, Raumthermostate
- Baustelleneinrichtung, Müllentsorgung, Bauleitung, Heizflächenauslegung und Abdrücken der Fußbodenheizung mit Luft sind im Preis enthalten`,
      Noppe: 'zurzeit nicht verfügbar',
      Klett: 'zurzeit nicht verfügbar'
    },
    uponor: {
      Tacker: `...als Tackersystem liefern und montieren...
- Uponor Tackerrolle (diverse Wärmeleitgruppen)
- Uponor ComfortPipe Rohr PE-Xa 16x1,8 mm
- Tackernadeln für Heizrohr 14-17 mm | Hausmarke
- PE-Randdämmstreifen 10/150 | Comfort - selbstklebend | mit Folienlasche | 50 lfm | Hausmarke
- Klebeband extrem reißfest | 50 mm breit | Rolle = 66 m | Hausmarke
- Klemmverschraubung 16x2,0 mm 3/4” PEX- einzeln | Uponor
- Rohrverbinder (Kupplung m.Ringen) 16x16 mm | Uponor
- Winkelspangen, Kunststoff schwarz, Rohrführung zum Umlenken der Heizrohre im Verteilerbereich, für Rohre 14-18 mm
- Dehnfugenschutzrohr zum Isolieren der Vor-/Rückläufe
- Dehnfugenschutzrohr geschlitzt für Rohr bis 20 mm im Bereich der Dehnfugen | ca. 300 mm lang | Hausmarke
- Estrichmessstellenmarkierung | Hausmarke
- Montageleistung Tacker-Systemrohr (nicht enthalten: Montage der Verteiler, Schränke, Klemmleisten, Stellantriebe, Raumthermostate
- Baustelleneinrichtung, Müllentsorgung, Bauleitung, Heizflächenauslegung und Abdrücken der Fußbodenheizung mit Luft sind im Preis enthalten`,
      Noppe: 'zurzeit nicht verfügbar',
      Klett: `...als Klettsystem liefern und montieren...
- Uponor Verbundrolle EPS DES WLG 040 30-2 mm
- Uponor ComfortPipe Plus PE-Xa 16x2 mm
- PE-Randdämmstreifen 10/150 | Comfort - selbstklebend | mit Folienlasche | 50 lfm | Hausmarke
- Klebeband extrem reißfest | 50 mm breit | Rolle = 66 m | Hausmarke
- Klemmverschraubung 16x2,0 mm 3/4” PEX- einzeln | Uponor
- Rohrverbinder (Kupplung m.Ringen) 16x16 mm | Uponor
- Winkelspangen, Kunststoff schwarz, Rohrführung zum Umlenken der
- Klettvlies zum Isolieren der Vor-/Rückläufe
- Dehnfugenschutzrohr geschlitzt für Rohr bis 20 mm im Bereich der Dehnfugen | ca. 300 mm lang | Hausmarke
- Estrichmessstellenmarkierung | Hausmarke
- Montageleistung Klett-Systemrohr (nicht enthalten: Montage der Verteiler, Schränke, Klemmleisten, Stellantriebe, Raumthermostate
- Baustelleneinrichtung, Müllentsorgung, Bauleitung, Heizflächenauslegung und Abdrücken der Fußbodenheizung mit Luft sind im Preis enthalten`
    },
    roth: {
      Tacker: `als Tackersystem liefern und montieren
- Roth System-Verbundfaltplatte (diverse Wärmeleitgruppen)
- Roth Heizrohr PERTEX S5 17 mm
- Tackernadeln für Heizrohr 14-17 mm | Hausmarke
- concept | Roth-Randdämmstreifen 10/160 | selbstklebend | 25 m / Rolle (4 Rollen /Sack)
- Klebeband extrem reißfest | 50 mm breit | Rolle = 66 m | Hausmarke
- Klemmverschraubung Universal 17 mm | Roth
- Kupplung PressCheck 17 mm
- Winkelspangen, Kunststoff schwarz, Rohrführung zum Umlenken der Heizrohre im Verteilerbereich, für Rohre 14-18 mm
- Dehnfugenschutzrohr zum Isolieren der Vor-/Rückläufe
- Dehnfugenschutzrohr geschlitzt für Rohr bis 20 mm im Bereich der Dehnfugen | ca. 300 mm lang | Hausmarke
- Estrichmessstellenmarkierung | Hausmarke
- Montageleistung Tacker-Systemrohr (nicht enthalten: Montage der Verteiler, Schränke, Klemmleisten, Stellantriebe, Raumthermostate
- Baustelleneinrichtung, Müllentsorgung, Bauleitung, Heizflächenauslegung und Abdrücken der Fußbodenheizung mit Luft sind im Preis enthalten`,
      Noppe: 'zurzeit nicht verfügbar',
      Klett: 'zurzeit nicht verfügbar'
    }
  };

  const brandTexts = texts[state.brand] || texts.handelsmarke;

  systemInfoTacker.textContent = brandTexts.Tacker;
  systemInfoNoppe.textContent = brandTexts.Noppe;
  systemInfoKlett.textContent = brandTexts.Klett;
  if (systemInfoKlett3mm) {
    systemInfoKlett3mm.textContent = `...als Klettsystem liefern und montieren...
- Klett-Panel 3 mm
- Klett-Heizrohr RT 17x2,0
- Estrichmessstellenmarkierung
- PE-Randdämmstreifen 10/150 | Comfort - selbstklebend | mit
- Klemmverschraubung 16/17x2,0 mm 3/4” PEX - einzeln
- Klebeband extrem reißfest | 50 mm breit | Rolle = 66 m
- Rohrverbinder (Kupplung mit Ringen)
- Winkelspangen für Heizrohre 14-18 mm | Farbe schwarz
- Dehnfugenschutzrohr geschlitzt für Rohr bis 20 mm im Bereich der Dehnfugen | ca. 300 mm lang
- Dehnfugenschutzrohr zum Isolieren der Vor-/Rückläufe
- nicht enthalten: Montage der Verteiler, Schränke, Klemmleisten, Stellantriebe, Raumthermostate
- Baustelleneinrichtung, Müllentsorgung, Bauleitung, Heizflächenauslegung und Abdrücken der Fußbodenheizung mit Luft sind im Preis enthalten`;
  }
}

function renderHeatSource() {
  document.querySelectorAll('#heatSourceChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.heatSource === state.heatSource);
    card.classList.remove('disabled-card');
  });

  summaryHeatSource.textContent = state.heatSource || 'Keine Auswahl';
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

  const disabled = state.thermostatEnabled !== 'ja';
  thermostatOptions.classList.toggle('disabled-block', disabled);

  if (disabled) {
    thermostatOptions.querySelectorAll('.choice-card').forEach((card) => {
      card.classList.remove('active');
    });
    document.getElementById('summaryThermostat').textContent =
      state.thermostatEnabled === 'nein' ? 'Kein Thermostat' : 'Keine Auswahl';
  } else {
    renderThermostat();
  }
}

function renderDistributionToggle() {
  document.querySelectorAll('#distributionToggleChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.distributionToggle === state.distributionEnabled);
  });

  const disabled = state.distributionEnabled !== 'ja';

  distributionOptions.classList.toggle('disabled-block', disabled);

  distributionOptions.querySelectorAll('input, select').forEach((el) => {
    el.disabled = disabled;
    if (disabled) {
      if (el.type === 'checkbox') el.checked = false;
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
    }
  });

  if (state.distributionEnabled === 'nein') {
    summaryDistributionMode.textContent = 'Keine';
  } else {
    summaryDistributionMode.textContent =
      state.distributionMode === 'auto'
        ? 'Automatische Ermittlung'
        : state.distributionMode === 'manual'
          ? 'Manuelle Eingabe'
          : 'Keine Auswahl';
  }
}

function renderExtraInsulationToggle() {
  document.querySelectorAll('#extraInsulationToggleChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.extraInsulationToggle === state.extraInsulationEnabled);
  });

  const disabled = state.extraInsulationEnabled !== 'ja';
  extraInsulationOptions.classList.toggle('disabled-block', disabled);

  extraInsulationOptions.querySelectorAll('input').forEach((input) => {
    input.disabled = disabled;
    if (disabled) input.checked = false;
  });

  if (state.extraInsulationEnabled === 'nein') {
    document.getElementById('summaryExtraInsulation').textContent = 'Keine';
    document.getElementById('summaryExtraInsulationWlg').textContent = '-';
    document.getElementById('summaryExtraInsulationThickness').textContent = '-';
  } else {
    document.getElementById('summaryExtraInsulation').textContent = 'Keine Auswahl';
    document.getElementById('summaryExtraInsulationWlg').textContent = 'Keine Auswahl';
    document.getElementById('summaryExtraInsulationThickness').textContent = 'Keine Auswahl';
  }
}

function renderDistributionMode() {
  document.querySelectorAll('#distributionModeChoices .choice-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.distributionMode === state.distributionMode);
  });

  const disabled = state.distributionMode !== 'manual';
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
      : getCheckedValue('extraInsulationThickness');

  const layers = [
    ['B: Systemdämmung', getCheckedValue('insulationThickness')],
    ['C: Zusatzdämmung', extraInsulationText]
  ];

  document.getElementById('layerList').innerHTML = layers
    .map(([label, value]) => `<div class="layer-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}

function updateSummary() {
  summaryPlz.textContent = document.getElementById('plz').value.trim() || 'PLZ offen';
  document.getElementById('summarySystem').textContent =
    getSystemValue() || 'Keine Auswahl';
  document.getElementById('summaryWlg').textContent = wlgBlock.classList.contains('hidden') ? '-' : (getCheckedValue('wlg') || 'Keine Auswahl');
  document.getElementById('summaryInsulationThickness').textContent = insulationThicknessBlock.classList.contains('hidden') ? '-' : (getCheckedValue('insulationThickness') || 'Keine Auswahl');
  document.getElementById('summaryPipeType').textContent = pipeTypeBlock.classList.contains('hidden') ? '-' : (getCheckedValue('pipeType') || 'Keine Auswahl');
  document.getElementById('summaryPipeSize').textContent = pipeSizeBlock.classList.contains('hidden') ? '-' : (getCheckedValue('pipeSize') || 'Keine Auswahl');

  summaryCabinetMounting.textContent = getCheckedValue('cabinetMounting') || 'Keine Auswahl';
  summaryDistributionMode.textContent =
    state.distributionMode === 'auto'
      ? 'Automatische Ermittlung'
      : state.distributionMode === 'manual'
        ? 'Manuelle Eingabe'
        : 'Keine Auswahl';

  summaryRegulationVoltage.textContent = getCheckedValue('regulationVoltage') || 'Keine Auswahl';

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
  document.getElementById('summaryExtraInsulation').textContent = getCheckedValue('extraInsulation');
  document.getElementById('summaryExtraInsulationWlg').textContent = getCheckedValue('extraInsulationWlg');
  document.getElementById('summaryExtraInsulationThickness').textContent = getCheckedValue('extraInsulationThickness');

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

  if (state.extraInsulationEnabled === 'nein') {
    document.getElementById('summaryExtraInsulation').textContent = 'Keine';
    document.getElementById('summaryExtraInsulationWlg').textContent = '-';
    document.getElementById('summaryExtraInsulationThickness').textContent = '-';
  } else {
    document.getElementById('summaryExtraInsulation').textContent = getCheckedValue('extraInsulation') || 'Keine Auswahl';
    document.getElementById('summaryExtraInsulationWlg').textContent = getCheckedValue('extraInsulationWlg') || 'Keine Auswahl';
    document.getElementById('summaryExtraInsulationThickness').textContent = getCheckedValue('extraInsulationThickness') || 'Keine Auswahl';
  }

  syncEstrichRangeRules();
  syncEstrichAdditivesRules();
  syncMillingSystemRules();
  updateAssignFloorSystemButton();

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

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ';' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseGermanNumber(value) {
  if (!value) return 0;

  return Number(
    String(value)
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '')
  ) || 0;
}

function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0);
}

function formatQuantity(value) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value || 0);
}

function getUnitFromPriceUnit(priceUnit) {
  if (!priceUnit) return '';
  return String(priceUnit).replace('€/', '').replace('EUR/', '').trim();
}

async function loadArticleCatalog() {
  const response = await fetch('master.csv');

  if (!response.ok) {
    throw new Error('master.csv konnte nicht geladen werden.');
  }

  const buffer = await response.arrayBuffer();
  const csvText = new TextDecoder('windows-1252').decode(buffer);

  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase());

  state.articleCatalog = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    return {
      articleNumber: row.artikelnummer,
      description: row.artikelbezeichnung,
      unitPrice: parseGermanNumber(row.preis),
      priceUnit: row.einheit,
      unit: getUnitFromPriceUnit(row.einheit),
      category: row.kategorie,
      brand: row.marke
    };
  });
}

function findArticle(articleNumber) {
  return state.articleCatalog.find(article => article.articleNumber === articleNumber);
}

function getHeatedRoomCount() {
  return state.floors.reduce((sum, floor) => {
    return sum + floor.rooms.filter((room) =>
      room.function === 'Wohnraum' || room.function === 'Bad'
    ).length;
  }, 0);
}

function getTotalAreaAllRooms() {
  return state.floors.reduce((sum, floor) => {
    return sum + floor.rooms.reduce((roomSum, room) => {
      const area = Number(String(room.area).replace(',', '.')) || 0;
      return roomSum + area;
    }, 0);
  }, 0);
}

function getTotalAreaHeatedRooms() {
  return state.floors.reduce((sum, floor) => {
    return sum + floor.rooms.reduce((roomSum, room) => {
      const isHeatedRoom = room.function === 'Wohnraum' || room.function === 'Bad';
      const area = Number(String(room.area).replace(',', '.')) || 0;
      return isHeatedRoom ? roomSum + area : roomSum;
    }, 0);
  }, 0);
}

function addArticle(products, articleNumber, quantityOverride = 1) {
  const article = findArticle(articleNumber);

  if (!article) {
    console.warn(`Artikelnummer ${articleNumber} wurde in master.csv nicht gefunden.`);
    return;
  }

  const quantity = Number(quantityOverride) || 0;

  products.push({
    selected: true,
    articleNumber: article.articleNumber,
    description: article.description,
    quantity,
    unit: article.unit,
    unitPrice: article.unitPrice,
    priceUnit: article.priceUnit,
    totalPrice: quantity * article.unitPrice
  });
}

function calculateProducts() {
  const products = [];
  const relevantArea = getRelevantAreaForHeatingSystem();

  if (
    state.projectType === 'neubau' &&
    state.brand === 'handelsmarke' &&
    getSystemValue() === 'Tacker' &&
    getCheckedValue('wlg') === '045' &&
    getCheckedValue('insulationThickness') === '20-2 mm' &&
    getCheckedValue('pipeType') === 'PE-RT'
  ) {
    const article = findArticle('H54NO000101');

    if (article) {
      products.push({
        selected: true,
        articleNumber: article.articleNumber,
        description: article.description,
        quantity: relevantArea,
        unit: article.unit,
        unitPrice: article.unitPrice,
        priceUnit: article.priceUnit,
        totalPrice: relevantArea * article.unitPrice
      });
    }
  }

  const heatedRoomCount = getHeatedRoomCount();
  const totalAreaAllRooms = getTotalAreaAllRooms();
  const totalAreaHeatedRooms = getTotalAreaHeatedRooms();

  // Thermostate
  if (state.thermostatEnabled === 'ja' && state.thermostat === 'Analog') {
    addArticle(products, '100BIE021', heatedRoomCount);
  }

  if (state.thermostatEnabled === 'ja' && state.thermostat === 'LCD') {
    addArticle(products, '100BIE022', heatedRoomCount);
  }

  // Dienstleistungen
  if (state.services.includes('Beratungspauschale')) {
    addArticle(products, 'H54NO503501', 1);
  }

  if (state.services.includes('Schnellauslegung')) {
    addArticle(products, 'H54NO504701', totalAreaAllRooms);
  }

  if (state.services.includes('Heizflächenauslegung')) {
    addArticle(products, 'H54NO504501', totalAreaHeatedRooms);
  }

  if (state.services.includes('Heizlastberechnung')) {
    addArticle(products, 'H54NO504001', totalAreaHeatedRooms);
  }

  return products;
}

function updateResultTotal() {
  const total = state.calculatedProducts
    .filter(item => item.selected !== false)
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  resultTotalNet.textContent = formatEuro(total);
}

function renderResultTable(products) {
  resultTableBody.innerHTML = products.map((item, index) => `
    <tr>
      <td>
        <input 
          type="checkbox" 
          class="result-select-checkbox" 
          data-result-index="${index}" 
          ${item.selected !== false ? 'checked' : ''}
        />
      </td>
      <td>${item.articleNumber}</td>
      <td>${item.description}</td>
      <td>${formatQuantity(item.quantity)} ${item.unit}</td>
      <td>${formatEuro(item.unitPrice)} / ${item.unit}</td> 
      <td>${formatEuro(item.totalPrice)}</td>
    </tr>
  `).join('');

  document.querySelectorAll('.result-select-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const index = Number(checkbox.dataset.resultIndex);
      state.calculatedProducts[index].selected = checkbox.checked;
      updateResultTotal();
    });
  });

  updateResultTotal();
}

function showResultPage() {
  state.calculatedProducts = calculateProducts();
  renderResultTable(state.calculatedProducts);

  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.remove('active');
  });

  resultPanel.classList.remove('hidden');
  mainLayout.classList.add('result-mode');

  document.querySelector('.btn-row').classList.add('hidden');

  scrollToTop();
}

function returnToConfiguration() {
  // Ergebnisbereich ausblenden
  resultPanel.classList.add('hidden');

  // Schritte wieder anzeigen
  mainLayout.classList.remove('result-mode');

  // Buttons unten wieder sichtbar machen
  document.querySelector('.btn-row').classList.remove('hidden');

  // Zurück zum letzten Schritt (Berechnung)
  showStep(9);

  scrollToTop();
}

function resetAllInputsAfterHandover() {
  state.currentStep = 0;
  state.projectType = '';
  state.brand = '';
  state.heatSource = '';
  state.thermostat = '';
  state.thermostatEnabled = '';
  state.extraInsulationEnabled = '';
  state.distributionMode = '';
  state.floors = [createFloor()];
  state.services = [];
  state.calculatedProducts = [];
  state.maxUnlockedStep = 0;
  state.isLocked = true;

  document.querySelectorAll('input').forEach((input) => {
    if (input.type === 'checkbox') input.checked = false;
    if (input.type === 'number' || input.type === 'text') input.value = '';
  });

  document.querySelectorAll('select').forEach((select) => {
    select.selectedIndex = 0;
  });

  renderProjectType();
  renderBrand();
  renderHeatSource();
  renderThermostat();
  renderThermostatToggle();
  renderExtraInsulationToggle();
  renderDistributionMode();
  renderFloors();
  updateSummary();
}

function lockConfigurator() {
  state.isLocked = true;

  if (shopToken) {
    localStorage.setItem(tokenStorageKey, 'used');
  }

  document.querySelectorAll('button, input, select, .choice-card, .step-item').forEach((el) => {
    el.disabled = true;
    el.classList.add('disabled-card');
  });

  resultPanel.innerHTML = `
    <h2 class="section-title">Konfigurator abgeschlossen</h2>
    <p class="section-subtitle">
      Die Artikel wurden an den PeterShop übergeben. Dieser Konfigurator kann mit diesem Token nicht erneut genutzt werden.
    </p>
  `;
}

function checkTokenUsageOnLoad() {
  if (shopToken && localStorage.getItem(tokenStorageKey) === 'used') {
    mainLayout.classList.add('result-mode');
    document.querySelector('.steps').classList.add('hidden');
    document.querySelector('.btn-row').classList.add('hidden');
    document.querySelectorAll('.step-panel').forEach((panel) => panel.classList.remove('active'));

    resultPanel.classList.remove('hidden');
    resultPanel.innerHTML = `
      <h2 class="section-title">Token bereits verwendet</h2>
      <p class="section-subtitle">
        Dieser Konfigurator-Link wurde bereits genutzt. Bitte starten Sie den Konfigurator erneut aus dem PeterShop.
      </p>
    `;

    state.isLocked = true;
  }
}

function getRelevantAreaForHeatingSystem() {
  return state.floors.reduce((sum, floor) => {
    return sum + floor.rooms.reduce((roomSum, room) => {
      const isRelevantRoom =
        room.function === 'Wohnraum' || room.function === 'Bad';

      const area = Number(String(room.area).replace(',', '.')) || 0;

      return isRelevantRoom ? roomSum + area : roomSum;
    }, 0);
  }, 0);
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
    <div><strong>System:</strong> ${getSystemValue() || 'Keine Auswahl'}, ${getCheckedValue('wlg')}, ${getCheckedValue('insulationThickness')}</div>
    <div><strong>Rohr:</strong> ${getCheckedValue('pipeType')} / ${getCheckedValue('pipeSize')}</div>
    <div><strong>Estrich:</strong> ${estrichRangeEntries.length ? estrichRangeEntries.join(', ') : 'Keine Auswahl'}</div>
<div><strong>Zusatzmittel:</strong> ${estrichAdditiveEntries.length ? estrichAdditiveEntries.join(', ') : 'Keine Auswahl'}</div>
<div><strong>Trockenbau:</strong> ${dryConstructionEntries.length ? dryConstructionEntries.join(', ') : 'Keine Auswahl'}</div>
    <div><strong>Thermostat:</strong> ${state.thermostatEnabled === 'nein' ? 'Kein Thermostat' : state.thermostat}</div>
    <div><strong>Verteilerschrank-Art:</strong> ${getCheckedValue('cabinetMounting')}</div>
<div><strong>Verteiler Menge & Typ:</strong> ${state.distributionMode === 'auto' ? 'Automatische Ermittlung' : (manualDistributionEntries.length ? manualDistributionEntries.join(', ') : 'Keine manuelle Eingabe')}</div>
<div><strong>Regeltechnik:</strong> ${getCheckedValue('regulationVoltage')} / ${regulationEntries.length ? regulationEntries.join(', ') : 'Keine Zusatzkomponenten'}</div>
    <div><strong>Zusatzdämmung:</strong> ${state.extraInsulationEnabled === 'nein' ? 'Keine' : `${getCheckedValue('extraInsulation')} / ${getCheckedValue('extraInsulationWlg')} / ${getCheckedValue('extraInsulationThickness')}`}</div>
    <div><strong>Etagen / Räume:</strong> ${state.floors.length} / ${roomsCount}</div>
    <div><strong>Dienstleistungen:</strong> ${servicesText}</div>
  `;
}

systemFloorSelect.addEventListener('change', () => {
  state.selectedSystemFloorIndex = Number(systemFloorSelect.value);
  const floor = state.floors[state.selectedSystemFloorIndex];
  setSystemSelection(floor?.systemAssignment || null);
  updateAssignFloorSystemButton();
  updateSummary();
});

assignFloorSystemBtn.addEventListener('click', () => {
  assignSystemToSelectedFloor();
});

document.querySelectorAll('#projectTypeChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    const newProjectType = card.dataset.type;

    if (state.projectType && state.projectType !== newProjectType) {
      resetFromProjectTypeForward();
    }

    state.projectType = newProjectType;

    if (newProjectType === 'neubau') {
      state.brand = 'handelsmarke';
    }

    if (newProjectType === 'sanierung') {
      state.brand = '';
    }

    renderProjectType();
    renderBrand();
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

document.querySelectorAll('#distributionToggleChoices .choice-card').forEach((card) => {
  card.addEventListener('click', () => {
    state.distributionEnabled = card.dataset.distributionToggle;

    renderDistributionToggle();
    renderDistributionMode();
    updateSummary();
  });
});

document.getElementById('startCalculationBtn').addEventListener('click', async () => {
  try {
    if (!state.articleCatalog.length) {
      await loadArticleCatalog();
    }

    showResultPage();
  } catch (error) {
    await showAppModal({
      title: 'Fehler',
      message: 'Die Artikeldaten konnten nicht geladen werden. Bitte prüfen Sie, ob die Datei master.csv im Projektordner liegt.',
      confirmText: 'OK'
    });
  }
});

savePdfBtn.addEventListener('click', () => {
  // Browser-Variante: Der Nutzer kann im Druckdialog "Als PDF speichern" wählen.
  window.print();
});

printResultBtn.addEventListener('click', () => {
  window.print();
});

backToConfigBtn.addEventListener('click', () => {
  returnToConfiguration();
});

handoverShopBtn.addEventListener('click', async () => {
  const confirmed = await showAppModal({
    title: 'Übergabe an PeterShop',
    message: 'Mit Übergabe an PeterShop werden die Artikel an den PeterShop gesendet und in Ihrem Warenkorb gelegt. Sämtliche Eingaben werden dadurch im Konfigurator entfernt. Sind Sie sicher, jetzt an den PeterShop zu übergeben?',
    confirmText: 'Ja, übergeben',
    cancelText: 'Abbrechen'
  });

  if (!confirmed) return;

  const productsForShop = state.calculatedProducts.filter((item) => item.selected !== false);

  if (productsForShop.length === 0) {
    await showAppModal({
      title: 'Keine Artikel ausgewählt',
      message: 'Es wurde keine Position für die Übergabe an den PeterShop ausgewählt.',
      confirmText: 'OK'
    });
    return;
  }

  // Platzhalter: Hier kommt später die echte Shop-Übergabe per API/Formular/URL hin.
  resetAllInputsAfterHandover();

  await showAppModal({
    title: 'Übergabe erfolgreich',
    message: 'Ihre Artikel sind an Ihren Warenkorb übergeben worden, Sie können nun dieses Fenster schließen und zu PeterShop zurückkehren.',
    confirmText: 'OK'
  });

  lockConfigurator();
});

[
  'system',
  'wlg',
  'insulationThickness',
  'pipeType',
  'pipeSize',
  'extraInsulation',
  'extraInsulationWlg',
  'extraInsulationThickness',
  'cabinetMounting',
  'regulationVoltage'
].forEach(setupSingleChoiceCheckboxGroup);

document.querySelectorAll('input[name="system"]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      document.querySelectorAll('input[name="system"]').forEach((otherCheckbox) => {
        if (otherCheckbox !== checkbox) {
          otherCheckbox.checked = false;
        }
      });
    }

    updateSummary();
  });
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
      if (!confirmReturnToProjectType(targetStep)) return;

      if (targetStep === 1 && state.currentStep > 1) {
        resetFromProjectTypeForward();
      }

      showStep(targetStep);
    }
  });
});

prevBtn.addEventListener('click', () => {
  const targetStep = state.currentStep - 1;

  if (!confirmReturnToProjectType(targetStep)) return;

  if (targetStep === 1 && state.currentStep > 1) {
    resetFromProjectTypeForward();
  }

  showStep(targetStep);
});

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

state.floors = [createFloor()];
renderProjectType();
renderSystemBlocksByProjectType();
renderBrand();
updateSystemInfoTextsByBrand();
renderHeatSource();
renderThermostat();
renderThermostatToggle();
renderExtraInsulationToggle();
renderDistributionMode();
renderDistributionToggle();
renderFloors();
syncEstrichAdditivesRules();
syncEstrichRangeRules();
updateSummary();
showStep(0);
checkTokenUsageOnLoad();