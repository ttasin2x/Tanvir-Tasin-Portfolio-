import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDNtkM7hLeIsD2HzWxQKJFH8fsXOVKrv18", authDomain: "tanvir-gallery-free.firebaseapp.com", databaseURL: "https://tanvir-gallery-free-default-rtdb.firebaseio.com", projectId: "tanvir-gallery-free", storageBucket: "tanvir-gallery-free.firebasestorage.app", messagingSenderId: "442605910126", appId: "1:442605910126:web:b89792cb6204a5b7eb0e7f" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 1. PREMIUM SITE PRELOADER ---
const preloaderHTML = `<div id="site-preloader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#ffffff; z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; transition:opacity 0.6s ease-out;"><div class="loader-pulse"></div><div style="margin-top:20px; font-family:'Outfit', sans-serif; color:#64748b; font-size:0.9rem; letter-spacing:2px; font-weight:600; text-transform:uppercase; animation:fadeIn 1s infinite alternate;">Loading</div><style>.loader-pulse { position: relative; width: 60px; height: 60px; background: #2563eb; border-radius: 50%; animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; } .loader-pulse::after { content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #fff; border-radius: 50%; animation: pulse-dot 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite; } @keyframes pulse-ring { 0% { transform: scale(0.33); } 80%, 100% { opacity: 0; } } @keyframes pulse-dot { 0% { transform: scale(0.8); } 50% { transform: scale(1); } 100% { transform: scale(0.8); } } @keyframes fadeIn { from { opacity: 0.5; } to { opacity: 1; } }</style></div>`;
if (!document.getElementById('site-preloader')) { document.body.insertAdjacentHTML('afterbegin', preloaderHTML); }

// --- 2. PRO SCROLL PROGRESS BAR ---
const scrollBar = document.createElement('div');
scrollBar.id = 'pro-scroll-bar';
Object.assign(scrollBar.style, { position: 'fixed', top: '0', left: '0', height: '4px', background: 'linear-gradient(90deg, #2563eb, #ec4899)', zIndex: '9999', width: '0%', transition: 'width 0.1s' });
document.body.appendChild(scrollBar);
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollBar.style.width = scrolled + "%";
});

// --- 3. ADVANCED VISITOR TRACKING ---
if (!localStorage.getItem('admin_bypass')) {
    const visitRef = ref(db, 'site_stats/visits');
    runTransaction(visitRef, (currentVisits) => { return (currentVisits || 0) + 1; });

    if (!sessionStorage.getItem('logged_device')) {
        fetch('https://ipwho.is/').then(response => response.json()).then(data => {
            const ua = navigator.userAgent;
            let deviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? "Mobile" : "Desktop";
            const success = data.success !== false;
            push(ref(db, 'visit_logs'), { ip: data.ip || 'Unknown', city: success ? data.city : 'Unknown City', country: success ? data.country : 'Unknown Country', country_code: success ? data.country_code.toLowerCase() : 'bd', org: success ? (data.connection ? data.connection.org : data.isp) : 'Unknown ISP', device_type: deviceType, raw_agent: ua, time: new Date().toLocaleString() });
            sessionStorage.setItem('logged_device', 'true');
        }).catch(() => {
            push(ref(db, 'visit_logs'), { city: 'Unknown', country: 'Unknown', country_code: 'bd', device_type: "Unknown", raw_agent: navigator.userAgent, time: new Date().toLocaleString() });
            sessionStorage.setItem('logged_device', 'true');
        });
    }
}

// --- DYNAMIC SITE CONTENT ---
onValue(ref(db, 'site_content'), (snap) => {
    const d = snap.val();
    if(d) {
        const setTxt = (id, val) => { const el = document.getElementById(id); if(el && val) el.innerText = val; };
        const setHref = (id, val) => { const el = document.getElementById(id); if(el && val) el.href = val; };
        if(d.hero) { setTxt('heroSubtitle', d.hero.subtitle); setTxt('heroTitle', d.hero.title); setTxt('heroDesc', d.hero.desc); }
        if(d.about) { setTxt('aboutTitle', d.about.title); setTxt('aboutSubtitle', d.about.subtitle); setTxt('aboutDesc', d.about.desc); setTxt('aboutLoc', d.about.location); setTxt('aboutPhone', d.about.phone); setTxt('aboutEmail', d.about.email); }
        if(d.links) { setHref('linkFB', d.links.fb); setHref('linkInsta', d.links.insta); setHref('linkWA', d.links.wa); }
    }
});

