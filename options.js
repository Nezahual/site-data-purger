document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('domain-form');
  const urlInput = document.getElementById('domain-input');
  const datalist = document.getElementById('history-datalist');
  const tableBody = document.querySelector('#domains-table tbody');
  const emptyState = document.getElementById('empty-state');
  const saveBtn = document.getElementById('save-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const statusMsg = document.getElementById('status-message');
  const unlockBtn = document.getElementById('unlock-advanced-btn');
  const lockStatusText = document.getElementById('lock-status-text');
  const advancedCheckboxes = document.querySelectorAll('.advanced-cb');
  
  const modeToggle = document.getElementById('mode-toggle');
  const labelLite = document.getElementById('label-lite');
  const labelPro = document.getElementById('label-pro');
  const proSettingsContainer = document.getElementById('pro-settings-container');
  const langSelect = document.getElementById('lang-select');

  let isEditing = false;
  let editingOriginalUrl = null;
  let isUnlocked = false;
  let currentLang = 'es';

  // Toggle padlock advanced fields
  unlockBtn.addEventListener('click', () => {
    isUnlocked = !isUnlocked;
    unlockBtn.textContent = isUnlocked ? '🔓' : '🔒';
    updateLockStatusUI();
  });

  function updateLockStatusUI() {
    unlockBtn.title = isUnlocked 
      ? (currentLang === 'en' ? 'Lock advanced options' : 'Bloquear opciones avanzadas')
      : window.translations[currentLang].unlock_btn_title;
    
    const labelText = currentLang === 'en' ? 'Advanced data' : 'Datos avanzados';
    const statusColor = isUnlocked ? '#22c55e' : '#ef4444';
    const statusShadow = isUnlocked ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)';
    const statusWord = isUnlocked 
      ? window.translations[currentLang].msg_status_unlocked 
      : window.translations[currentLang].msg_status_locked;

    lockStatusText.innerHTML = `${labelText}: <span style="color: ${statusColor}; text-shadow: 0 0 8px ${statusShadow}; font-weight: bold;">${statusWord}</span>`;

    advancedCheckboxes.forEach(cb => {
      cb.disabled = !isUnlocked;
      cb.title = isUnlocked ? '' : window.translations[currentLang].tooltip_candado;
    });
  }

  // Initial Mode & Language Setup
  chrome.storage.local.get('globalSettings', (data) => {
    const settings = data.globalSettings || {};
    const mode = settings.mode || 'lite';
    currentLang = settings.lang || window.getDefaultLanguage();

    modeToggle.checked = (mode === 'pro');
    langSelect.value = currentLang;

    updateVisualMode();
    window.translatePage(currentLang);
    updateLockStatusUI();
    loadDomains();
  });

  modeToggle.addEventListener('change', () => {
    const newMode = modeToggle.checked ? 'pro' : 'lite';
    chrome.storage.local.get('globalSettings', (data) => {
      const settings = data.globalSettings || {};
      settings.mode = newMode;
      chrome.storage.local.set({ globalSettings: settings }, () => {
        updateVisualMode();
      });
    });
  });

  langSelect.addEventListener('change', () => {
    currentLang = langSelect.value;
    chrome.storage.local.get('globalSettings', (data) => {
      const settings = data.globalSettings || {};
      settings.lang = currentLang;
      chrome.storage.local.set({ globalSettings: settings }, () => {
        window.translatePage(currentLang);
        updateLockStatusUI();
        loadDomains();
        updateFormButtons();
      });
    });
  });

  function updateVisualMode() {
    if (modeToggle.checked) {
      labelPro.classList.add('active');
      labelLite.classList.remove('active');
      proSettingsContainer.classList.remove('mode-lite-disabled');
    } else {
      labelLite.classList.add('active');
      labelPro.classList.remove('active');
      proSettingsContainer.classList.add('mode-lite-disabled');
    }
  }

  // Prefill check from popup parameters
  const urlParams = new URLSearchParams(window.location.search);
  const prefillDomain = urlParams.get('domain');
  if (prefillDomain) {
    urlInput.value = prefillDomain;
  }

  // Predictive search
  urlInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length >= 3) {
      chrome.history.search({ text: query, maxResults: 100 }, (results) => {
        const origins = new Set();
        
        results.forEach(item => {
          try {
            const urlObj = new URL(item.url);
            const origin = urlObj.origin;
            if (origin.toLowerCase().includes(query)) {
                origins.add(origin);
            }
          } catch (e) {
            // Ignore invalid URLs
          }
        });

        datalist.innerHTML = '';
        origins.forEach(origin => {
          const option = document.createElement('option');
          option.value = origin;
          datalist.appendChild(option);
        });
      });
    } else {
      datalist.innerHTML = '';
    }
  });

  // Save / Update domain
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let rawUrl = urlInput.value.trim();
    if (!rawUrl) return;
    
    let origin;
    try {
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }
      origin = new URL(rawUrl).origin;
    } catch (err) {
      showStatus(window.translations[currentLang].msg_invalid_url, 'error');
      return;
    }

    const checkboxes = document.querySelectorAll('input[name="dataType"]:checked');
    const dataTypes = {};
    checkboxes.forEach(cb => {
      dataTypes[cb.value] = true;
    });

    if (Object.keys(dataTypes).length === 0) {
      const msg = currentLang === 'en'
        ? 'Select at least one data type to clear.'
        : 'Selecciona al menos un tipo de dato a borrar.';
      showStatus(msg, 'error');
      return;
    }

    chrome.storage.local.get(null, (items) => {
      if (!isEditing && items[origin]) {
        showStatus(window.translations[currentLang].msg_already_exists, 'error');
        return;
      }
      
      if (isEditing && origin !== editingOriginalUrl && items[origin]) {
        const msg = currentLang === 'en'
          ? 'The new domain is already registered in another entry.'
          : 'El nuevo dominio ya está registrado en otra entrada.';
        showStatus(msg, 'error');
        return;
      }

      if (isEditing && origin !== editingOriginalUrl) {
        chrome.storage.local.remove(editingOriginalUrl);
      }

      const dataToSave = {};
      dataToSave[origin] = dataTypes;

      chrome.storage.local.set(dataToSave, () => {
        showStatus(window.translations[currentLang].msg_saved, 'success');
        resetForm();
        loadDomains();
      });
    });
  });

  cancelEditBtn.addEventListener('click', resetForm);

  function loadDomains() {
    chrome.storage.local.get(null, (items) => {
      tableBody.innerHTML = '';
      const domains = Object.keys(items).filter(key => key !== 'globalSettings');
      
      if (domains.length === 0) {
        emptyState.style.display = 'block';
        document.getElementById('domains-table').style.display = 'none';
        return;
      }

      emptyState.style.display = 'none';
      document.getElementById('domains-table').style.display = 'table';

      domains.forEach(domain => {
        const config = items[domain];
        const types = Object.keys(config).filter(k => config[k]);
        
        const tr = document.createElement('tr');
        
        const tdDomain = document.createElement('td');
        tdDomain.textContent = domain;
        tr.appendChild(tdDomain);

        const tdTypes = document.createElement('td');
        const badgeLabels = {
          cacheStorage: 'CacheStorage',
          cookies: 'Cookies',
          localStorage: 'LocalStorage',
          indexedDB: 'IndexedDB',
          fileSystems: 'File System',
          serviceWorkers: 'Service Workers'
        };
        types.forEach(type => {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = badgeLabels[type] || type;
          tdTypes.appendChild(badge);
        });
        tr.appendChild(tdTypes);

        const tdActions = document.createElement('td');
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.textContent = window.translations[currentLang].msg_action_edit;
        editBtn.onclick = () => editDomain(domain, config);
        
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger btn-sm';
        delBtn.textContent = window.translations[currentLang].msg_action_delete;
        delBtn.onclick = () => deleteDomain(domain);

        tdActions.appendChild(editBtn);
        tdActions.appendChild(delBtn);
        tr.appendChild(tdActions);

        tableBody.appendChild(tr);
      });
    });
  }

  function editDomain(domain, config) {
    isEditing = true;
    editingOriginalUrl = domain;
    
    urlInput.value = domain;
    
    document.querySelectorAll('input[name="dataType"]').forEach(cb => {
      cb.checked = !!config[cb.value];
    });
    
    if (isUnlocked) {
      unlockBtn.click();
    }

    updateFormButtons();
    cancelEditBtn.classList.remove('hidden');
    document.querySelector('.form-section').classList.add('editing-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteDomain(domain) {
    const confirmMsg = currentLang === 'en' 
      ? `Are you sure you want to delete the configuration for ${domain}?` 
      : `¿Estás seguro de que deseas eliminar la configuración para ${domain}?`;
    if (confirm(confirmMsg)) {
      chrome.storage.local.remove(domain, () => {
        loadDomains();
      });
    }
  }

  function resetForm() {
    form.reset();
    isEditing = false;
    editingOriginalUrl = null;
    updateFormButtons();
    cancelEditBtn.classList.add('hidden');
    document.querySelector('.form-section').classList.remove('editing-mode');
    document.querySelectorAll('input[name="dataType"]').forEach(cb => {
      cb.checked = ['cacheStorage', 'cookies'].includes(cb.value);
    });
    
    if (isUnlocked) {
      unlockBtn.click(); // revert locks
    }
  }

  function updateFormButtons() {
    if (isEditing) {
      saveBtn.textContent = currentLang === 'en' ? 'Update Configuration' : 'Actualizar Configuración';
    } else {
      saveBtn.textContent = window.translations[currentLang].save_config_btn;
    }
  }

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg status-${type}`;
    setTimeout(() => {
      statusMsg.className = 'status-msg';
      statusMsg.textContent = '';
    }, 4000);
  }
});
