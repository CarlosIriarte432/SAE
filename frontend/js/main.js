// ==========================================================================
// CONTROL DE VISTAS DE FORMULARIOS (Triaje)
// ==========================================================================
function mostrarFormulario(tipo) {
    // Ocultar selector
    document.getElementById('selector-contacto').classList.add('hidden');
    // Mostrar contenedor de forms
    document.getElementById('contenedor-formularios').classList.remove('hidden');
    
    // Ocultar todos los formularios internamente
    document.querySelectorAll('.form-contacto').forEach(form => form.classList.add('hidden'));
    
    // Mostrar el solicitado
    document.getElementById(`form-${tipo}`).classList.remove('hidden');
}

function volverSelector() {
    document.getElementById('contenedor-formularios').classList.add('hidden');
    document.getElementById('selector-contacto').classList.remove('hidden');
    
    // Limpiar todos los formularios al volver
    document.querySelectorAll('.form-contacto').forEach(form => form.reset());
}

// ==========================================================================
// ENVÍO DE FORMULARIOS (Maneja los 3 tipos hacia la misma API)
// ==========================================================================
document.querySelectorAll('.form-contacto').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const formId = form.id; // Puede ser: form-cotizacion, form-consulta, form-opinion
        const btnSubmit = form.querySelector('.btn-submit');
        const textoOriginal = btnSubmit.innerText;
        
        btnSubmit.innerText = 'Enviando...';
        btnSubmit.disabled = true;
        btnSubmit.classList.add('opacity-75', 'cursor-not-allowed');

        // Construir el Payload dependiendo de qué formulario se envió
        let payload = {};
        
        if (formId === 'form-cotizacion') {
            payload = {
                tipo_formulario: 'Cotización',
                nombre: document.getElementById('cot-nombre').value,
                empresa: document.getElementById('cot-empresa').value,
                correo: document.getElementById('cot-correo').value,
                telefono: document.getElementById('cot-telefono').value,
                servicio: document.getElementById('cot-servicio').value,
                origen: document.getElementById('cot-origen').value,
                destino: document.getElementById('cot-destino').value,
                detalles: document.getElementById('cot-detalles').value
            };
        } else if (formId === 'form-consulta') {
            payload = {
                tipo_formulario: 'Consulta',
                nombre: document.getElementById('con-nombre').value,
                empresa: document.getElementById('con-empresa').value,
                correo: document.getElementById('con-correo').value,
                telefono: document.getElementById('con-telefono').value,
                tipo_especifico: document.getElementById('con-tipo').value,
                detalles: document.getElementById('con-detalles').value
            };
        } else if (formId === 'form-opinion') {
            payload = {
                tipo_formulario: 'Opinión/Comentario',
                nombre: document.getElementById('opi-nombre').value,
                empresa: document.getElementById('opi-empresa').value,
                correo: document.getElementById('opi-correo').value,
                telefono: document.getElementById('opi-telefono').value,
                tipo_especifico: document.getElementById('opi-tipo').value,
                detalles: document.getElementById('opi-detalles').value
            };
        }

        try {
            const response = await fetch('https://sae-08mf.onrender.com/api/cotizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: '¡Mensaje Enviado!',
                    text: 'Nuestro equipo se pondrá en contacto a la brevedad.',
                    icon: 'success',
                    confirmButtonColor: '#004b93', 
                    confirmButtonText: 'Entendido',
                    customClass: {
                        popup: 'rounded-2xl',
                        title: 'font-industrial uppercase text-2xl text-[#06152d]'
                    }
                });
                form.reset();
                volverSelector(); // Regresa a las tarjetas después del éxito
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Error al enviar:', error);
            Swal.fire({
                title: 'Error de Conexión',
                text: 'Hubo un problema al enviar el mensaje. Por favor, intenta nuevamente o contáctanos por teléfono.',
                icon: 'error',
                confirmButtonColor: '#06152d', 
                confirmButtonText: 'Cerrar',
                customClass: {
                    popup: 'rounded-2xl',
                    title: 'font-industrial uppercase text-2xl text-[#06152d]'
                }
            });
        } finally {
            btnSubmit.innerText = textoOriginal;
            btnSubmit.disabled = false;
            btnSubmit.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });
});

