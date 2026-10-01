/**
 * zaragoza-view.js — Módulo interactivo del Aeropuerto de Zaragoza
 * Implementa el carrusel de introducción y el diagrama de flujo metodológico
 */

(function () {
  'use strict';

  // State
  let currentCardIndex = 0;
  let selectedMonthIdx = -1; // For 12-month moving average
  let chronologicalMonths = [];
  let selectedSeasonMonth = "Ago";
  let includeOutlier2025 = true;
  let selectedScenario = "base"; // "pesimista", "base", "optimista"
  let selectedHpMonth = "Ago";
  let opPaxMode = "teorico"; // "teorico" (85) or "real" (67.4)

  // Initialize chronological array once
  function initChronological() {
    if (typeof ZARAGOZA_DATA === 'undefined') return;
    chronologicalMonths = [...ZARAGOZA_DATA.monthly_data].reverse();
    // Default to Ene 25
    selectedMonthIdx = chronologicalMonths.findIndex(m => m.year === '25' && m.month.toLowerCase().startsWith('ene'));
    if (selectedMonthIdx === -1) selectedMonthIdx = Math.floor(chronologicalMonths.length / 2);
  }

  // Main entry point
  window.renderZaragozaProject = function (container) {
    initChronological();

    container.innerHTML = `
      <div class="zaragoza-container">

        <!-- ==============================================
             1. CARRUSEL DESPLEGABLE DE INTRODUCCIÓN / DATOS
             ============================================== -->
        <section class="zaragoza-intro-section">
          <div class="zaragoza-carousel-wrapper">
            <div class="zaragoza-carousel-track" id="zaragoza-track">

              <!-- Carta 1: Introducción y Objetivo -->
              <div class="zaragoza-card">
                <div class="zaragoza-card-badge">Fase 1 · Planteamiento</div>
                <h3 class="zaragoza-card-title">1. Introducción y Objetivo</h3>
                <p class="zaragoza-card-desc">
                  El objetivo central del trabajo es <strong>planificar la demanda futura del Aeropuerto de Zaragoza (ZAZ) hacia el año 2050</strong>: 
                  estimar el volumen anual de pasajeros, analizar cómo se distribuirán a lo largo de las distintas estaciones del año 
                  y <strong>dimensionar la infraestructura de pista necesaria en la hora punta de diseño</strong> más exigente.
                </p>
                <div class="zaragoza-card-highlight">
                  <span class="highlight-icon">🎯</span>
                  <div>
                    <strong>Criterio de ingeniería:</strong> Relacionar las series históricas de tráfico con la evolución macroeconómica (PIB) 
                    para determinar si la pista y terminal actuales podrán absorber el crecimiento previsto a 25 años vista.
                  </div>
                </div>
              </div>

              <!-- Carta 2: Cifras Oficiales de Aena -->
              <div class="zaragoza-card">
                <div class="zaragoza-card-badge">Fase 2 · Datos Oficiales</div>
                <h3 class="zaragoza-card-title">2. Cifras Mensuales de Aena (2004–2026)</h3>
                <p class="zaragoza-card-desc">
                  Se utilizan las estadísticas mensuales oficiales de <strong>Aena</strong> entre <strong>enero de 2004 y abril de 2026</strong> (un total de <strong>268 meses</strong>), 
                  desglosadas en <strong>salidas</strong>, <strong>llegadas</strong> y <strong>pasajeros totales</strong>.
                </p>
                <div class="zaragoza-card-stats-grid">
                  <div class="card-mini-stat">
                    <span class="mini-stat-val">268</span>
                    <span class="mini-stat-lbl">Meses analizados</span>
                  </div>
                  <div class="card-mini-stat">
                    <span class="mini-stat-val">50,1% / 49,9%</span>
                    <span class="mini-stat-lbl">Salidas vs Llegadas</span>
                  </div>
                  <div class="card-mini-stat">
                    <span class="mini-stat-val">707.493</span>
                    <span class="mini-stat-lbl">Pasajeros 2025 (Año base)</span>
                  </div>
                </div>
                <p class="zaragoza-card-footnote">
                  * Las salidas y llegadas se monitorizan por separado para comprobar su equilibrio estacional, mientras que el dimensionamiento de terminal, pista y filtros se realiza sobre el total.
                </p>
              </div>

              <!-- Carta 3: Supresión de la Pandemia -->
              <div class="zaragoza-card">
                <div class="zaragoza-card-badge">Fase 3 · Tratamiento Estadístico</div>
                <h3 class="zaragoza-card-title">3. Exclusión del Periodo COVID-19</h3>
                <p class="zaragoza-card-desc">
                  Se eliminan íntegramente los <strong>24 meses correspondientes a 2020 y 2021</strong>, dejando una serie limpia de <strong>244 meses de operación regular</strong>.
                </p>
                <div class="zaragoza-card-highlight alert-highlight">
                  <span class="highlight-icon">⚠️</span>
                  <div>
                    <strong>Justificación metodológica:</strong> En abril de 2020 el tráfico colapsó a solo <strong>4 pasajeros</strong> debido a las restricciones sanitarias. 
                    Mantener estos valores anómalos o los rebotes artificiales de 2021 habría distorsionado gravemente la tendencia de fondo, 
                    los índices estacionales y la regresión econométrica con el PIB.
                  </div>
                </div>
              </div>

            </div>

            <!-- Controles del Carrusel -->
            <div class="zaragoza-carousel-controls">
              <button class="carousel-arrow" id="btn-prev-card" aria-label="Anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div class="carousel-indicators" id="carousel-dots">
                <span class="dot active" data-index="0"></span>
                <span class="dot" data-index="1"></span>
                <span class="dot" data-index="2"></span>
              </div>
              <button class="carousel-arrow" id="btn-next-card" aria-label="Siguiente">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
            <div class="carousel-counter" id="carousel-counter">Paso 1 de 3</div>
          </div>
        </section>

        <!-- ==============================================
             2. DIAGRAMA DE FLUJO METODOLÓGICO INTERACTIVO
             ============================================== -->
        <section class="zaragoza-methodology-section">
          <div class="methodology-header">
            <span class="methodology-pill">Cadena de Planificación</span>
            <h2 class="methodology-title">Diagrama de Flujo Metodológico</h2>
            <p class="methodology-subtitle">
              Sigue la cadena de cálculo paso a paso desde los datos brutos desestacionalizados hasta el dimensionamiento de pistas en 2050.
            </p>
          </div>

          <!-- Barra visual del Pipeline -->
          <div class="pipeline-nav">
            <button class="pipeline-step-btn active" data-target="step-tendencia">
              <span class="step-num">1</span>
              <span class="step-lbl">Tendencia Móvil</span>
            </button>
            <div class="pipeline-connector"></div>
            <button class="pipeline-step-btn" data-target="step-estacionalidad">
              <span class="step-num">2</span>
              <span class="step-lbl">Estacionalidad</span>
            </button>
            <div class="pipeline-connector"></div>
            <button class="pipeline-step-btn" data-target="step-elasticidad">
              <span class="step-num">3</span>
              <span class="step-lbl">Elasticidad PIB</span>
            </button>
            <div class="pipeline-connector"></div>
            <button class="pipeline-step-btn" data-target="step-horapunta">
              <span class="step-num">4</span>
              <span class="step-lbl">Hora Punta (HP)</span>
            </button>
            <div class="pipeline-connector"></div>
            <button class="pipeline-step-btn" data-target="step-operaciones">
              <span class="step-num">5</span>
              <span class="step-lbl">Pistas & Capacidad</span>
            </button>
          </div>

          <!-- PASO 1: TENDENCIA MEDIA MÓVIL CENTRADA -->
          <div class="methodology-block" id="step-tendencia">
            <div class="block-header">
              <span class="block-number">Etapa 01</span>
              <h3 class="block-title">Tendencia: Media Móvil Centrada de 12 Meses</h3>
            </div>
            <p class="block-description">
              Para extraer el <strong>nivel de fondo de la demanda</strong> y neutralizar las oscilaciones anuales del calendario (verano vs invierno), 
              se emplea una <strong>media móvil centrada de 12 meses</strong>. Dado que 12 meses es un número par, el centro aritmético cae entre dos meses; 
              por ello se utiliza una ventana simétrica de <strong>13 meses</strong> donde los dos meses extremos ponderan al <strong>0,5</strong> y los once intermedios al <strong>1,0</strong>.
            </p>

            <div class="math-card">
              <div class="math-label">Ecuación de la Media Móvil Centrada:</div>
              <div class="math-formula">
                MM<sub>t</sub> = &frac1{12} &times; [ 0,5 &middot; X<sub>t&minus;6</sub> + X<sub>t&minus;5</sub> + &hellip; + X<sub>t+5</sub> + 0,5 &middot; X<sub>t+6</sub> ]
              </div>
            </div>

            <!-- Selector / Rueda de Mes -->
            <div class="interactive-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Explorador de Ventana Centrada (13 Meses)
                </div>
                <div class="panel-quick-buttons">
                  <button class="quick-btn active" data-year="25" data-month="Ene">Enero 2025 (Ejemplo)</button>
                  <button class="quick-btn" data-year="25" data-month="Mar">Marzo 2025</button>
                  <button class="quick-btn" data-year="11" data-month="May">Mayo 2011 (Pico)</button>
                  <button class="quick-btn" data-year="25" data-month="Oct">Octubre 2025 (Último)</button>
                </div>
              </div>

              <div class="slider-control-group">
                <label for="month-slider" class="slider-label">
                  Mes central seleccionado (t): <strong id="lbl-selected-month">Enero 2025</strong>
                </label>
                <div class="slider-wrapper">
                  <span class="slider-bound" id="slider-min-lbl">Jul 04</span>
                  <input type="range" id="month-slider" min="6" max="237" value="228" class="custom-range" />
                  <span class="slider-bound" id="slider-max-lbl">Oct 25</span>
                </div>
                <p class="slider-help">Mueve el selector para desplazar la ventana móvil de 13 meses mes a mes.</p>
              </div>

              <!-- Resultados de la ventana de 13 meses -->
              <div class="window-summary-grid">
                <div class="summary-box">
                  <span class="box-lbl">Ventana Temporal</span>
                  <span class="box-val highlight" id="lbl-window-range">Jul 2024 &rarr; Jul 2025</span>
                </div>
                <div class="summary-box">
                  <span class="box-lbl">Pasajeros Mes Central (X<sub>t</sub>)</span>
                  <span class="box-val" id="lbl-pax-central">44.040</span>
                </div>
                <div class="summary-box">
                  <span class="box-lbl">Media Móvil Resultante (MM<sub>t</sub>)</span>
                  <span class="box-val accent" id="lbl-mm-result">58.610 pax/mes</span>
                </div>
              </div>

              <!-- Tabla interactiva dinámica de 13 meses -->
              <div class="table-responsive" style="margin-top: 1rem; max-height: 290px; overflow-y: auto;">
                <table class="compact-table" id="table-ma-window">
                  <thead>
                    <tr>
                      <th>Desplazamiento</th>
                      <th>Mes</th>
                      <th>Pasajeros Reales (Aena)</th>
                      <th>Peso</th>
                      <th>Contribución Ponderada</th>
                    </tr>
                  </thead>
                  <tbody id="tbody-ma-window">
                    <!-- Filas generadas por JS -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- PASO 2: ESTACIONALIDAD -->
          <div class="methodology-block" id="step-estacionalidad">
            <div class="block-header">
              <span class="block-number">Etapa 02</span>
              <h3 class="block-title">Estacionalidad: Índice Estacional Multiplicativo</h3>
            </div>
            <p class="block-description">
              El <strong>índice estacional</strong> mide cuánto se aparta cada mes del año de su nivel medio de fondo por razones puramente de calendario. 
              Al ser un modelo multiplicativo, los factores representan proporciones porcentuales que se conservan independientemente del crecimiento del aeropuerto.
            </p>

            <div class="math-card">
              <div class="math-label">Cálculo del Índice Mensual y Control de Suma:</div>
              <div class="math-formula">
                I<sub>t</sub> = &frac{X<sub>t</sub>}{MM<sub>t</sub>}, &emsp; 
                I<sub>m</sub> = &frac1{N} &sum; I<sub>t</sub>, &emsp; 
                &sum;<sub>m=1</sub><sup>12</sup> I<sub>m</sub> &asymp; 12
              </div>
            </div>

            <!-- Selector de Mes Estacional -->
            <div class="interactive-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4m8-2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                  Comparador de Estacionalidad Mensual
                </div>
              </div>

              <div class="season-months-bar" id="season-months-bar">
                <!-- Botones Ene .. Dic -->
              </div>

              <div class="season-display-card" id="season-card">
                <!-- Detalle dinámico del mes -->
              </div>

              <!-- Gráfico de barras de estacionalidad -->
              <div class="chart-container" id="chart-seasonality" style="height: 320px; margin-top: 1.5rem;"></div>
            </div>
          </div>

          <!-- PASO 3: ELASTICIDAD PIB -->
          <div class="methodology-block" id="step-elasticidad">
            <div class="block-header">
              <span class="block-number">Etapa 03</span>
              <h3 class="block-title">Elasticidad del Tráfico respecto al PIB</h3>
            </div>
            <p class="block-description">
              Para proyectar la demanda futura se relaciona el tráfico desestacionalizado trimestral con la actividad macroeconómica mediante un modelo potencial: 
              <strong>T = A &middot; PIB<sup>&epsilon;</sup></strong>. Al aplicar logaritmos naturales, la ecuación se transforma en una recta cuya pendiente es directamente la <strong>elasticidad (&epsilon;)</strong>.
            </p>

            <div class="math-card">
              <div class="math-label">Regresión Log-Log por Mínimos Cuadrados:</div>
              <div class="math-formula">
                ln(T) = ln(A) + &epsilon; &middot; ln(PIB), &emsp; 
                &epsilon; = &frac{&sum; (x &minus; x̄)(y &minus; ȳ)}{&sum; (x &minus; x̄)<sup>2</sup>}
              </div>
            </div>

            <div class="interactive-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  Regresión Econométrica (78 Trimestres)
                </div>
                <!-- Toggle auditoría crítica -->
                <div class="toggle-group">
                  <label class="switch-label" for="toggle-outlier">
                    <input type="checkbox" id="toggle-outlier" checked />
                    <span class="slider-toggle"></span>
                    <span class="toggle-text" id="lbl-toggle-text">Incluir trimestre 2025 T4</span>
                  </label>
                </div>
              </div>

              <div class="regression-info-banner" id="regression-alert">
                <!-- Mensaje de hallazgo crítico -->
              </div>

              <!-- Gráfico de dispersión Plotly -->
              <div class="chart-container" id="chart-elasticity" style="height: 380px;"></div>

              <div class="elasticity-metrics-grid">
                <div class="metric-card">
                  <span class="metric-lbl">Elasticidad (&epsilon;)</span>
                  <span class="metric-val highlight" id="lbl-elasticity-val">1,07</span>
                  <span class="metric-desc">Por cada 1% de aumento del PIB, el tráfico crece un 1,07%</span>
                </div>
                <div class="metric-card">
                  <span class="metric-lbl">Coeficiente R²</span>
                  <span class="metric-val" id="lbl-r2-val">0,11</span>
                  <span class="metric-desc">Explica una fracción moderada; fuerte influencia de la oferta (Ryanair)</span>
                </div>
                <div class="metric-card">
                  <span class="metric-lbl">Tasa Histórica PIB (CAGR)</span>
                  <span class="metric-val accent">1,55%</span>
                  <span class="metric-desc">Tasa compuesta observada en 21,5 años (justifica el escenario base)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 4: HORA PUNTA (HP) -->
          <div class="methodology-block" id="step-horapunta">
            <div class="block-header">
              <span class="block-number">Etapa 04</span>
              <h3 class="block-title">Del Tráfico Anual a la Hora Punta de Diseño (Hoja HP)</h3>
            </div>
            <p class="block-description">
              Un aeropuerto no se dimensiona para el tráfico medio anual, sino para la <strong>hora punta de diseño</strong> del mes más cargado. 
              La hoja HP ejecuta una cascada temporal descendente en 3 niveles: <strong>del año al mes</strong> (vía índice estacional), 
              <strong>del mes al día</strong> (entre 31 días) y <strong>del día a la hora pico</strong> (factor de concentración del 11%).
            </p>

            <div class="interactive-panel">
              <div class="scenario-selector-bar">
                <span class="scenario-bar-lbl">Selecciona Escenario 2050:</span>
                <div class="scenario-buttons">
                  <button class="scenario-btn" data-scenario="pesimista">
                    <strong>1. Pesimista (+1,0% PIB)</strong>
                    <span>923.583 pax/año</span>
                  </button>
                  <button class="scenario-btn active" data-scenario="base">
                    <strong>2. Base (+1,5% PIB)</strong>
                    <span>1.054.129 pax/año</span>
                  </button>
                  <button class="scenario-btn" data-scenario="optimista">
                    <strong>3. Optimista (+2,2% PIB)</strong>
                    <span>1.069.258 pax/año</span>
                  </button>
                </div>
              </div>

              <!-- Selector de mes para la cascada -->
              <div class="cascade-month-selector">
                <label for="hp-month-select">Mes para simular cascada de diseño:</label>
                <select id="hp-month-select" class="custom-select">
                  <option value="Ago" selected>Agosto (Mes Punta de Diseño — Im = 1,42)</option>
                  <option value="Jul">Julio (Temporada Alta — Im = 1,35)</option>
                  <option value="Sep">Septiembre (Temporada Alta — Im = 1,13)</option>
                  <option value="Abr">Abril (Temporada Media — Im = 1,05)</option>
                  <option value="May">Mayo (Temporada Media — Im = 0,91)</option>
                  <option value="Ene">Enero (Mes Valle — Im = 0,71)</option>
                </select>
              </div>

              <!-- Cascada de 3 pasos -->
              <div class="cascade-flow-grid">
                <div class="cascade-step-card">
                  <div class="cascade-step-tag">Paso 1 · Anual a Mensual</div>
                  <div class="cascade-calc-formula">MMT = PAX<sub>2050</sub> &times; I<sub>m</sub> / 12</div>
                  <div class="cascade-result" id="hp-res-mmt">125.083</div>
                  <div class="cascade-unit">Pasajeros en el mes</div>
                </div>

                <div class="cascade-arrow">&rarr;</div>

                <div class="cascade-step-card">
                  <div class="cascade-step-tag">Paso 2 · Mensual a Diario</div>
                  <div class="cascade-calc-formula">DMT = MMT / 31</div>
                  <div class="cascade-result" id="hp-res-dmt">4.035</div>
                  <div class="cascade-unit">Pasajeros / día medio</div>
                </div>

                <div class="cascade-arrow">&rarr;</div>

                <div class="cascade-step-card highlight-border">
                  <div class="cascade-step-tag peak-tag">Paso 3 · Hora Punta de Diseño</div>
                  <div class="cascade-calc-formula">HDP = DMT &times; 0,11</div>
                  <div class="cascade-result peak-val" id="hp-res-hdp">444</div>
                  <div class="cascade-unit">Pasajeros en Hora Punta</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 5: OPERACIONES Y PISTAS -->
          <div class="methodology-block" id="step-operaciones">
            <div class="block-header">
              <span class="block-number">Etapa 05</span>
              <h3 class="block-title">Operaciones y Número de Pistas (Hoja Operaciones)</h3>
            </div>
            <p class="block-description">
              La capacidad de una pista y de los servicios de control no se mide en pasajeros, sino en <strong>movimientos de aeronaves por hora</strong> (operaciones). 
              Se convierten los pasajeros punta en vuelos requeridos según la capacidad media del avión y se compara con la capacidad nominal de la pista (40 ops/hora).
            </p>

            <div class="interactive-panel">
              <div class="ops-controls-row">
                <div class="param-selector">
                  <label>Hipótesis de Aeronave:</label>
                  <div class="button-toggle-group">
                    <button class="toggle-btn active" id="btn-mode-teorico" data-mode="teorico">
                      Teórico Excel (100 plazas &times; 85% = 85 pax/op)
                    </button>
                    <button class="toggle-btn" id="btn-mode-real" data-mode="real">
                      Promedio Real Observado (67,4 pax/op)
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tarjetas de resultados de pista -->
              <div class="runway-metrics-row">
                <div class="runway-card">
                  <span class="runway-card-lbl">Demanda en Hora Punta</span>
                  <span class="runway-card-val highlight" id="lbl-ops-per-hour">5,2 ops/h</span>
                  <span class="runway-card-sub" id="lbl-ops-detail">444 pax &divide; 85 pax/avión</span>
                </div>
                <div class="runway-card">
                  <span class="runway-card-lbl">Capacidad de Pista (ZAZ)</span>
                  <span class="runway-card-val">40 ops/h</span>
                  <span class="runway-card-sub">Capacidad prudente de 1 pista estándar</span>
                </div>
                <div class="runway-card highlight-glow">
                  <span class="runway-card-lbl">Pistas Requeridas</span>
                  <span class="runway-card-val accent" id="lbl-runways-needed">0,13</span>
                  <span class="runway-card-sub">Solo un 13% de saturación</span>
                </div>
              </div>

              <!-- Barra de Saturación Visual -->
              <div class="saturation-gauge-container">
                <div class="gauge-label-row">
                  <span>Nivel de Saturación de la Pista Actual en Hora Punta (2050):</span>
                  <strong class="gauge-percent" id="lbl-gauge-percent">13.0%</strong>
                </div>
                <div class="gauge-track">
                  <div class="gauge-fill" id="gauge-fill-bar" style="width: 13.0%;"></div>
                </div>
                <div class="gauge-legend">
                  <span>0 ops/h</span>
                  <span class="legend-mid">Demanda 2050 (5,2 ops/h)</span>
                  <span>Capacidad Máxima 1 Pista (40 ops/h)</span>
                </div>
              </div>

              <div class="runway-conclusion-box">
                <div class="conclusion-icon">✅</div>
                <div class="conclusion-text">
                  <strong>Dictamen Técnico:</strong> Con una demanda pico de solo <strong>5,2 operaciones/hora</strong> en el año 2050, 
                  <strong>una única pista opera a apenas el 13% de su capacidad</strong>. La infraestructura existente en el Aeropuerto de Zaragoza 
                  es holgadamente suficiente para absorber todo el tráfico de pasajeros proyectado sin requerir ampliación de pistas.
                </div>
              </div>
            </div>
          </div>

        </section>

      </div>
    `;

    // Initialize Event Listeners
    setupCarouselEvents();
    setupPipelineNavEvents();
    setupMovingAverageEvents();
    setupSeasonalityEvents();
    setupElasticityEvents();
    setupHpEvents();
    setupRunwayEvents();

    // Render initial states
    updateMovingAverageView();
    updateSeasonalityView();
    renderElasticityChart();
    updateHpView();
    updateRunwayView();
  };

  // ==========================================
  // 1. CARRUSEL LOGIC
  // ==========================================
  function setupCarouselEvents() {
    const track = document.getElementById('zaragoza-track');
    const dots = document.querySelectorAll('#carousel-dots .dot');
    const counter = document.getElementById('carousel-counter');
    const btnPrev = document.getElementById('btn-prev-card');
    const btnNext = document.getElementById('btn-next-card');

    function goToCard(index) {
      if (index < 0) index = 2;
      if (index > 2) index = 0;
      currentCardIndex = index;
      if (track) {
        track.style.transform = `translateX(-${currentCardIndex * 100}%)`;
      }
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentCardIndex);
      });
      if (counter) {
        counter.textContent = `Paso ${currentCardIndex + 1} de 3`;
      }
    }

    if (btnPrev) btnPrev.addEventListener('click', () => goToCard(currentCardIndex - 1));
    if (btnNext) btnNext.addEventListener('click', () => goToCard(currentCardIndex + 1));
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToCard(i));
    });
  }

  // ==========================================
  // PIPELINE NAVIGATION
  // ==========================================
  function setupPipelineNavEvents() {
    const buttons = document.querySelectorAll('.pipeline-step-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ==========================================
  // ETAPA 1: MOVING AVERAGE WHEEL / SLIDER
  // ==========================================
  function setupMovingAverageEvents() {
    const slider = document.getElementById('month-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        selectedMonthIdx = parseInt(e.target.value, 10);
        updateMovingAverageView();
      });
    }

    const quickBtns = document.querySelectorAll('.panel-quick-buttons .quick-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        quickBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const yr = btn.getAttribute('data-year');
        const mo = btn.getAttribute('data-month');
        const idx = chronologicalMonths.findIndex(m => m.year === yr && m.month.toLowerCase().startsWith(mo.toLowerCase()));
        if (idx !== -1 && idx >= 6 && idx <= chronologicalMonths.length - 7) {
          selectedMonthIdx = idx;
          if (slider) slider.value = idx;
          updateMovingAverageView();
        }
      });
    });
  }

  function updateMovingAverageView() {
    if (!chronologicalMonths || chronologicalMonths.length === 0 || selectedMonthIdx < 6) return;
    const central = chronologicalMonths[selectedMonthIdx];
    if (!central) return;

    // Label central
    const lblCentral = document.getElementById('lbl-selected-month');
    if (lblCentral) lblCentral.textContent = `${central.month} 20${central.year}`;

    // Window 13 months
    const startIdx = selectedMonthIdx - 6;
    const endIdx = selectedMonthIdx + 6;
    const windowMonths = chronologicalMonths.slice(startIdx, endIdx + 1);

    const firstM = windowMonths[0];
    const lastM = windowMonths[windowMonths.length - 1];
    const lblRange = document.getElementById('lbl-window-range');
    if (lblRange) lblRange.textContent = `${firstM.month} 20${firstM.year} → ${lastM.month} 20${lastM.year}`;

    const lblPaxCentral = document.getElementById('lbl-pax-central');
    if (lblPaxCentral) lblPaxCentral.textContent = Number(central.total).toLocaleString('es-ES');

    // Calculate MA
    let weightedSum = 0;
    const tbody = document.getElementById('tbody-ma-window');
    if (!tbody) return;
    tbody.innerHTML = '';

    windowMonths.forEach((m, i) => {
      const isExtreme = (i === 0 || i === 12);
      const weight = isExtreme ? 0.5 : 1.0;
      const contrib = m.total * weight;
      weightedSum += contrib;
      const offset = i - 6;
      const offsetStr = offset === 0 ? 't (Central)' : (offset > 0 ? `t + ${offset}` : `t &minus; ${Math.abs(offset)}`);
      const rowClass = offset === 0 ? 'class="row-central"' : (isExtreme ? 'class="row-extreme"' : '');

      const tr = document.createElement('tr');
      if (offset === 0) tr.classList.add('row-central');
      if (isExtreme) tr.classList.add('row-extreme');
      tr.innerHTML = `
        <td><strong>${offsetStr}</strong></td>
        <td>${m.month} 20${m.year}</td>
        <td>${Number(m.total).toLocaleString('es-ES')}</td>
        <td><span class="weight-badge ${isExtreme ? 'weight-half' : 'weight-full'}">${weight === 0.5 ? '0,5' : '1,0'}</span></td>
        <td><strong>${Number(contrib.toFixed(1)).toLocaleString('es-ES')}</strong></td>
      `;
      tbody.appendChild(tr);
    });

    const maResult = weightedSum / 12;
    const lblMM = document.getElementById('lbl-mm-result');
    if (lblMM) lblMM.textContent = `${Number(maResult.toFixed(2)).toLocaleString('es-ES')} pax/mes`;
  }

  // ==========================================
  // ETAPA 2: ESTACIONALIDAD
  // ==========================================
  const SEASON_INFO = {
    "Ene": { season: "Baja", desc: "Mes valle invernal (-29% vs media). Salidas 0,74 / Llegadas 0,68.", color: "#4a90e2" },
    "Feb": { season: "Baja", desc: "Mínima actividad turística (-24% vs media). Salidas 0,76 / Llegadas 0,76.", color: "#4a90e2" },
    "Mar": { season: "Media", desc: "Próximo a la media (-2%). Comienzo de temporada de primavera.", color: "#e6a23c" },
    "Abr": { season: "Media", desc: "Ligero repunte (+5%) impulsado por Semana Santa.", color: "#e6a23c" },
    "May": { season: "Media", desc: "Mes moderado (-9% vs media).", color: "#e6a23c" },
    "Jun": { season: "Media", desc: "Inicio del verano (+2%). Mayor peso en salidas (1,05).", color: "#e6a23c" },
    "Jul": { season: "Alta", desc: "Temporada alta de vacaciones (+35% vs media). Gran volumen de vuelos chárter.", color: "#c75b39" },
    "Ago": { season: "Alta", desc: "MÁXIMO ANUAL (+42% vs media). Mes de diseño del aeropuerto. Salidas 1,42 / Llegadas 1,43.", color: "#e74c3c" },
    "Sep": { season: "Alta", desc: "Cierre vacacional (+13%). Predominio de llegadas (1,16) por retornos.", color: "#c75b39" },
    "Oct": { season: "Media", desc: "Muy equilibrado con el mes medio (-2%). Fiestas del Pilar.", color: "#e6a23c" },
    "Nov": { season: "Baja", desc: "Temporada baja otoñal (-22% vs media).", color: "#4a90e2" },
    "Dic": { season: "Media", desc: "Efecto de festividades navideñas (-12% vs media). Llegadas (0,92) superiores a salidas.", color: "#e6a23c" }
  };

  function setupSeasonalityEvents() {
    const bar = document.getElementById('season-months-bar');
    if (!bar) return;
    bar.innerHTML = '';
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    months.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'month-btn' + (m === selectedSeasonMonth ? ' active' : '');
      btn.textContent = m;
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSeasonMonth = m;
        updateSeasonalityView();
      });
      bar.appendChild(btn);
    });
  }

  function updateSeasonalityView() {
    const card = document.getElementById('season-display-card');
    if (!card || !ZARAGOZA_DATA) return;
    const mData = ZARAGOZA_DATA.seasonal_indices.find(x => x.month.toLowerCase().startsWith(selectedSeasonMonth.toLowerCase()));
    const info = SEASON_INFO[selectedSeasonMonth] || { season: "Media", desc: "" };

    const idxTotal = mData ? mData.total : 1.0;
    const idxSal = mData ? mData.salidas : 1.0;
    const idxLleg = mData ? mData.llegadas : 1.0;
    const devPct = ((idxTotal - 1.0) * 100).toFixed(0);
    const devSign = devPct >= 0 ? `+${devPct}%` : `${devPct}%`;

    card.innerHTML = `
      <div class="season-card-top">
        <div>
          <span class="season-badge season-${info.season.toLowerCase()}">Temporada ${info.season}</span>
          <h4 class="season-month-name">${selectedSeasonMonth} (Índice Total: <strong>${idxTotal}</strong> &rarr; ${devSign})</h4>
        </div>
        <div class="season-factor-big">${idxTotal} &times;</div>
      </div>
      <p class="season-card-explanation">${info.desc}</p>
      <div class="season-sub-factors">
        <span>Índice Salidas: <strong>${idxSal}</strong></span>
        <span>Índice Llegadas: <strong>${idxLleg}</strong></span>
        <span>Índice Total: <strong>${idxTotal}</strong></span>
      </div>
    `;

    renderSeasonalityChart();
  }

  function renderSeasonalityChart() {
    const chartDiv = document.getElementById('chart-seasonality');
    if (!chartDiv || typeof Plotly === 'undefined') return;

    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const totals = [];
    const colors = [];

    months.forEach(m => {
      const match = ZARAGOZA_DATA.seasonal_indices.find(x => x.month.toLowerCase().startsWith(m.toLowerCase()));
      const val = match ? match.total : 1.0;
      totals.push(val);
      if (m === selectedSeasonMonth) {
        colors.push('#c75b39'); // active accent
      } else if (val >= 1.2) {
        colors.push('rgba(199, 91, 57, 0.7)');
      } else if (val < 0.85) {
        colors.push('rgba(74, 144, 226, 0.7)');
      } else {
        colors.push('rgba(230, 162, 60, 0.6)');
      }
    });

    const data = [{
      x: months,
      y: totals,
      type: 'bar',
      marker: { color: colors, line: { color: '#0d0d0d', width: 1.5 } },
      text: totals.map(v => v.toFixed(2)),
      textposition: 'outside',
      cliponaxis: false
    }];

    const layout = {
      title: { text: 'Índice Estacional Medio Mensual (Base = 1,00)', font: { color: '#e0ddd9', size: 14 } },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 45, r: 20, t: 40, b: 35 },
      xaxis: { color: '#9a9590', tickfont: { color: '#e0ddd9' } },
      yaxis: { color: '#9a9590', range: [0, 1.6], tickvals: [0.5, 0.75, 1.0, 1.25, 1.5], gridcolor: 'rgba(255,255,255,0.06)' },
      shapes: [{
        type: 'line',
        x0: -0.5,
        x1: 11.5,
        y0: 1.0,
        y1: 1.0,
        line: { color: 'rgba(255,255,255,0.3)', width: 1.5, dash: 'dot' }
      }]
    };

    Plotly.react(chartDiv, data, layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================
  // ETAPA 3: ELASTICIDAD PIB
  // ==========================================
  function setupElasticityEvents() {
    const toggle = document.getElementById('toggle-outlier');
    const lblToggle = document.getElementById('lbl-toggle-text');
    if (toggle) {
      toggle.addEventListener('change', () => {
        includeOutlier2025 = toggle.checked;
        if (lblToggle) {
          lblToggle.textContent = includeOutlier2025 ? 'Incluir trimestre 2025 T4 (Original Excel)' : 'Excluir trimestre 2025 T4 (Corregido)';
        }
        renderElasticityChart();
      });
    }
  }

  function renderElasticityChart() {
    const chartDiv = document.getElementById('chart-elasticity');
    if (!chartDiv || typeof Plotly === 'undefined' || !ZARAGOZA_DATA) return;

    let pts = ZARAGOZA_DATA.pib_data.filter(p => p.lnTotal && p.lnPIB);
    const outlier = pts.find(p => p.year === '25' && p.quarter === 'T4');

    if (!includeOutlier2025) {
      pts = pts.filter(p => !(p.year === '25' && p.quarter === 'T4'));
    }

    // Linear regression
    const n = pts.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    pts.forEach(p => {
      sumX += p.lnPIB;
      sumY += p.lnTotal;
      sumXY += p.lnPIB * p.lnTotal;
      sumXX += p.lnPIB * p.lnPIB;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R2
    const yMean = sumY / n;
    let ssTot = 0, ssRes = 0;
    pts.forEach(p => {
      const yPred = intercept + slope * p.lnPIB;
      ssTot += Math.pow(p.lnTotal - yMean, 2);
      ssRes += Math.pow(p.lnTotal - yPred, 2);
    });
    const r2 = 1 - (ssRes / ssTot);

    // Update UI metrics
    const lblElast = document.getElementById('lbl-elasticity-val');
    if (lblElast) lblElast.textContent = slope.toFixed(2).replace('.', ',');
    const lblR2 = document.getElementById('lbl-r2-val');
    if (lblR2) lblR2.textContent = r2.toFixed(2).replace('.', ',');

    const alertBanner = document.getElementById('regression-alert');
    if (alertBanner) {
      if (includeOutlier2025) {
        alertBanner.innerHTML = `
          <strong>⚠️ Hallazgo de Auditoría (Apartado 7 del informe):</strong> El trimestre 2025 T4 solo computó el mes de octubre (59.066 pax en vez de un trimestre completo ~177k). 
          Este punto aislado (esquina inferior derecha) reduce artificialmente la elasticidad a <strong>&epsilon; = 1,07</strong>. Desactiva el toggle para ver la corrección.
        `;
        alertBanner.className = 'regression-info-banner alert-warning';
      } else {
        alertBanner.innerHTML = `
          <strong>✅ Serie Depurada:</strong> Al eliminar el trimestre incompleto de 2025, la elasticidad asciende a <strong>&epsilon; = 1,50</strong> 
          y el R² se duplica (de 0,11 a 0,22). Con esta elasticidad real, la proyección a 2050 alcanzaría 1,24 M en escenario base y 1,60 M en optimista.
        `;
        alertBanner.className = 'regression-info-banner alert-success';
      }
    }

    // Traces
    const xVals = pts.map(p => p.lnPIB);
    const yVals = pts.map(p => p.lnTotal);
    const minX = Math.min(...xVals) - 0.05;
    const maxX = Math.max(...xVals) + 0.05;

    const tracePoints = {
      x: xVals,
      y: yVals,
      mode: 'markers',
      type: 'scatter',
      name: 'Trimestres (2004–2025)',
      marker: { color: 'rgba(199, 91, 57, 0.75)', size: 8, line: { color: '#c75b39', width: 1 } }
    };

    const traceLine = {
      x: [minX, maxX],
      y: [intercept + slope * minX, intercept + slope * maxX],
      mode: 'lines',
      type: 'scatter',
      name: `Ajuste: &epsilon; = ${slope.toFixed(2)} (R² = ${r2.toFixed(2)})`,
      line: { color: '#8a9a5b', width: 2.5 }
    };

    const traces = [tracePoints, traceLine];

    // If outlier included, highlight it
    if (includeOutlier2025 && outlier) {
      traces.push({
        x: [outlier.lnPIB],
        y: [outlier.lnTotal],
        mode: 'markers+text',
        type: 'scatter',
        name: '2025 T4 (Incompleto)',
        text: ['2025 T4 (Outlier)'],
        textposition: 'top left',
        textfont: { color: '#ff6b6b' },
        marker: { color: '#ff6b6b', size: 12, symbol: 'diamond' }
      });
    }

    const layout = {
      title: { text: `Dispersión ln(PIB) vs ln(Media Móvil Trimestral Tráfico)`, font: { color: '#e0ddd9', size: 14 } },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 50, r: 25, t: 45, b: 45 },
      xaxis: { title: 'ln(Índice PIB Trimestral)', color: '#9a9590', gridcolor: 'rgba(255,255,255,0.06)' },
      yaxis: { title: 'ln(Tráfico Trimestral)', color: '#9a9590', gridcolor: 'rgba(255,255,255,0.06)' },
      legend: { font: { color: '#e0ddd9' }, orientation: 'h', y: -0.22 }
    };

    Plotly.react(chartDiv, traces, layout, { responsive: true, displayModeBar: false });
  }

  // ==========================================
  // ETAPA 4: HORA PUNTA (HP)
  // ==========================================
  const SCENARIOS = {
    "pesimista": { g: 0.010, pax2050: 923583, label: "Pesimista (+1,0% PIB)" },
    "base": { g: 0.015, pax2050: 1054129, label: "Base (+1,5% PIB)" },
    "optimista": { g: 0.022, pax2050: 1069258, label: "Optimista (+2,2% PIB)" }
  };

  function setupHpEvents() {
    const btns = document.querySelectorAll('.scenario-buttons .scenario-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedScenario = btn.getAttribute('data-scenario');
        updateHpView();
        updateRunwayView();
      });
    });

    const select = document.getElementById('hp-month-select');
    if (select) {
      select.addEventListener('change', (e) => {
        selectedHpMonth = e.target.value;
        updateHpView();
        updateRunwayView();
      });
    }
  }

  function updateHpView() {
    if (!ZARAGOZA_DATA) return;
    const scen = SCENARIOS[selectedScenario] || SCENARIOS["base"];
    const mData = ZARAGOZA_DATA.seasonal_indices.find(x => x.month.toLowerCase().startsWith(selectedHpMonth.toLowerCase()));
    const im = mData ? mData.total : 1.4239;

    // Calculations
    const mmt = (scen.pax2050 * im) / 12;
    const dmt = mmt / 31;
    const hdp = dmt * 0.11;

    const elMmt = document.getElementById('hp-res-mmt');
    const elDmt = document.getElementById('hp-res-dmt');
    const elHdp = document.getElementById('hp-res-hdp');

    if (elMmt) elMmt.textContent = Math.round(mmt).toLocaleString('es-ES');
    if (elDmt) elDmt.textContent = Math.round(dmt).toLocaleString('es-ES');
    if (elHdp) elHdp.textContent = Math.round(hdp).toLocaleString('es-ES');
  }

  // ==========================================
  // ETAPA 5: OPERACIONES Y PISTAS
  // ==========================================
  function setupRunwayEvents() {
    const btnTeorico = document.getElementById('btn-mode-teorico');
    const btnReal = document.getElementById('btn-mode-real');

    if (btnTeorico && btnReal) {
      btnTeorico.addEventListener('click', () => {
        btnTeorico.classList.add('active');
        btnReal.classList.remove('active');
        opPaxMode = 'teorico';
        updateRunwayView();
      });
      btnReal.addEventListener('click', () => {
        btnReal.classList.add('active');
        btnTeorico.classList.remove('active');
        opPaxMode = 'real';
        updateRunwayView();
      });
    }
  }

  function updateRunwayView() {
    if (!ZARAGOZA_DATA) return;
    const scen = SCENARIOS[selectedScenario] || SCENARIOS["base"];
    // August is the design month
    const mDataAgo = ZARAGOZA_DATA.seasonal_indices.find(x => x.month.toLowerCase().startsWith('ago'));
    const imAgo = mDataAgo ? mDataAgo.total : 1.4239;
    const hdpDesign = ((scen.pax2050 * imAgo) / 12 / 31) * 0.11;

    const paxPerOp = opPaxMode === 'teorico' ? 85 : 67.4;
    const opsPerHour = hdpDesign / paxPerOp;
    const runwayCap = 40.0;
    const runwaysNeeded = opsPerHour / runwayCap;
    const saturationPct = (runwaysNeeded * 100);

    const lblOps = document.getElementById('lbl-ops-per-hour');
    const lblOpsSub = document.getElementById('lbl-ops-detail');
    const lblRunways = document.getElementById('lbl-runways-needed');
    const lblGaugePct = document.getElementById('lbl-gauge-percent');
    const gaugeBar = document.getElementById('gauge-fill-bar');

    if (lblOps) lblOps.textContent = `${opsPerHour.toFixed(1).replace('.', ',')} ops/h`;
    if (lblOpsSub) lblOpsSub.textContent = `${Math.round(hdpDesign)} pax punta ÷ ${paxPerOp} pax/avión`;
    if (lblRunways) lblRunways.textContent = `${runwaysNeeded.toFixed(2).replace('.', ',')} pistas`;
    if (lblGaugePct) lblGaugePct.textContent = `${saturationPct.toFixed(1)}%`;
    if (gaugeBar) gaugeBar.style.width = `${Math.min(saturationPct, 100).toFixed(1)}%`;
  }

})();
