CMS.registerPreviewTemplate('events', createClass({
  render: function() {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title']);
    const date = entry.getIn(['data', 'date']);
    const description = entry.getIn(['data', 'description']);
    const linkText = entry.getIn(['data', 'linkText']) || "Plus d'informations";
    const link = entry.getIn(['data', 'link']) || "#contact";
    
    // Pour l'aperçu de l'image
    let image = entry.getIn(['data', 'image']);
    if (image) {
      image = this.props.getAsset(image);
    }

    return h('div', {className: 'event-card'},
      h('h4', {className: 'event-date'}, date),
      h('h3', {className: 'event-title'}, title),
      image && h('div', {className: 'event-image-preview'}, 
        h('img', {src: image.toString(), alt: title})
      ),
      h('p', {className: 'event-description'}, description),
      h('a', {className: 'read-more', href: link}, linkText)
    );
  }
})); 