document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('domain-select');
  const btnClear = document.getElementById('btn-clear');
  const btnReload = document.getElementById('btn-reload');
  const btnQuickCookies = document.getElementById('btn-quick-cookies');
  const btnQuickCache = document.getElementById('btn-quick-cache');
  const openOptionsLink = document.getElementById('open-options');
  const statusMsg = document.getElementById('status-message');

  let domainConfigs = {};
  let currentLang = 'es';

  // Initialize
  chrome.storage.local.get(null, (items) => {
    domainConfigs = items;
    
    // Get mode & language
    const settings = domainConfigs.globalSettings || {};
    const mode = settings.mode || 'lite';
    currentLang = settings.lang || window.getDefaultLanguage();

    // Translate UI
    window.translatePage(currentLang);

    const proFeatures = document.getElementById('pro-features');
    if (mode === 'lite' && proFeatures) {
      proFeatures.style.display = 'none';
    }

    const domains = Object.keys(domainConfigs).filter(key => key !== 'globalSettings');

    select.innerHTML = '';
    
    // Add default placeholder
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = domains.length === 0 
      ? window.translations[currentLang].popup_no_domains 
      : window.translations[currentLang].popup_select_placeholder;
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
            // Add temporarily to select
            const tempOption = document.createElement('option');
            tempOption.value = currentOrigin;
            tempOption.textContent = currentOrigin + window.translations[currentLang].popup_unconfigured_tag;
            select.appendChild(tempOption);
            select.value = currentOrigin;
            btnClear.disabled = true;

            // Show unconfigured panel
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
      showStatus(window.translations[currentLang].msg_please_select, 'error');
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
      showStatus(window.translations[currentLang].msg_no_data_configured, 'error');
      return;
    }

    btnClear.disabled = true;
    btnClear.textContent = window.translations[currentLang].msg_btn_clearing;

    chrome.browsingData.remove(
      { origins: [selectedDomain] },
      originDataToRemove,
      () => {
        btnClear.disabled = false;
        btnClear.textContent = window.translations[currentLang].popup_btn_clear;
        showStatus(window.translations[currentLang].msg_cleared_success, 'success');
      }
    );
  });

  // Quick Cookies button
  btnQuickCookies.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].url) {
        showStatus(window.translations[currentLang].msg_no_active_page, 'error');
        return;
      }
      try {
        const currentOrigin = new URL(tabs[0].url).origin;
        if (!currentOrigin.startsWith('http')) {
          showStatus(window.translations[currentLang].msg_cannot_act_page, 'error');
          return;
        }

        chrome.browsingData.remove(
          { origins: [currentOrigin] },
          { cookies: true },
          () => {
            showStatus(window.translations[currentLang].msg_cookies_cleared_reloading, 'success');
            chrome.tabs.reload(tabs[0].id, { bypassCache: true });
          }
        );
      } catch (e) {
        showStatus(window.translations[currentLang].msg_invalid_url_popup, 'error');
      }
    });
  });

  // Quick Cache button
  btnQuickCache.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].id) {
        showStatus(window.translations[currentLang].msg_no_active_page, 'error');
        return;
      }

      chrome.browsingData.remove(
        {},
        { cache: true },
        () => {
          showStatus(window.translations[currentLang].msg_cache_cleared_reloading, 'success');
          chrome.tabs.reload(tabs[0].id, { bypassCache: true });
        }
      );
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
