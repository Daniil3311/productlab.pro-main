import Quill from 'quill';

const Video = Quill.import('formats/video'); // Had to get the class this way, instead of ES6 imports, so that quill could register it without errors

const ATTRIBUTES = [
  'alt',
  'height',
  'width',
  'class', 
  'style', // Had to add this line because the style was inlined
];

class CustomVideo extends Video {
  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      const copy = { ...formats };

      if (domNode.hasAttribute(attribute)) {
        copy[attribute] = domNode.getAttribute(attribute);
      }

      return copy;
    }, {});
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

export default CustomVideo;