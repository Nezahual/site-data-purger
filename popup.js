document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('domain-select');
  const btnClear = document.getElementById('btn-clear');
  const btnReload = document.getElementById('btn-reload');
  const btnQuickCookies = document.getElementById('btn-quick-cookies');
  const openOptionsLink = document.getElementById('open-options');
  const statusMsg = document.getElementById('status-message');

  let domainConfigs = {};

  // Initialize
  chrome.storage.local.get(null, (items) => {
    domainConfigs = items;
    
    const mode = (domainConfigs.globalSettings && domainConfigs.globalSettings.mode) ? domainConfigs.globalSettings.mode : 'lite';
    const proFeatures = document.getElementById('pro-features');
    if (mode === 'lite' && proFeatures) {
      proFeatures.style.display = 'none';
    }

    const domains = Object.keys(domainConfigs).filter(key => key !== 'globalSettings');

    select.innerHTML = '';
    
    // Add default placeholder
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = domains.length === 0 ? "No hay dominios configurados" : "-- Selecciona un dominio --";
    select.appendChild(defaultOption);

    // Populate select
    domains.forEach(domain => {
      const option = document.createElement('option');
      option.value = domain;
      option.textContent = domain;
      select.appendChild(option);
    });

    // Handle select change to enable/disable main clear button
    select.addEventListener('change', () => {
      btnClear.disabled = !domainConfigs[select.value];
    });

    // Auto-select current tab domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const currentOrigin = new URL(tabs[0].url).origin;
          if (domainConfigs[currentOrigin]) {
            select.value = currentOrigin;
            btnClear.disabled = false;
          } else if (currentOrigin.startsWith('http')) {
            // Añadirlo temporalmente al select para que los botones rápidos funcionen
            const tempOption = document.createElement('option');
            tempOption.value = currentOrigin;
            tempOption.textContent = currentOrigin + ' (Sin configurar)';
            select.appendChild(tempOption);
            select.value = currentOrigin;
            btnClear.disabled = true;

            // El dominio no está configurado, mostrar opción de añadir
            const unconfState = document.getElementById('unconfigured-state');
            const btnConfigure = document.getElementById('btn-configure-current');
            
            if (unconfState && btnConfigure) {
              unconfState.style.display = 'block';
              btnConfigure.onclick = () => {
                window.open(chrome.runtime.getURL(`options.html?domain=${encodeURIComponent(currentOrigin)}`));
              };
            }
          }
        } catch (e) {
          // Ignore invalid URL
        }
      }
    });
  });

  // Handle Clear Button
  btnClear.addEventListener('click', () => {
    const selectedDomain = select.value;
    if (!selectedDomain || !domainConfigs[selectedDomain]) {
      showStatus('Por favor, selecciona un dominio.', 'error');
      return;
    }

    const config = domainConfigs[selectedDomain];
    const originDataToRemove = {};
    
    Object.keys(config).forEach(key => {
      if (config[key]) {
        originDataToRemove[key] = true;
      }
    });

    if (Object.keys(originDataToRemove).length === 0) {
      showStatus('No hay datos configurados para borrar en este dominio.', 'error');
      return;
    }

    btnClear.disabled = true;
    btnClear.textContent = 'Borrando...';

    chrome.browsingData.remove(
      { origins: [selectedDomain] },
      originDataToRemove,
      () => {
        btnClear.disabled = false;
        btnClear.textContent = 'Borrar Datos';
        showStatus('Datos borrados exitosamente.', 'success');
      }
    );
  });

  btnQuickCookies.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].url) {
        showStatus('No se pudo detectar la página actual.', 'error');
        return;
      }
      try {
        const currentOrigin = new URL(tabs[0].url).origin;
        if (!currentOrigin.startsWith('http')) {
          showStatus('No se puede actuar sobre esta página.', 'error');
          return;
        }

        chrome.browsingData.remove(
          { origins: [currentOrigin] },
          { cookies: true },
          () => {
            showStatus('Cookies borradas. Recargando...', 'success');
            chrome.tabs.reload(tabs[0].id, { bypassCache: true });
          }
        );
      } catch (e) {
        showStatus('URL inválida.', 'error');
      }
    });
  });

  // Handle Reload Button
  btnReload.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });

  // Open Options page
  openOptionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg status-${type}`;
    setTimeout(() => {
      statusMsg.className = 'status-msg';
      statusMsg.textContent = '';
    }, 3000);
  }
});