// ==========================================================================
// HERO SLIDER AUTOMÁTICO
// ==========================================================================
let currentHeroSlide = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
function setHeroSlide(index) {
    currentHeroSlide = index;
    heroSlides.forEach((slide, i) => {
        if (i === index) { slide.classList.remove('opacity-0', 'pointer-events-none'); slide.classList.add('opacity-100'); } 
        else { slide.classList.remove('opacity-100'); slide.classList.add('opacity-0', 'pointer-events-none'); }
    });
    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
        dot.className = i === index 
            ? 'hero-dot px-3 py-1 rounded text-xs font-industrial font-bold uppercase tracking-wider bg-saeNavy text-white transition shadow-sm'
            : 'hero-dot px-3 py-1 rounded text-xs font-industrial font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition shadow-sm';
    });
}
setInterval(() => setHeroSlide((currentHeroSlide + 1) % heroSlides.length), 5500);

// ==========================================================================
// SLIDER CLIENTES (Arrastrar y Auto-scroll)
// ==========================================================================
const clientsSlider = document.getElementById('clients-slider');
let isDraggingClients = false, startXClients = 0, scrollLeftClients = 0;
clientsSlider.addEventListener('mousedown', (e) => { isDraggingClients = true; startXClients = e.pageX - clientsSlider.offsetLeft; scrollLeftClients = clientsSlider.scrollLeft; });
window.addEventListener('mouseup', () => isDraggingClients = false);
clientsSlider.addEventListener('mouseleave', () => isDraggingClients = false);
clientsSlider.addEventListener('mousemove', (e) => {
    if (!isDraggingClients) return;
    e.preventDefault();
    clientsSlider.scrollLeft = scrollLeftClients - ((e.pageX - clientsSlider.offsetLeft) - startXClients) * 1.8;
    checkInfiniteLoop();
});
clientsSlider.addEventListener('touchstart', () => isDraggingClients = true, { passive: true });
clientsSlider.addEventListener('touchend', () => isDraggingClients = false, { passive: true });

function checkInfiniteLoop() {
    const halfWidth = clientsSlider.scrollWidth / 2;
    if (clientsSlider.scrollLeft >= halfWidth) clientsSlider.scrollLeft -= halfWidth;
    else if (clientsSlider.scrollLeft <= 0) clientsSlider.scrollLeft += halfWidth;
}
function autoScrollClients() {
    if (!isDraggingClients && !clientsSlider.matches(':hover')) { clientsSlider.scrollLeft += 1; checkInfiniteLoop(); }
    requestAnimationFrame(autoScrollClients);
}
requestAnimationFrame(autoScrollClients);

