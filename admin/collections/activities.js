CMS.registerPreviewTemplate('activities', createClass({
  render: function() {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title']);
    const description = entry.getIn(['data', 'description']);
    const linkText = entry.getIn(['data', 'linkText']) || "En savoir plus";
    const link = entry.getIn(['data', 'link']) || "#contact";
    
    // Pour l'aperçu de l'image
    let image = entry.getIn(['data', 'image']);
    if (image) {
      image = this.props.getAsset(image);
    }

    return h('div', {className: 'activity-preview'},
      h('div', {className: 'activity-card'},
        h('div', {className: 'activity-image-preview'},
          image && h('img', {src: image.toString(), alt: title, style: {maxWidth: '100%', maxHeight: '300px'}})
        ),
        h('div', {className: 'activity-content'},
          h('h3', {}, title),
          h('div', {dangerouslySetInnerHTML: {__html: description}}),
          h('a', {className: 'read-more', href: link}, linkText)
        )
      ),
      h('p', {className: 'activity-order'}, 'Ordre d\'affichage: ' + (entry.getIn(['data', 'order']) || 1))
    );
  }
})); 