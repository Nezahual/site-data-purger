const translations = {
  es: {
    // General / Header
    options_title: "Opciones - SiteDataPurge",
    options_header_title: "⚙️ Opciones de SiteDataPurge",
    options_header_subtitle: "Configura los dominios y los datos que deseas poder borrar.",
    mode_lite: "Modo Lite",
    mode_advanced: "Modo Avanzado",
    language_label: "Idioma:",

    // Form Section
    form_title: "Añadir / Editar dominio",
    input_domain_label: "URL del dominio",
    input_domain_placeholder: "https://ejemplo.com",
    history_hint: "Escribe al menos 3 caracteres para buscar en el historial.",
    data_to_clear_label: "Datos a borrar:",
    lock_status_locked: "Datos avanzados: locked",
    lock_status_unlocked: "Datos avanzados: unlocked",
    unlock_btn_title: "Desbloquear opciones avanzadas",
    save_config_btn: "Guardar configuración",
    cancel_edit_btn: "Cancelar edición",

    // Tooltips
    tooltip_cookies: "Identidad y rastreo. Borrarlas hará que se cierre tu sesión (tendrás que volver a poner tu contraseña) y se vacíe tu carrito de la compra si no estabas registrado.",
    tooltip_cachestorage: "Guarda la 'estructura' de la web (archivos, imágenes, código) para que funcione rápido o sin internet. Bórralo si la web se ve rota o con un diseño antiguo.",
    tooltip_localstorage: "Guarda tus 'ajustes' personales (modo oscuro, si ya aceptaste el aviso de cookies, etc). Bórralo si quieres resetear tus preferencias o la web hace cosas raras.",
    tooltip_indexeddb: "Base de datos de la web. Borrarla reinicia la app por completo. Perderás el progreso de juegos web o mensajes de chats (como WhatsApp Web) que no se hayan subido a la nube.",
    tooltip_filesystem: "Archivos guardados por la web. Borrarlo eliminará descargas internas de la página, como borradores de documentos editados que aún no has guardado en tu PC.",
    tooltip_serviceworkers: "El 'motor' en segundo plano. Borrarlo corta de raíz las notificaciones push de esa web y arregla problemas graves donde la página se queda totalmente en blanco o congelada.",
    tooltip_candado: "Haz clic en el candado para desbloquear",

    // Table Section
    table_title: "Dominios configurados",
    th_domain: "Dominio",
    th_data_to_clear: "Datos a borrar",
    th_actions: "Acciones",
    empty_state: "No hay dominios configurados.",

    // Popup
    popup_header_title: "🧹 Limpiar datos",
    popup_select_label: "Selecciona un dominio:",
    popup_loading_domains: "Cargando dominios...",
    popup_no_domains: "No hay dominios configurados",
    popup_select_placeholder: "-- Selecciona un dominio --",
    popup_unconfigured_tag: " (Sin configurar)",
    popup_unconfigured_site: "Sitio no configurado",
    popup_btn_add_config: "⚙️ Añadir a la configuración",
    popup_btn_clear: "Borrar datos",
    popup_btn_reload: "Recargar",
    popup_btn_quick_cookies: "🍪 Borrar solo cookies + F5 (página actual)",
    popup_btn_quick_cache: "⚡ Borrar solo caché + F5 (todo el navegador)",
    popup_link_config: "⚙️ Configuración",

    // Dynamic Messages (JS)
    msg_saved: "Configuración guardada exitosamente.",
    msg_invalid_url: "Por favor, introduce una URL válida.",
    msg_already_exists: "Este dominio ya está configurado. Edítalo en la tabla.",
    msg_action_edit: "Editar",
    msg_action_delete: "Eliminar",
    msg_status_locked: "locked",
    msg_status_unlocked: "unlocked",
    msg_btn_clearing: "Borrando...",
    msg_please_select: "Por favor, selecciona un dominio.",
    msg_no_data_configured: "No hay datos configurados para borrar en este dominio.",
    msg_cleared_success: "Datos borrados exitosamente.",
    msg_no_active_page: "No se pudo detectar la página actual.",
    msg_cannot_act_page: "No se puede actuar sobre esta página.",
    msg_cookies_cleared_reloading: "Cookies borradas. Recargando...",
    msg_cache_cleared_reloading: "Caché del navegador borrada. Recargando...",
    msg_invalid_url_popup: "URL inválida."
  },
  en: {
    // General / Header
    options_title: "Settings - SiteDataPurge",
    options_header_title: "⚙️ SiteDataPurge Settings",
    options_header_subtitle: "Configure the domains and the data you want to be able to clear.",
    mode_lite: "Lite Mode",
    mode_advanced: "Advanced Mode",
    language_label: "Language:",

    // Form Section
    form_title: "Add / Edit domain",
    input_domain_label: "Domain URL",
    input_domain_placeholder: "https://example.com",
    history_hint: "Type at least 3 characters to search in your history.",
    data_to_clear_label: "Data to clear:",
    lock_status_locked: "Advanced data: locked",
    lock_status_unlocked: "Advanced data: unlocked",
    unlock_btn_title: "Unlock advanced options",
    save_config_btn: "Save configuration",
    cancel_edit_btn: "Cancel edit",

    // Tooltips
    tooltip_cookies: "Identity and tracking. Clearing them will close your session (you will have to put your password again) and empty your shopping cart if you were not registered.",
    tooltip_cachestorage: "Saves the website 'structure' (files, images, code) to run fast or offline. Clear it if the site looks broken or has an old design.",
    tooltip_localstorage: "Saves your personal 'settings' (dark mode, cookie notice acceptance, etc). Clear it if you want to reset preferences or the website behaves weirdly.",
    tooltip_indexeddb: "Web database. Clearing it fully restarts the web app. You will lose progress in web games or chat history (like WhatsApp Web) not synced to the cloud.",
    tooltip_filesystem: "Files saved by the website. Clearing it will delete internal downloads of the page, such as drafts of documents you haven't saved to your PC yet.",
    tooltip_serviceworkers: "The background 'engine'. Clearing it cuts off push notifications from that website and fixes severe issues where the page remains completely blank or frozen.",
    tooltip_candado: "Click the padlock to unlock",

    // Table Section
    table_title: "Configured domains",
    th_domain: "Domain",
    th_data_to_clear: "Data to clear",
    th_actions: "Actions",
    empty_state: "No domains configured.",

    // Popup
    popup_header_title: "🧹 Clear data",
    popup_select_label: "Select a domain:",
    popup_loading_domains: "Loading domains...",
    popup_no_domains: "No domains configured",
    popup_select_placeholder: "-- Select a domain --",
    popup_unconfigured_tag: " (Unconfigured)",
    popup_unconfigured_site: "Unconfigured website",
    popup_btn_add_config: "⚙️ Add to settings",
    popup_btn_clear: "Clear data",
    popup_btn_reload: "Reload",
    popup_btn_quick_cookies: "🍪 Clear cookies only + F5 (current page)",
    popup_btn_quick_cache: "⚡ Clear cache only + F5 (all browser)",
    popup_link_config: "⚙️ Settings",

    // Dynamic Messages (JS)
    msg_saved: "Settings saved successfully.",
    msg_invalid_url: "Please enter a valid URL.",
    msg_already_exists: "This domain is already configured. Edit it in the table.",
    msg_action_edit: "Edit",
    msg_action_delete: "Delete",
    msg_status_locked: "locked",
    msg_status_unlocked: "unlocked",
    msg_btn_clearing: "Clearing...",
    msg_please_select: "Please select a domain.",
    msg_no_data_configured: "No data configured to clear for this domain.",
    msg_cleared_success: "Data cleared successfully.",
    msg_no_active_page: "Could not detect the current page.",
    msg_cannot_act_page: "Cannot act on this page.",
    msg_cookies_cleared_reloading: "Cookies cleared. Reloading...",
    msg_cache_cleared_reloading: "Browser cache cleared. Reloading...",
    msg_invalid_url_popup: "Invalid URL."
  }
};

function getDefaultLanguage() {
  const uiLang = (chrome.i18n && chrome.i18n.getUILanguage)
    ? chrome.i18n.getUILanguage().split('-')[0]
    : navigator.language.split('-')[0];
  return uiLang === 'es' ? 'es' : 'en';
}

function translatePage(lang) {
  const dict = translations[lang] || translations.es;

  // Translate elements with data-i18n (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // Translate tooltips (data-tooltip)
  document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
    const key = el.getAttribute('data-i18n-tooltip');
    if (dict[key]) {
      el.setAttribute('data-tooltip', dict[key]);
    }
  });

  // Translate title attributes (like title="Haz clic...")
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) {
      el.title = dict[key];
    }
  });
}

// Expose to window object
window.translations = translations;
window.getDefaultLanguage = getDefaultLanguage;
window.translatePage = translatePage;
