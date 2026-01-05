// Custom Mermaid Configuration
// Enhances diagram appearance with rounded corners, custom colors, and theme matching

document.addEventListener('DOMContentLoaded', function() {
  // Wait for Mermaid to be available
  const checkMermaid = setInterval(function() {
    if (typeof mermaid !== 'undefined') {
      clearInterval(checkMermaid);
      initializeMermaid();
    }
  }, 100);
});

function initializeMermaid() {
  // Detect current theme
  const isDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';
  
  // Custom theme configuration
  const themeConfig = {
    theme: 'base',
    themeVariables: isDarkMode ? {
      // Dark mode colors
      primaryColor: 'rgba(103, 58, 183, 0.25)',
      primaryBorderColor: '#7c4dff',
      primaryTextColor: '#e0e0e0',
      secondaryColor: 'rgba(0, 188, 212, 0.15)',
      secondaryBorderColor: '#00bcd4',
      secondaryTextColor: '#e0e0e0',
      tertiaryColor: 'rgba(255, 255, 255, 0.05)',
      tertiaryBorderColor: 'rgba(255, 255, 255, 0.2)',
      tertiaryTextColor: '#e0e0e0',
      lineColor: 'rgba(255, 255, 255, 0.5)',
      textColor: '#e0e0e0',
      mainBkg: 'rgba(103, 58, 183, 0.2)',
      nodeBorder: '#7c4dff',
      clusterBkg: 'rgba(255, 255, 255, 0.03)',
      clusterBorder: 'rgba(255, 255, 255, 0.15)',
      titleColor: '#e0e0e0',
      edgeLabelBackground: '#1e1e2e',
      // Sequence diagram specific
      actorBkg: 'rgba(103, 58, 183, 0.2)',
      actorBorder: '#7c4dff',
      actorTextColor: '#e0e0e0',
      actorLineColor: 'rgba(255, 255, 255, 0.4)',
      signalColor: 'rgba(255, 255, 255, 0.5)',
      signalTextColor: '#b0b0b0',
      labelBoxBkgColor: 'rgba(0, 188, 212, 0.1)',
      labelBoxBorderColor: '#00bcd4',
      labelTextColor: '#e0e0e0',
      loopTextColor: '#b0b0b0',
      noteBorderColor: '#00bcd4',
      noteBkgColor: 'rgba(0, 188, 212, 0.1)',
      noteTextColor: '#e0e0e0',
      // Flowchart specific
      nodeTextColor: '#e0e0e0',
    } : {
      // Light mode colors
      primaryColor: 'rgba(103, 58, 183, 0.12)',
      primaryBorderColor: '#673ab7',
      primaryTextColor: '#37474f',
      secondaryColor: 'rgba(0, 150, 136, 0.1)',
      secondaryBorderColor: '#009688',
      secondaryTextColor: '#37474f',
      tertiaryColor: 'rgba(0, 0, 0, 0.03)',
      tertiaryBorderColor: 'rgba(0, 0, 0, 0.15)',
      tertiaryTextColor: '#37474f',
      lineColor: 'rgba(0, 0, 0, 0.5)',
      textColor: '#37474f',
      mainBkg: 'rgba(103, 58, 183, 0.1)',
      nodeBorder: '#673ab7',
      clusterBkg: 'rgba(0, 0, 0, 0.02)',
      clusterBorder: 'rgba(0, 0, 0, 0.1)',
      titleColor: '#37474f',
      edgeLabelBackground: '#ffffff',
      // Sequence diagram specific
      actorBkg: 'rgba(103, 58, 183, 0.1)',
      actorBorder: '#673ab7',
      actorTextColor: '#37474f',
      actorLineColor: 'rgba(0, 0, 0, 0.3)',
      signalColor: 'rgba(0, 0, 0, 0.5)',
      signalTextColor: '#546e7a',
      labelBoxBkgColor: 'rgba(0, 150, 136, 0.08)',
      labelBoxBorderColor: '#009688',
      labelTextColor: '#37474f',
      loopTextColor: '#546e7a',
      noteBorderColor: '#009688',
      noteBkgColor: 'rgba(0, 150, 136, 0.08)',
      noteTextColor: '#37474f',
      // Flowchart specific
      nodeTextColor: '#37474f',
    },
    flowchart: {
      curve: 'basis',
      padding: 15,
      nodeSpacing: 50,
      rankSpacing: 50,
      htmlLabels: true,
      useMaxWidth: true,
    },
    sequence: {
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      mirrorActors: true,
      bottomMarginAdj: 1,
      useMaxWidth: true,
      rightAngles: false,
      showSequenceNumbers: false,
    },
  };

  // Re-initialize Mermaid with custom config
  mermaid.initialize(themeConfig);

  // Listen for theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-md-color-scheme') {
        // Theme changed, re-render diagrams
        location.reload();
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme']
  });
}