// --- STANDARD FEATURES ---
onValue(ref(db, 'hero'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicHeroImg').src = snap.val().imageUrl; });
onValue(ref(db, 'profile'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicProfileImg').src = snap.val().imageUrl; });

// 1. HOME WORKS (Updated with Skeleton Logic)
const galleryGrid = document.getElementById('galleryGrid');
if(galleryGrid) { 
    onValue(ref(db, 'home_works'), (snap) => { 
        const data = snap.val(); 
        
        // ডেটা পেলে Skeleton সরিয়ে ফেলা হবে, না পেলে মেসেজ দেখাবে
        galleryGrid.innerHTML = ""; 
        
        if(data) { 
            const images = Object.values(data).reverse(); 
            images.forEach((item, index) => { 
                const div = document.createElement('div'); 
                div.className = "gallery-item"; 
                // অ্যানিমেশন একটু ফাস্ট করার জন্য ডিলে কমানো হলো
                div.setAttribute('data-aos', 'fade-up'); 
                div.setAttribute('data-aos-delay', (index % 4) * 50); 
                div.setAttribute('onclick', `window.openLightboxFromURL('${item.url}')`); 
                div.innerHTML = `<img src="${item.url}" loading="lazy"><div class="overlay"><i class="fas fa-expand"></i></div>`; 
                galleryGrid.appendChild(div); 
            }); 
            initGalleryLogic(); 
            setTimeout(() => { if(typeof AOS !== 'undefined') AOS.refreshHard(); }, 600); 
        } else {
            galleryGrid.innerHTML = "<p>No works found.</p>";
        }
    }); 
}

// 2. SDGs
const sdgGrid = document.getElementById('sdgGrid');
if(sdgGrid) { onValue(ref(db, 'sdgs'), (snap) => { const data = snap.val(); sdgGrid.innerHTML = ""; if(data) Object.values(data).reverse().forEach((item, index) => { sdgGrid.innerHTML += ` <a href="${item.link}" target="_blank" class="sdg-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}"> <div class="sdg-img"><img src="${item.image}"></div> <div class="sdg-text"><h3>${item.title}</h3></div> </a>`; }); }); }

// 3. PHOTOGRAPHY
const photoGrid = document.getElementById('photoGrid');
if (photoGrid) {
    onValue(ref(db, 'home_photography'), (snap) => {
        const data = snap.val();
        photoGrid.innerHTML = "";
        if (data) {
            const images = Object.values(data).reverse().slice(0, 3); 
            images.forEach((item, index) => {
                photoGrid.innerHTML += `
                <div class="sdg-card" data-aos="fade-up" data-aos-delay="${index * 100}" onclick="window.openLightboxFromURL('${item.url}')" style="cursor: pointer;">
                    <div class="sdg-img" style="height: 250px;">
                        <img src="${item.url}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.5s;">
                    </div>
                </div>`;
            });
        } else {
            photoGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #999;">Loading Photos...</p>`;
        }
    });
}

// --- HELPER FUNCTIONS ---
window.openLightboxFromURL = (url) => { const lb = document.getElementById('lightbox'); document.getElementById('lightbox-img').src = url; lb.classList.add('active'); document.body.style.overflow = 'hidden'; }
window.openModal = (modalId) => { document.getElementById(modalId).style.display = 'flex'; }
window.closeModal = (event, modalId) => { if (event.target.id === modalId || event.target.tagName === 'BUTTON') { document.getElementById(modalId).style.display = 'none'; } }
const initialCount = 4; let visibleCount = initialCount;
function initGalleryLogic() { const items = document.querySelectorAll('.gallery-item'); const moreBtn = document.getElementById("view-more-btn"); for (let i = 0; i < items.length; i++) { if (i < initialCount) items[i].classList.add('visible'); } if(items.length > initialCount && moreBtn) moreBtn.style.display = 'inline-flex'; }
window.initGalleryLogic = initGalleryLogic;
window.loadMoreImages = () => { const items = document.querySelectorAll('.gallery-item'); let end = visibleCount + 4; let delay = 0; for (let i = visibleCount; i < end && i < items.length; i++) { items[i].removeAttribute('data-aos'); items[i].removeAttribute('data-aos-delay'); setTimeout(() => { items[i].classList.add('visible'); items[i].classList.add('animate-custom'); }, delay); delay += 150; } visibleCount = end; const moreBtn = document.getElementById("view-more-btn"); const lessBtn = document.getElementById("view-less-btn"); if (visibleCount >= items.length) moreBtn.style.display = 'none'; lessBtn.style.display = 'inline-flex'; }
window.viewLessImages = () => { const items = document.querySelectorAll('.gallery-item'); for (let i = initialCount; i < items.length; i++) { items[i].classList.remove('visible'); items[i].classList.remove('animate-custom'); } visibleCount = initialCount; document.getElementById("view-more-btn").style.display = 'inline-flex'; document.getElementById("view-less-btn").style.display = 'none'; document.getElementById('my-works').scrollIntoView({behavior: 'smooth'}); }
window.goToPage = (url) => { document.getElementById('pageTransition').classList.add('active'); setTimeout(() => { window.location.href = url; }, 500); }
window.closeLightbox = (event) => { if (event.target.id === 'lightbox' || event.target.tagName === 'I') { document.getElementById('lightbox').classList.remove('active'); document.body.style.overflow = 'auto'; } }
window.scrollToTop = () => { window.scrollTo({top: 0, behavior: 'smooth'}); }

// --- FAST PRELOADER FIX (Reduced Timeout) ---
window.onload = function() { 
    createSoftSnowfall(); 
    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true }); 

    const loader = document.getElementById('site-preloader');
    if(loader) { 
        loader.style.opacity = '0'; 
        // Changed from 600ms to 200ms for faster interaction
        setTimeout(() => loader.remove(), 200); 
    }
};

window.onscroll = function() { const btn = document.getElementById("backToTop"); if(btn) btn.style.display = (window.scrollY > 300) ? "flex" : "none"; };
function createSoftSnowfall() { const container = document.getElementById('weather-container'); if(!container) return; for (let i = 0; i < 35; i++) { const flake = document.createElement('div'); flake.classList.add('snowflake'); flake.innerHTML = '❄'; flake.style.left = Math.random() * 100 + 'vw'; flake.style.animationDuration = `${Math.random() * 10 + 5}s, ${Math.random() * 4 + 3}s`; flake.style.animationDelay = Math.random() * 5 + 's'; container.appendChild(flake); } setTimeout(() => { container.style.opacity = '0'; }, 6000); }

window.triggerCameraAnim = (btn) => {
    if (!btn.classList.contains('animate')) {
        btn.classList.add('animate');
        setTimeout(() => { window.goToPage('photography.html'); }, 3800);
    }
};
