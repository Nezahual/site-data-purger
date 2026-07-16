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

  let isEditing = false;
  let editingOriginalUrl = null;
  let isUnlocked = false;

  unlockBtn.addEventListener('click', () => {
    isUnlocked = !isUnlocked;
    unlockBtn.textContent = isUnlocked ? '🔓' : '🔒';
    unlockBtn.title = isUnlocked ? 'Bloquear opciones avanzadas' : 'Desbloquear opciones avanzadas';
    
    if (isUnlocked) {
      lockStatusText.innerHTML = 'Datos Avanzados: <span style="color: #22c55e; text-shadow: 0 0 8px rgba(34,197,94,0.7); font-weight: bold;">unlocked</span>';
    } else {
      lockStatusText.innerHTML = 'Datos Avanzados: <span style="color: #ef4444; text-shadow: 0 0 8px rgba(239,68,68,0.7); font-weight: bold;">locked</span>';
    }

    advancedCheckboxes.forEach(cb => {
      cb.disabled = !isUnlocked;
      cb.title = isUnlocked ? '' : 'Haz clic en el candado para desbloquear';
    });
  });

  // Initial Mode Setup
  chrome.storage.local.get('globalSettings', (data) => {
    const mode = (data.globalSettings && data.globalSettings.mode) ? data.globalSettings.mode : 'lite';
    modeToggle.checked = (mode === 'pro');
    updateVisualMode();
  });

  modeToggle.addEventListener('change', () => {
    const newMode = modeToggle.checked ? 'pro' : 'lite';
    chrome.storage.local.set({ globalSettings: { mode: newMode } }, () => {
      updateVisualMode();
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

  // Cargar dominios guardados al iniciar
  loadDomains();

  // Leer si venimos desde el popup con un dominio para autocompletar
  const urlParams = new URLSearchParams(window.location.search);
  const prefillDomain = urlParams.get('domain');
  if (prefillDomain) {
    urlInput.value = prefillDomain;
  }

  // Búsqueda predictiva (filtro contains)
  urlInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length >= 3) {
      chrome.history.search({ text: query, maxResults: 100 }, (results) => {
        const origins = new Set();
        
        results.forEach(item => {
          try {
            const urlObj = new URL(item.url);
            const origin = urlObj.origin;
            // Filtro 'contains'
            if (origin.toLowerCase().includes(query)) {
                origins.add(origin);
            }
          } catch (e) {
            // Ignorar URLs inválidas
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

  // Guardar o Actualizar dominio
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
      showStatus('URL inválida. Introduce un dominio válido.', 'error');
      return;
    }

    const checkboxes = document.querySelectorAll('input[name="dataType"]:checked');
    const dataTypes = {};
    checkboxes.forEach(cb => {
      dataTypes[cb.value] = true;
    });

    if (Object.keys(dataTypes).length === 0) {
      showStatus('Selecciona al menos un tipo de dato a borrar.', 'error');
      return;
    }

    chrome.storage.local.get(null, (items) => {
      // Prevención de duplicados
      if (!isEditing && items[origin]) {
        showStatus('Este dominio ya está registrado. Búscalo en la tabla para editarlo.', 'error');
        return;
      }
      
      if (isEditing && origin !== editingOriginalUrl && items[origin]) {
        showStatus('El nuevo dominio ya está registrado en otra entrada.', 'error');
        return;
      }

      // Si se cambió el dominio durante la edición, borramos el antiguo
      if (isEditing && origin !== editingOriginalUrl) {
        chrome.storage.local.remove(editingOriginalUrl);
      }

      const dataToSave = {};
      dataToSave[origin] = dataTypes;

      chrome.storage.local.set(dataToSave, () => {
        showStatus('Configuración guardada correctamente.', 'success');
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
        editBtn.textContent = 'Editar';
        editBtn.onclick = () => editDomain(domain, config);
        
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger btn-sm';
        delBtn.textContent = 'Eliminar';
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
    
    // Asegurar que siempre esté bloqueado al editar, requiriendo click manual
    if (isUnlocked) {
      unlockBtn.click();
    }

    saveBtn.textContent = 'Actualizar Configuración';
    cancelEditBtn.classList.remove('hidden');
    document.querySelector('.form-section').classList.add('editing-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteDomain(domain) {
    if (confirm(`¿Estás seguro de que deseas eliminar la configuración para ${domain}?`)) {
      chrome.storage.local.remove(domain, () => {
        loadDomains();
      });
    }
  }

  function resetForm() {
    form.reset();
    isEditing = false;
    editingOriginalUrl = null;
    saveBtn.textContent = 'Guardar Configuración';
    cancelEditBtn.classList.add('hidden');
    document.querySelector('.form-section').classList.remove('editing-mode');
    document.querySelectorAll('input[name="dataType"]').forEach(cb => {
      cb.checked = ['cacheStorage', 'cookies'].includes(cb.value);
    });
    
    if (isUnlocked) {
      unlockBtn.click(); // volver a bloquear
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
