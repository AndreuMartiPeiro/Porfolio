/**
 * app.js — SPA Router & Rendering Engine
 * Aerospace Portfolio
 */

(function () {
  'use strict';

  // DOM references
  const app = document.getElementById('app');
  const landingView = document.getElementById('landing-view');
  const projectView = document.getElementById('project-view');
  const backBtn = document.getElementById('navbar-back');
  const brandLink = document.getElementById('navbar-brand');

  // ========== Stars Background ==========
  function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = 200;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2
        });
      }
    }

    let time = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 225, 215, ${s.opacity * twinkle})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();
    window.addEventListener('resize', () => { resize(); createStars(); });
  }

  // ========== Render Landing ==========
  function renderLanding() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    PROJECTS.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.style.animationDelay = `${0.1 + index * 0.1}s`;
      card.setAttribute('data-project-id', project.id);

      const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');

      card.innerHTML = `
        <div class="project-card-image">
          <img src="${project.image}" alt="${project.title}" />
          <span class="project-card-status">${project.status}</span>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-desc">${project.description}</p>
          <div class="project-card-tags">${tagsHTML}</div>
        </div>
        <div class="project-card-footer">
          <span class="project-card-date">${project.date}</span>
          <span class="project-card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </div>
      `;

      card.addEventListener('click', () => navigateTo(project.id));
      grid.appendChild(card);
    });
  }

  // ========== Render Project ==========
  function renderProject(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) { navigateTo(''); return; }

    const heroEl = document.getElementById('project-hero');
    const tabsEl = document.getElementById('section-tabs');
    const contentEl = document.getElementById('section-content');

    // Hero
    const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const heroImageHTML = project.image ? `
      <div class="project-hero-image">
        <img src="${project.image}" alt="${project.title}" />
      </div>
    ` : '';
    heroEl.innerHTML = `
      ${heroImageHTML}
      <h1>${project.title}</h1>
      <p class="project-subtitle">${project.subtitle}</p>
      <div class="project-hero-tags">${tagsHTML}</div>
    `;

    // Tabs
    tabsEl.innerHTML = '';
    project.sections.forEach((section, i) => {
      const tab = document.createElement('button');
      tab.className = 'section-tab' + (i === 0 ? ' active' : '');
      tab.innerHTML = `<span class="section-tab-icon">${i + 1}</span> ${section.title}`;
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderSection(section, contentEl);
      });
      tabsEl.appendChild(tab);
    });

    // Render first section
    if (project.sections.length > 0) {
      renderSection(project.sections[0], contentEl);
    }
  }

  // ========== Render Section ==========
  function renderSection(section, container) {
    const softwareHTML = section.software.length > 0
      ? `<div class="software-list">${section.software.map(s => `<span class="software-badge">${s}</span>`).join('')}</div>`
      : '';

    let stepsHTML = '';
    section.steps.forEach((step, i) => {
      // Check if this is the parametric study step with substeps
      if (step.isParametricStudy) {
        stepsHTML += renderParametricStep(step, i);
      } else if (step.isOffDesignStudy) {
        stepsHTML += renderOffDesignStep(step, i);
      } else {
        stepsHTML += renderNormalStep(step, i);
      }
    });

    container.innerHTML = `
      <div class="section-content">
        <div class="section-content-header">
          <h2 class="section-content-title">${section.title}</h2>
          <p class="section-content-summary">${section.summary}</p>
          ${softwareHTML}
        </div>
        <div class="timeline">
          ${stepsHTML}
        </div>
      </div>
    `;

    // Re-trigger animations
    container.querySelectorAll('.timeline-item').forEach(item => {
      item.style.opacity = '0';
      requestAnimationFrame(() => { item.style.opacity = ''; });
    });

    // Initialize Plotly charts after DOM is ready
    requestAnimationFrame(() => {
      initializeCharts(container);
    });
  }

  // ========== Render Normal Step ==========
  function renderNormalStep(step, i) {
    let imagesHTML = '';
    if (step.images && step.images.length > 0) {
      imagesHTML = step.images.map(img => `<div class="timeline-card-image" style="margin-top: 1rem;"><img src="${img}" alt="${step.title}" /></div>`).join('');
    } else if (step.image) {
      imagesHTML = `<div class="timeline-card-image" style="margin-top: 1rem;"><img src="${step.image}" alt="${step.title}" onerror="this.parentElement.outerHTML='<div class=\\'image-placeholder\\'><span class=\\'image-placeholder-icon\\'>—</span><span>Imagen pendiente</span></div>'" /></div>`;
    }

    const contentHTML = step.contentHTML ? `<div class="custom-html-content">${step.contentHTML}</div>` : '';
    const descHTML = step.description ? `<p class="timeline-card-desc">${step.description}</p>` : '';

    return `
      <div class="timeline-item" style="animation-delay: ${0.1 + i * 0.1}s">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card">
          <div class="timeline-card-header" onclick="this.parentElement.classList.toggle('expanded')">
            <div>
              <div class="timeline-step-number">Paso ${i + 1}</div>
              <h3 class="timeline-card-title" style="margin-bottom: 0;">${step.title}</h3>
            </div>
            <div class="expand-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div class="timeline-card-body">
            ${descHTML}
            ${contentHTML}
            ${imagesHTML}
          </div>
        </div>
      </div>
    `;
  }

  // ========== Render Parametric Study Step ==========
  function renderParametricStep(step, i) {
    // Download box
    const downloadHTML = step.downloadFile ? `
      <div class="download-box">
        <div class="download-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div class="download-box-content">
          <div class="download-box-title">Datos del Estudio Paramétrico</div>
          <div class="download-box-desc">Archivo Excel exportado de GasTurb con todos los datos del estudio paramétrico (Burner Exit Temperature vs HP Compressor Pressure Ratio).</div>
        </div>
        <a href="${step.downloadFile}" download class="download-box-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar .xlsx
        </a>
      </div>
    ` : '';

    // Substeps with charts (NO ACCORDION)
    let substepsHTML = '';
    if (step.substeps) {
      step.substeps.forEach((sub, j) => {
        substepsHTML += `
          <div class="parametric-substep">
            <div class="parametric-substep-header">
              <div>
                <div class="parametric-substep-number">Gráfico ${j + 1} de ${step.substeps.length}</div>
                <h4 class="parametric-substep-title">${sub.title}</h4>
              </div>
            </div>
            <div class="parametric-substep-body">
              <p class="parametric-substep-desc">${sub.description}</p>
              <div class="chart-container" id="${sub.chartId}" data-chart-type="${sub.chartType}" data-chart-config="${sub.chartConfig}"></div>
            </div>
          </div>
        `;
      });
    }

    const isExpanded = step.isExpandedByDefault ? 'expanded' : '';

    return `
      <div class="timeline-item" style="animation-delay: ${0.1 + i * 0.1}s">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card ${isExpanded}">
          <div class="timeline-card-header" onclick="this.parentElement.classList.toggle('expanded')">
            <div>
              <div class="timeline-step-number">Paso ${i + 1}</div>
              <h3 class="timeline-card-title" style="margin-bottom: 0;">${step.title}</h3>
            </div>
            <div class="expand-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div class="timeline-card-body">
            <p class="timeline-card-desc">${step.description}</p>
            ${downloadHTML}
            <div class="parametric-substeps">
              ${substepsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== Initialize Plotly Charts ==========
  function initializeCharts(container) {
    const chartContainers = container.querySelectorAll('.chart-container');
    chartContainers.forEach(el => {
      const type = el.dataset.chartType;
      const config = el.dataset.chartConfig;

      const parentCard = el.closest('.timeline-card');
      
      const tryRender = () => {
        if (parentCard && parentCard.classList.contains('expanded')) {
          if (!el.dataset.initialized) {
            el.dataset.initialized = 'true';
            setTimeout(() => renderChart(el, type, config), 100);
          } else {
            try { Plotly.Plots.resize(el); } catch(e) {}
          }
        }
      };

      // Try render immediately for default expanded cards
      tryRender();

      // Observe when the parent card is toggled
      const observer = new MutationObserver(() => {
        tryRender();
      });

      if (parentCard) {
        observer.observe(parentCard, { attributes: true, attributeFilter: ['class'] });
      }
    });
  }

  // ========== Render Individual Chart ==========
  function renderChart(el, type, config) {
    if (typeof Plotly === 'undefined' || typeof PARAMETRIC_DATA === 'undefined') {
      el.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Cargando datos...</p>';
      return;
    }

    const data = PARAMETRIC_DATA;
    const darkLayout = {
      paper_bgcolor: 'rgba(13, 13, 13, 0)',
      plot_bgcolor: 'rgba(26, 26, 26, 0.3)',
      font: { family: 'Inter, sans-serif', color: '#e0ddd9', size: 12 },
      margin: { l: 65, r: 30, t: 50, b: 65 },
      scene: {
        xaxis: { gridcolor: 'rgba(199,91,57,0.15)', title: { font: { size: 12 } } },
        yaxis: { gridcolor: 'rgba(199,91,57,0.15)', title: { font: { size: 12 } } },
        zaxis: { gridcolor: 'rgba(199,91,57,0.15)', title: { font: { size: 12 } } },
        bgcolor: 'rgba(13,13,13,0)'
      },
      modebar: { bgcolor: 'transparent', color: '#9a9590', activecolor: '#c75b39' }
    };

    const plotlyConfig = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      displayModeBar: true
    };

    if (config === 'tsfc') {
      renderSurface3D(el, data, 'TSFC', 'TSFC [g/(kN*s)]', 'Análisis Paramétrico: Consumo Específico (TSFC)',
        [[0, '#0d47a1'], [0.25, '#1976d2'], [0.5, '#4fc3f7'], [0.75, '#fff176'], [1, '#e53935']],
        darkLayout, plotlyConfig);
    } else if (config === 'thrust') {
      renderSurface3D(el, data, 'Thrust', 'Net Thrust [kN]', 'Análisis Paramétrico: Empuje Neto',
        [[0, '#b71c1c'], [0.25, '#e65100'], [0.5, '#ff8f00'], [0.75, '#fdd835'], [1, '#fff9c4']],
        darkLayout, plotlyConfig);
    } else if (config === 'carpet') {
      renderCarpetPlot(el, data, darkLayout, plotlyConfig);
    } else if (config === 'flightprofile') {
      renderOffDesignChart(el, darkLayout, plotlyConfig);
    }
  }

  // ========== 3D Surface Chart ==========
  function renderSurface3D(el, data, zKey, zLabel, title, colorscale, layout, config) {
    const zData = data[zKey];

    const surface = {
      type: 'surface',
      x: data.TET,
      y: data.PR,
      z: zData,
      colorscale: colorscale,
      colorbar: {
        title: { text: zLabel, side: 'right', font: { size: 11 } },
        thickness: 15,
        len: 0.75,
        tickfont: { size: 10 }
      },
      lighting: { ambient: 0.6, diffuse: 0.7, specular: 0.3, roughness: 0.5 },
      contours: {
        z: { show: true, usecolormap: true, highlightcolor: '#fff', project: { z: false } }
      },
      hovertemplate: 'TET: %{x:.0f} K<br>HP PR: %{y:.2f}<br>' + zLabel + ': %{z:.3f}<extra></extra>'
    };

    // Add design point marker
    const designMarker = {
      type: 'scatter3d',
      x: [data.designPoint.TET],
      y: [data.designPoint.PR],
      z: [zKey === 'TSFC' ? data.designPoint.TSFC : data.designPoint.Thrust],
      mode: 'markers+text',
      marker: { size: 6, color: '#ff1744', symbol: 'diamond' },
      text: ['F107-WR-402'],
      textposition: 'top center',
      textfont: { color: '#ff1744', size: 11, family: 'Inter' },
      hovertemplate: '<b>Punto de Diseño F107</b><br>TET: 1227 K<br>HP PR: 6.06<br>' + zLabel + ': ' +
        (zKey === 'TSFC' ? '22.83' : '2.90') + '<extra></extra>',
      showlegend: false
    };

    const surfaceLayout = {
      ...layout,
      title: { text: title, font: { size: 14, color: '#e0ddd9' }, x: 0.5 },
      scene: {
        ...layout.scene,
        xaxis: { ...layout.scene.xaxis, title: 'Burner Exit Temperature [K]' },
        yaxis: { ...layout.scene.yaxis, title: 'HP Compressor Pressure Ratio' },
        zaxis: { ...layout.scene.zaxis, title: zLabel },
        camera: { eye: { x: -1.5, y: -1.8, z: 0.8 } }
      }
    };

    Plotly.newPlot(el, [surface, designMarker], surfaceLayout, config);
  }

  // ========== 2D Carpet Plot ==========
  function renderCarpetPlot(el, data, layout, config) {
    const traces = [];

    // Lines of constant Temperature (blue)
    for (let j = 0; j < data.TET.length; j++) {
      const xVals = [], yVals = [];
      for (let i = 0; i < data.PR.length; i++) {
        xVals.push(data.Thrust[i][j]);
        yVals.push(data.TSFC[i][j]);
      }
      traces.push({
        type: 'scatter',
        x: xVals,
        y: yVals,
        mode: 'lines',
        line: { color: 'rgba(25, 118, 210, 0.6)', width: 1.2 },
        hovertemplate: `TET = ${data.TET[j].toFixed(0)} K<br>Thrust: %{x:.3f} kN<br>TSFC: %{y:.3f} g/(kN*s)<extra></extra>`,
        showlegend: false
      });
    }

    // Lines of constant Pressure Ratio (dark/white)
    for (let i = 0; i < data.PR.length; i++) {
      const xVals = [], yVals = [];
      for (let j = 0; j < data.TET.length; j++) {
        xVals.push(data.Thrust[i][j]);
        yVals.push(data.TSFC[i][j]);
      }
      traces.push({
        type: 'scatter',
        x: xVals,
        y: yVals,
        mode: 'lines',
        line: { color: 'rgba(224, 221, 217, 0.4)', width: 1 },
        hovertemplate: `HP PR = ${data.PR[i].toFixed(2)}<br>Thrust: %{x:.3f} kN<br>TSFC: %{y:.3f} g/(kN*s)<extra></extra>`,
        showlegend: false
      });
    }

    // Design point
    traces.push({
      type: 'scatter',
      x: [data.designPoint.Thrust],
      y: [data.designPoint.TSFC],
      mode: 'markers+text',
      marker: { size: 12, color: '#ff1744', symbol: 'star' },
      text: ['  F107-WR-402 (Diseño)'],
      textposition: 'middle right',
      textfont: { color: '#ff1744', size: 12, family: 'Inter, sans-serif' },
      hovertemplate: '<b>Punto de Diseño F107</b><br>Thrust: 2.90 kN<br>TSFC: 22.83 g/(kN*s)<br>TET: 1227 K<br>HP PR: 6.06<extra></extra>',
      showlegend: false
    });

    const carpetLayout = {
      ...layout,
      title: { text: 'Carpet Plot: Thrust vs TSFC', font: { size: 14, color: '#e0ddd9' }, x: 0.5 },
      xaxis: {
        title: { text: 'Net Thrust [kN]', font: { size: 12 } },
        gridcolor: 'rgba(199,91,57,0.12)',
        zerolinecolor: 'rgba(199,91,57,0.2)',
        color: '#e0ddd9'
      },
      yaxis: {
        title: { text: 'Sp. Fuel Consumption [g/(kN*s)]', font: { size: 12 } },
        gridcolor: 'rgba(199,91,57,0.12)',
        zerolinecolor: 'rgba(199,91,57,0.2)',
        color: '#e0ddd9'
      }
    };

    Plotly.newPlot(el, traces, carpetLayout, config);
  }

  // ========== Render Off-Design Step ==========
  function renderOffDesignStep(step, i) {
    const contentHTML = step.contentHTML ? `<div class="custom-html-content">${step.contentHTML}</div>` : '';
    const descHTML = step.description ? `<p class="timeline-card-desc">${step.description}</p>` : '';
    const isExpanded = step.isExpandedByDefault ? 'expanded' : '';

    return `
      <div class="timeline-item" style="animation-delay: ${0.1 + i * 0.1}s">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card ${isExpanded}">
          <div class="timeline-card-header" onclick="this.parentElement.classList.toggle('expanded')">
            <div>
              <div class="timeline-step-number">Paso ${i + 1}</div>
              <h3 class="timeline-card-title" style="margin-bottom: 0;">${step.title}</h3>
            </div>
            <div class="expand-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div class="timeline-card-body">
            ${descHTML}
            ${contentHTML}
          </div>
        </div>
      </div>
    `;
  }

  // ========== Off-Design Flight Profile Chart ==========
  function renderOffDesignChart(el, layout, config) {
    if (typeof Plotly === 'undefined') {
      el.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Cargando Plotly...</p>';
      return;
    }

    const mach =    [0.30, 0.46, 0.50, 0.60, 0.65, 0.72, 0.80, 0.85];
    const thrust =  [2.858, 2.885, 2.684, 2.644, 2.625, 2.589, 2.543, 2.506];
    const tsfc =    [21.23, 22.91, 23.64, 24.78, 25.40, 26.30, 27.38, 28.06];
    const gross =   [3.693, 4.247, 4.178, 4.528, 4.731, 5.008, 5.349, 5.547];
    const phases =  ['Post-booster', 'Diseño', 'Aceleración', 'Transición', 'Crucero eco.', 'Crucero nom.', 'Crucero rápido', 'Sprint final'];

    // Net Thrust trace (primary y-axis)
    const thrustTrace = {
      type: 'scatter',
      x: mach,
      y: thrust,
      name: 'Net Thrust',
      mode: 'lines+markers',
      line: { color: '#c75b39', width: 3, shape: 'spline' },
      marker: { size: 10, color: '#c75b39', line: { color: '#fff', width: 1.5 } },
      hovertemplate: '<b>%{text}</b><br>Mach: %{x:.2f}<br>Net Thrust: %{y:.3f} kN<extra></extra>',
      text: phases,
      yaxis: 'y'
    };

    // TSFC trace (secondary y-axis)
    const tsfcTrace = {
      type: 'scatter',
      x: mach,
      y: tsfc,
      name: 'TSFC',
      mode: 'lines+markers',
      line: { color: '#4fc3f7', width: 3, shape: 'spline', dash: 'dot' },
      marker: { size: 10, color: '#4fc3f7', symbol: 'diamond', line: { color: '#fff', width: 1.5 } },
      hovertemplate: '<b>%{text}</b><br>Mach: %{x:.2f}<br>TSFC: %{y:.2f} g/(kN·s)<extra></extra>',
      text: phases,
      yaxis: 'y2'
    };

    // Gross Thrust trace (secondary, more subtle)
    const grossTrace = {
      type: 'scatter',
      x: mach,
      y: gross,
      name: 'Gross Thrust',
      mode: 'lines+markers',
      line: { color: 'rgba(199,91,57,0.35)', width: 2, shape: 'spline', dash: 'dash' },
      marker: { size: 7, color: 'rgba(199,91,57,0.5)', symbol: 'triangle-up' },
      hovertemplate: '<b>%{text}</b><br>Mach: %{x:.2f}<br>Gross Thrust: %{y:.3f} kN<extra></extra>',
      text: phases,
      yaxis: 'y'
    };

    // Design point highlight
    const designPt = {
      type: 'scatter',
      x: [0.46],
      y: [2.885],
      name: 'Punto de Diseño',
      mode: 'markers',
      marker: { size: 18, color: 'rgba(255,23,68,0.2)', line: { color: '#ff1744', width: 2.5 }, symbol: 'star' },
      hovertemplate: '<b>Design Point F107</b><br>Mach 0.46<br>FN = 2.885 kN<br>TSFC = 22.91 g/(kN·s)<extra></extra>',
      showlegend: false,
      yaxis: 'y'
    };

    // Cruise zone annotation
    const cruiseZone = {
      type: 'scatter',
      x: [0.65, 0.72, 0.72, 0.65, 0.65],
      y: [2.45, 2.45, 2.95, 2.95, 2.45],
      fill: 'toself',
      fillcolor: 'rgba(138,154,91,0.08)',
      line: { color: 'rgba(138,154,91,0.3)', width: 1, dash: 'dot' },
      name: 'Zona Crucero Tomahawk',
      hoverinfo: 'name',
      showlegend: true,
      yaxis: 'y'
    };

    const chartLayout = {
      ...layout,
      title: { text: 'Rendimiento Off-Design: Perfil de Misión del Tomahawk', font: { size: 14, color: '#e0ddd9' }, x: 0.5 },
      xaxis: {
        title: { text: 'Mach Number', font: { size: 12 } },
        gridcolor: 'rgba(199,91,57,0.1)',
        color: '#e0ddd9',
        range: [0.25, 0.90],
        dtick: 0.1
      },
      yaxis: {
        title: { text: 'Thrust [kN]', font: { size: 12, color: '#c75b39' } },
        gridcolor: 'rgba(199,91,57,0.08)',
        color: '#c75b39',
        side: 'left',
        range: [2.3, 5.8]
      },
      yaxis2: {
        title: { text: 'TSFC [g/(kN·s)]', font: { size: 12, color: '#4fc3f7' } },
        color: '#4fc3f7',
        overlaying: 'y',
        side: 'right',
        range: [20, 30],
        gridcolor: 'rgba(79,195,247,0.06)'
      },
      legend: {
        x: 0.02, y: 0.98,
        bgcolor: 'rgba(13,13,13,0.7)',
        bordercolor: 'rgba(199,91,57,0.2)',
        borderwidth: 1,
        font: { size: 11, color: '#e0ddd9' }
      },
      annotations: [
        {
          x: 0.685,
          y: 2.42,
          text: 'Crucero Tomahawk<br>(Mach 0.65–0.72)',
          showarrow: false,
          font: { size: 10, color: 'rgba(138,154,91,0.8)' },
          yref: 'y'
        }
      ]
    };

    Plotly.newPlot(el, [cruiseZone, grossTrace, thrustTrace, tsfcTrace, designPt], chartLayout, config);
  }

  // ========== Navigation ==========
  function navigateTo(projectId) {
    if (projectId) {
      window.location.hash = `#/project/${projectId}`;
    } else {
      window.location.hash = '#/';
    }
  }

  function handleRoute() {
    const hash = window.location.hash || '#/';
    const projectMatch = hash.match(/#\/project\/(.+)/);

    if (projectMatch) {
      const projectId = projectMatch[1];
      landingView.style.display = 'none';
      projectView.style.display = 'block';
      projectView.classList.add('active');
      backBtn.classList.add('visible');
      renderProject(projectId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      landingView.style.display = 'block';
      projectView.style.display = 'none';
      projectView.classList.remove('active');
      backBtn.classList.remove('visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ========== Init ==========
  function init() {
    initStars();
    renderLanding();
    handleRoute();

    window.addEventListener('hashchange', handleRoute);

    backBtn.addEventListener('click', () => navigateTo(''));
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('');
    });

    // Update stats
    const statProjects = document.getElementById('stat-projects');
    if (statProjects) statProjects.textContent = PROJECTS.length;
    const statSections = document.getElementById('stat-sections');
    if (statSections) {
      const total = PROJECTS.reduce((sum, p) => sum + p.sections.length, 0);
      statSections.textContent = total;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