// ==========================================================================
// MAPA INTERACTIVO D3.JS Y GOOGLE MAPS
// ==========================================================================
const branchesData = {
    'alto-hospicio': {
        id: 'alto-hospicio', badge: 'I Región de Tarapacá', title: 'SAE ALTO HOSPICIO',
        desc: 'Base operativa para logística portuaria y minera del Norte Grande.', coords: [-70.0835, -20.2882], 
        gmapTitle: 'SAE Alto Hospicio — Tarapacá', gmapAddress: 'Alto Hospicio, Región de Tarapacá',
        gmapLink: 'https://maps.app.goo.gl/hq4KGef1yJhXZFL27?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-20.288456179416833,-70.08430005734189+(Transportes+SAE+Alto+Hospicio)&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'calama': {
        id: 'calama', badge: 'II Región de Antofagasta', title: 'SAE CALAMA',
        desc: 'Centro de soporte directo a faenas mineras y operaciones de alta montaña.', coords: [-68.9242, -22.4871], 
        gmapTitle: 'SAE Calama — Antofagasta', gmapAddress: 'Calama, Región de Antofagasta',
        gmapLink: 'https://maps.app.goo.gl/Mp3m6zgiWgHDJpoL8?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-22.48721240327381, -68.924308339982+(Transportes+SAE+Calama)&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'la-portada': {
        id: 'la-portada', badge: 'II Región de Antofagasta', title: 'SAE LA PORTADA',
        desc: 'Sucursal industrial sector La Portada en Antofagasta, enfocada en distribución regional y suministros.', coords: [-70.4158, -23.4977], 
        gmapTitle: 'SAE La Portada — Antofagasta', gmapAddress: 'Sector La Portada, Antofagasta',
        gmapLink: 'https://maps.app.goo.gl/pQYVMxQz4D62PWmSA?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-23.497811257167815, -70.41592675255164+(Transportes+SAE+La+Portada)&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'la-negra': {
        id: 'la-negra', badge: 'II Región de Antofagasta', title: 'SAE LA NEGRA',
        desc: 'Complejo Industrial La Negra, hub estratégico para transporte pesado y carga minera.', coords: [-70.3050, -23.7667],
        gmapTitle: 'SAE La Negra — Antofagasta', gmapAddress: 'Sector Industrial La Negra, Antofagasta',
        gmapLink: 'https://maps.app.goo.gl/gRZQFQ1moYK7dL9N6?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-23.766806199664497, -70.30505265636437+(Transportes+SAE+La+Negra)&t=&z=14&ie=UTF8&iwloc=&output=embed'
    },
    'copiapo': {
        id: 'copiapo', badge: 'III Región de Atacama', title: 'SAE COPIAPÓ',
        desc: 'Base operativa de conexión minera y agroindustrial en la Región de Atacama.', coords: [-70.4019, -27.3140],
        gmapTitle: 'SAE Copiapó — Atacama', gmapAddress: 'Copiapó, Región de Atacama',
        gmapLink: 'https://maps.app.goo.gl/qu5jSNEbKRiK4C6Z8?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-27.31423161248198, -70.4021270191673+(Transportes+SAE+Copiapo)&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'coquimbo': {
        id: 'coquimbo', badge: 'IV Región de Coquimbo', title: 'CASA MATRIZ (COQUIMBO)',
        desc: 'Gerencia General, Torre de Control CIF 24/7 y Centro Logístico Principal.', coords: [-71.2941, -29.9765],
        gmapTitle: 'Casa Matriz SAE — Coquimbo', gmapAddress: 'Barrio Industrial, Coquimbo',
        gmapLink: 'https://maps.app.goo.gl/tXTgNYGjikzQHQzv7?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-29.976355620633207, -71.29435459224386+(Casa+Matriz+Transportes+SAE+Coquimbo)&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'lampa': {
        id: 'lampa', badge: 'Región Metropolitana', title: 'SAE LAMPA (SANTIAGO)',
        desc: 'Centro de consolidación para rutas troncales y distribución a corporativos.', coords: [-70.7504, -33.2597],
        gmapTitle: 'SAE Lampa — Santiago RM', gmapAddress: 'Lampa, Región Metropolitana, Santiago',
        gmapLink: 'https://maps.app.goo.gl/TAKzGgL58QskpaR5A?g_st=ic', gmapEmbed: 'https://maps.google.com/maps?q=-33.25979452522498, -70.75052632717413 +(Transportes+SAE+Lampa)&t=&z=14&ie=UTF8&iwloc=&output=embed'
    }
};

const branchesList = Object.values(branchesData);
let d3Svg, d3G, d3Projection;

function initD3Map() {
    const mapContainer = d3.select("#d3-map-canvas");
    if (!mapContainer.node()) return;

    const vWidth = 400;
    const vHeight = 600;

    d3Svg = mapContainer.append("svg").attr("viewBox", `0 0 ${vWidth} ${vHeight}`).attr("preserveAspectRatio", "xMidYMid meet").attr("width", "100%").attr("height", "100%").style("display", "block");
    d3G = d3Svg.append("g");

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json").then(function(world) {
        d3.select("#d3-loading-screen").transition().duration(500).style("opacity", 0).remove();
        const chile = topojson.feature(world, world.objects.countries).features.find(d => d.id === "152");
        
        const mainlandBounds = {
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry: { type: "LineString", coordinates: [[-75.5, -17.5], [-66.5, -56.0]] } }]
        };

        const paddingX = 50; const paddingY = 30; 
        d3Projection = d3.geoMercator().fitExtent([[paddingX, paddingY], [vWidth - paddingX, vHeight - paddingY]], mainlandBounds);
        const path = d3.geoPath().projection(d3Projection);

        d3G.append("path").datum(chile).attr("d", path).attr("class", "d3-map-path");

        const markers = d3G.selectAll("g.marker-group").data(branchesList).enter().append("g").attr("class", "marker-group")
            .attr("transform", d => `translate(${d3Projection(d.coords)[0]}, ${d3Projection(d.coords)[1]})`);

        markers.append("circle").attr("r", 4.5).attr("class", "d3-marker-pulse");
        markers.append("circle").attr("r", 4.5).attr("class", "d3-marker").attr("id", d => `d3-marker-${d.id}`).on("click", (event, d) => handleBranchSelection(d.id));

        handleBranchSelection('alto-hospicio');
    }).catch(err => {
        console.error("Error cargando mapa D3:", err);
        document.getElementById('d3-loading-screen').innerHTML = "<span class='text-red-500'>Error de conexión al servidor</span>";
    });
}

