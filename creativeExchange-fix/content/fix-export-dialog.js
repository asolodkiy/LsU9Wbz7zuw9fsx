(function () {
  'use strict';

  const MULTIFIELD_ID = 'cePaths';
  const LOG_PREFIX = '[Creative Exchange Fix]';

  const PATHBROWSER_FIELD = `
    <div class="coral-Form-fieldwrapper">
      <span
        class="coral-Form-field coral-PathBrowser"
        data-init="pathbrowser"
        data-root-path="/content"
        data-option-loader="granite.ui.pathBrowser.pages.hierarchyNotFile"
        data-picker-src="/libs/wcm/core/content/common/pathbrowser/column.html/content?predicate=hierarchyNotFile"
        data-picker-title="Select Path"
        data-crumb-root="content"
        data-picker-multiselect="false"
        data-root-path-valid-selection="true"
      >
        <span class="coral-InputGroup coral-InputGroup--block">
          <input
            class="coral-InputGroup-input coral-Textfield js-coral-pathbrowser-input"
            type="text"
            name="path"
            autocomplete="off"
            value=""
            aria-required="true"
            data-validation=""
          />
          <span class="coral-InputGroup-button">
            <button
              class="coral-Button coral-Button--square js-coral-pathbrowser-button"
              type="button"
              title="Browse"
            >
              <i class="coral-Icon coral-Icon--sizeS coral-Icon--folderSearch"></i>
            </button>
          </span>
        </span>
      </span>
    </div>
  `;

  const ITEM_CONTENT = `<div>${PATHBROWSER_FIELD}</div>`;

  const log = function (message) {
    console.info(LOG_PREFIX, message);
  };

  const initGraniteComponents = function (root) {
    if (!root) {
      return;
    }

    if (window.Granite !== undefined && window.Granite.$) {
      window.Granite.$(root).trigger('foundation-contentloaded');
      return;
    }

    if (window.Coral !== undefined && window.Coral.commons) {
      window.Coral.commons.ready(function () {
        root.querySelectorAll('[data-init="pathbrowser"]').forEach(function (element) {
          if (element.pathBrowser) {
            return;
          }
        });
      });
    }
  };

  const createRemoveButton = function () {
    const removeBtn = document.createElement('button');
    removeBtn.setAttribute('is', 'coral-button');
    removeBtn.setAttribute('coral-multifield-remove', '');
    removeBtn.className = 'coral3-Button coral3-Button--quiet coral3-Multifield-remove';
    removeBtn.setAttribute('size', 'M');
    removeBtn.setAttribute('variant', 'quiet');
    removeBtn.type = 'button';
    removeBtn.title = 'Remove';
    removeBtn.setAttribute('aria-label', 'Remove');
    removeBtn.innerHTML =
      '<coral-icon class="coral3-Icon coral3-Icon--sizeS coral3-Icon--delete" icon="delete" size="S" autoarialabel="on" role="img" aria-label="Delete" aria-hidden="true"></coral-icon><coral-button-label></coral-button-label>';
    return removeBtn;
  };

  const createMoveButton = function () {
    const moveBtn = document.createElement('button');
    moveBtn.setAttribute('is', 'coral-button');
    moveBtn.setAttribute('coral-multifield-move', '');
    moveBtn.className = 'coral3-Button coral3-Button--quiet coral3-Multifield-move u-coral-openHand';
    moveBtn.setAttribute('size', 'M');
    moveBtn.setAttribute('variant', 'quiet');
    moveBtn.type = 'button';
    moveBtn.title = 'Drag and drop or use the up and down arrow keys to reorder.';
    moveBtn.setAttribute('aria-label', 'Reorder');
    moveBtn.innerHTML =
      '<coral-icon class="coral3-Icon coral3-Icon--sizeS coral3-Icon--moveUpDown" icon="moveUpDown" size="S" autoarialabel="on" role="img" aria-label="Move Up or Down" aria-hidden="true"></coral-icon><coral-button-label></coral-button-label>';
    return moveBtn;
  };

  const createMultifieldItem = function (contentHtml) {
    const item = document.createElement('coral-multifield-item');
    item.className = 'coral3-Multifield-item';
    item.setAttribute('role', 'listitem');

    const itemContent = document.createElement('coral-multifield-item-content');
    itemContent.innerHTML = contentHtml;
    item.appendChild(itemContent);
    item.appendChild(createRemoveButton());
    item.appendChild(createMoveButton());

    return item;
  };

  const ensureTemplate = function (multifield) {
    let template = multifield.querySelector('template[coral-multifield-template]');

    if (!template) {
      template = document.createElement('template');
      template.setAttribute('coral-multifield-template', '');
      multifield.appendChild(template);
    }

    if (!template.content.querySelector('.coral-PathBrowser')) {
      template.innerHTML = ITEM_CONTENT;
    }

    return template;
  };

  const ensureAddButton = function (multifield) {
    let addBtn = multifield.querySelector('[coral-multifield-add]');

    if (!addBtn) {
      addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.setAttribute('is', 'coral-button');
      addBtn.setAttribute('coral-multifield-add', '');
      addBtn.className = 'coral3-Button coral3-Button--secondary';
      addBtn.setAttribute('size', 'M');
      addBtn.setAttribute('variant', 'secondary');
      addBtn.innerHTML = '<coral-button-label>Add</coral-button-label>';
      multifield.appendChild(addBtn);
    }

    return addBtn;
  };

  const getTemplateHtml = function (multifield) {
    const template = ensureTemplate(multifield);
    return template.innerHTML || ITEM_CONTENT;
  };

  const addMultifieldItem = function (multifield, addBtn) {
    const itemsCountBefore = multifield.querySelectorAll('coral-multifield-item').length;

    if (multifield.items && typeof multifield.items.add === 'function') {
      try {
        multifield.items.add();
        const itemsCountAfter = multifield.querySelectorAll('coral-multifield-item').length;
        if (itemsCountAfter > itemsCountBefore) {
          initGraniteComponents(multifield);
          return;
        }
      } catch (error) {
        log('Coral Multifield items.add() failed, using manual fallback.');
        console.warn(error);
      }
    }

    const newItem = createMultifieldItem(getTemplateHtml(multifield));
    addBtn.before(newItem);
    initGraniteComponents(newItem);
  };

  const bindAddButton = function (multifield, addBtn) {
    if (addBtn.dataset.ceAddBound === 'true') {
      return;
    }

    addBtn.dataset.ceAddBound = 'true';

    addBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      addMultifieldItem(multifield, addBtn);
    });
  };

  const bindRemoveButtons = function (multifield) {
    multifield.querySelectorAll('[coral-multifield-remove]').forEach(function (removeBtn) {
      if (removeBtn.dataset.ceRemoveBound === 'true') {
        return;
      }

      removeBtn.dataset.ceRemoveBound = 'true';

      removeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const item = removeBtn.closest('coral-multifield-item');
        if (!item) {
          return;
        }

        const items = multifield.querySelectorAll('coral-multifield-item');
        if (items.length <= 1) {
          const input = item.querySelector('.js-coral-pathbrowser-input');
          if (input) {
            input.value = '';
          }
          return;
        }

        if (multifield.items && typeof multifield.items.remove === 'function') {
          try {
            multifield.items.remove(item);
            return;
          } catch (error) {
            console.warn(error);
          }
        }

        item.remove();
      });
    });
  };

  const fixMultifieldItems = function (multifield) {
    const items = multifield.querySelectorAll('coral-multifield-item');

    items.forEach(function (item) {
      const content = item.querySelector('coral-multifield-item-content');
      if (!content) {
        return;
      }

      if (!content.querySelector('.coral-PathBrowser')) {
        content.innerHTML = ITEM_CONTENT;
      }

      if (!item.querySelector('[coral-multifield-remove]')) {
        item.appendChild(createRemoveButton());
      }

      if (!item.querySelector('[coral-multifield-move]')) {
        item.appendChild(createMoveButton());
      }
    });
  };

  const fixMultifield = function (multifield) {
    if (multifield.dataset.ceFixApplied === 'true') {
      bindRemoveButtons(multifield);
      return;
    }

    log('Fixing Creative Exchange paths multifield.');

    ensureTemplate(multifield);
    const addBtn = ensureAddButton(multifield);
    fixMultifieldItems(multifield);

    const items = multifield.querySelectorAll('coral-multifield-item');
    if (items.length === 0) {
      addBtn.before(createMultifieldItem(ITEM_CONTENT));
    }

    bindAddButton(multifield, addBtn);
    bindRemoveButtons(multifield);
    initGraniteComponents(multifield);

    multifield.dataset.ceFixApplied = 'true';
    log('Multifield fix applied.');
  };

  const scan = function () {
    const multifield = document.getElementById(MULTIFIELD_ID);
    if (!multifield) {
      return;
    }

    fixMultifield(multifield);
  };

  const observer = new MutationObserver(function () {
    scan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }
})();
