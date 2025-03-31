CMS.registerPreviewTemplate('partners', createClass({
  render: function() {
    const entry = this.props.entry;
    const name = entry.getIn(['data', 'name']);
    const url = entry.getIn(['data', 'url']);
    
    // Pour l'aperçu de l'image
    let logo = entry.getIn(['data', 'logo']);
    if (logo) {
      logo = this.props.getAsset(logo);
    }

    return h('div', {className: 'partner-preview'},
      h('h3', {className: 'partner-name'}, name),
      logo && h('div', {className: 'partner-logo-preview'}, 
        h('img', {src: logo.toString(), alt: name, style: {maxWidth: '200px', maxHeight: '120px'}})
      ),
      h('p', {className: 'partner-url'}, 
        h('a', {href: url, target: '_blank'}, url)
      ),
      h('p', {className: 'partner-order'}, 'Ordre d\'affichage: ' + (entry.getIn(['data', 'order']) || 1))
    );
  }
})); 