function handleBranchSelection(key) {
    const data = branchesData[key];
    if (!data) return;

    const mobileSelect = document.getElementById('mobile-branch-select');
    if (mobileSelect && mobileSelect.value !== key) mobileSelect.value = key;

    document.querySelectorAll('.branch-item').forEach(btn => {
        btn.classList.remove('bg-blue-50/80', 'border-mapRoyal', 'border-l-mapRoyal', 'shadow-md');
        btn.classList.add('bg-white', 'border-slate-200');
        const icon = btn.querySelector('i');
        if(icon) icon.className = btn.id === 'btn-coquimbo' ? 'fa-solid fa-star text-amber-500 text-base' : 'fa-solid fa-location-dot text-slate-300 text-base transition';
    });
    const activeBtn = document.getElementById('btn-' + key);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'border-slate-200');
        activeBtn.classList.add('bg-blue-50/80', 'border-mapRoyal', 'border-l-mapRoyal', 'shadow-md');
        const activeIcon = activeBtn.querySelector('i');
        if(activeIcon) activeIcon.className = key === 'coquimbo' ? 'fa-solid fa-star text-amber-500 text-base' : 'fa-solid fa-location-dot text-mapRoyal text-base';
    }

    document.getElementById('gmap-branch-title').textContent = data.gmapTitle;
    document.getElementById('gmap-external-link').href = data.gmapLink;
    document.getElementById('gmap-iframe').src = data.gmapEmbed;
    document.getElementById('gmap-address-footer').innerHTML = `<i class="fa-solid fa-map-pin text-saeBlue mr-1"></i> ${data.gmapAddress}`;

    if (d3G && d3Projection) {
        d3G.selectAll(".d3-marker").classed("active", false);
        d3.select(`#d3-marker-${key}`).classed("active", true);

        const tooltip = document.getElementById('d3-tooltip-box');
        document.getElementById('d3-card-badge').textContent = data.badge;
        document.getElementById('d3-card-title').textContent = data.title;
        document.getElementById('d3-card-desc').textContent = data.desc;
        
        requestAnimationFrame(() => {
            const markerNode = document.getElementById(`d3-marker-${key}`);
            if(markerNode) {
                const markerRect = markerNode.getBoundingClientRect();
                tooltip.style.left = `${markerRect.left + window.scrollX + (markerRect.width / 2)}px`;
                tooltip.style.top = `${markerRect.top + window.scrollY}px`;
                tooltip.classList.add('show');
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initD3Map();
    setTimeout(() => { if(!d3Svg) handleBranchSelection('alto-hospicio'); }, 300);
});

window.addEventListener('resize', () => {
    const activeDot = document.querySelector('.d3-marker.active');
    if (activeDot) handleBranchSelection(activeDot.id.replace('d3-marker-', ''));
});

// ==========================================================================
// UTILIDADES (Contadores y Menú Móvil)
// ==========================================================================
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            let count = 0;
            const step = Math.max(1, Math.ceil(target / 45));
            const timer = setInterval(() => {
                count += step;
                if (count >= target) { el.textContent = target; clearInterval(timer); } 
                else { el.textContent = count; }
            }, 25);
            observer.unobserve(el);
        }
    });
}, { threshold: 0.3 });
counters.forEach(counter => counterObserver.observe(counter));

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});