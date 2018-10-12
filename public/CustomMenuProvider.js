import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isEventSubProcess,
  isExpanded
} from 'bpmn-js/lib/util/DiUtil';

import {
  isDifferentType
} from 'bpmn-js/lib/features/popup-menu/util/TypeUtil';

import {
  forEach,
  filter
} from 'min-dash';

/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
export default function CustomMenuProvider(
  popupMenu, modeling, moddle,
  rules, translate) {

  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._rules = rules;
  this._translate = translate;

  this.register();
}

CustomMenuProvider.$inject = [
  'popupMenu',
  'modeling',
  'moddle',
  'rules',
  'translate'
];

/**
 * Register replace menu provider in the popup menu
 */
CustomMenuProvider.prototype.register = function() {
  this._popupMenu.registerProvider('ibpmn-option', this);
};

/**
 * 获取所有菜单项
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
CustomMenuProvider.prototype.getEntries = function(element) {
  var businessObject = element.businessObject;

  var rules = this._rules;

  var menuEntries = [];

  menuEntries.push(this._createMenuEntry({label:"菜单1",actionName:"ibpmn-menu-1",className:"bpmn-icon-manual"}, element,function() {
    console.info(businessObject);
    alert("菜单1\n");

  }));
  menuEntries.push(this._createMenuEntry({label:"菜单2",actionName:"ibpmn-menu-1",className:"bpmn-icon-manual"}, element,function() {
    alert("菜单2\n");
  }));
  return menuEntries;

}

CustomMenuProvider.prototype._createMenuEntry = function(definition, element, action) {
  var translate = this._translate;

  var menuEntry = {
    label: translate(definition.label),
    className: definition.className,
    id: definition.actionName,
    action: action
  };
  // console.info(menuEntry);
  return menuEntry;
};