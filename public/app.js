import $ from 'jquery';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import customTranslate from './customTranslate/customTranslate';

import CustomContextPadProvider from './customContextPad/CustomContextPadProvider';

import CustomPaletteProvider from './CustomPaletteProvider';

import CustomMenuProvider from './CustomMenuProvider';

import Connection from 'diagram-js/lib/features/connect';

import diagramXML from '../resources/newDiagram.bpmn';


var container = $('#js-drop-zone');

var bpmnXML = '';

var flag = -1;

var customTranslateModule = {
  translate: ['value', customTranslate]
};

var customContextPadModule = {
  contextPadProvider: [ 'type', CustomContextPadProvider ]
};

var customMenuModule = {
  replaceMenuProvider:['type',CustomMenuProvider]
}

var customPaletteModule = {
  paletteProvider: [ 'type', CustomPaletteProvider ]
}

var modeler = new BpmnModeler({
  container: '#js-canvas',
  keyboard: {bindTo:document},
  additionalModules: [
    customTranslateModule,
    customContextPadModule,
    customMenuModule,
    customPaletteModule
  ]
});

var commandStack = modeler.get('commandStack');

var elementRegistry = modeler.get('elementRegistry');
var modeling = modeler.get('modeling');

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {
  modeler.importXML(xml, function (err) {

    if (err) {
      flag = -1;
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      flag = 0;
      container
        .removeClass('with-error')
        .addClass('with-diagram');
      if(xml.indexOf('xmlns:bpmn2') < 0) {//老版第一次载入
        adaptBpmn();
      }
      //modeler.get('canvas').zoom('fit-viewport');
    }

  });
}

//适配老设计器生成的bpmn文件（xml）
function adaptBpmn() {
  console.info("适配老版本xml");
  var eles = elementRegistry.filter(function (element, gfx) {
    return element.type === "bpmn:SequenceFlow";
  });
  //modeling.removeElements(eles);
  var s, t, p;
  for(var i = 0; i < eles.length; i++){
    s = eles[i].source;
    t = eles[i].target;
    p = eles[i].parent;
    modeling.removeElements([eles[i]]);
    modeling.connect(s,t,undefined,p);
  }
}

function switched(btn) {
  if(flag === 0){
    flag = 1;
    container
      .removeClass('with-diagram')
      .addClass('with-error');

    container.find('.error pre').text(bpmnXML);
    btn.text('设计器');
    $('.bpmn-control').addClass('xml');
  }else{
    flag = 0;
    container
      .removeClass('with-error')
      .addClass('with-diagram');
    btn.text('显示xml');
    $('.bpmn-control').removeClass('xml');
  }
}

function showKeyboardDialog() {
  var t = $('.keybindings-dialog'), n = navigator.platform;
  /Mac/.test(n) ? t.find(".bindings-default").remove() : t.find(".bindings-mac").remove();
  S(t);

}

function S(e) {
  var t = e.find(".content");

  function n(e) {
    e.stopPropagation()
  }

  e["addClass"]("open");
  t.on("click", n);
  e.on("click", function i(r) {
    e["removeClass"]("open");
    e.off("click", i);
    t.off("click", n)
  })
}

function toggleFullscreen() {
  var e, t = document.querySelector("html");
  e = t, document.fullscreenElement || document.mozFullScreenElement
  || document.webkitFullscreenElement
  || document.msFullscreenElement ? document.exitFullscreen ? document.exitFullscreen()
    : document.msExitFullscreen ? document.msExitFullscreen()
      : document.mozCancelFullScreen ? document.mozCancelFullScreen()
        : document.webkitExitFullscreen && document.webkitExitFullscreen()
    : e.requestFullscreen ? e.requestFullscreen()
      : e.msRequestFullscreen ? e.msRequestFullscreen()
        : e.mozRequestFullScreen ? e.mozRequestFullScreen()
          : document.documentElement.webkitRequestFullscreen && e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)

}

function save() {

}

function undo() {
  console.info(commandStack);
  commandStack.undo();
}

function redo() {
  commandStack.redo();
}

function saveSVG(done) {
  modeler.saveSVG(done);
}

function saveDiagram(done) {

  modeler.saveXML({ format: true,preamble:true }, function(err, xml) {
    done(err, xml);
  });
}

// bootstrap diagram functions
$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('#js-save').click(function (e) {
    save();
  });

  $('#js-switch').click(function (e) {
    if(flag === 0){
      saveDiagram(function(err, xml) {
        setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        bpmnXML = xml;
        switched($('#js-switch'));
      });
    }else {
      switched($('#js-switch'));
    }
  });

  $('#js-undo').click(function (e) {
    undo();
  });

  $('#js-redo').click(function (e) {
    redo();
  });

  $('#js-fresh').click(function (e) {
    createNewDiagram();
    downloadSvgLink.removeClass('active');
  });

  $('#zoom-reset').click(function (e) {
    modeler.get("zoomScroll").reset();
  });

  $('#zoom-in').click(function (e) {
    modeler.get("zoomScroll").stepZoom(1);
  });

  $('#zoom-out').click(function (e) {
    modeler.get("zoomScroll").stepZoom(-1);
  });

  $('.io-tool a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  $('#js-keyboard').click(function (e) {
    showKeyboardDialog();
  });
  $('#js-full').click(function (e) {
    toggleFullscreen();
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    // saveDiagram(function(err, xml) {
    //   setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    //   bpmnXML = xml;
    // });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
  createNewDiagram();
});


// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}