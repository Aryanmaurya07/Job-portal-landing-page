// ---------------------------
// Utilities
// ---------------------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const currencyFormat = (n) =>
  "₹" + (Number(n) || 0).toLocaleString("en-IN");

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// ---------------------------
// Topbar close
// ---------------------------
(() => {
  const closeBtn = $(".topbar-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeBtn.parentElement.remove());
  }
})();

// ---------------------------
// Navbar sticky shadow + mobile menu
// ---------------------------
(() => {
  const navbar = $("#navbar");
  const mobileMenu = $("#mobileMenu");
  const hamburger = $("#hamburger");
  const links = $$(".mobile-link", mobileMenu);

  const setShadow = () => {
    if (window.scrollY > 8) navbar.classList.add("shadow");
    else navbar.classList.remove("shadow");
  };
  setShadow();
  window.addEventListener("scroll", setShadow);

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
  links.forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.remove("show"))
  );
})();

// ---------------------------
/* Theme toggle - saves to localStorage */
(() => {
  const KEY = "hireright-theme";
  const themeToggle = $("#themeToggle");
  const saved = localStorage.getItem(KEY);
  if (saved === "light") document.body.classList.add("light");

  const flip = () => {
    document.body.classList.toggle("light");
    localStorage.setItem(KEY, document.body.classList.contains("light") ? "light" : "dark");
  };
  themeToggle.addEventListener("click", flip);
})();

// ---------------------------
// Typewriter effect
// ---------------------------
(() => {
  const el = $("#typewriter");
  if (!el) return;
  const lines = [
    "No frameworks. Only JavaScript. 💪",
    "Personalized job matches. 🎯",
    "Apply 5× faster with Quick Apply. ⚡",
  ];
  let i = 0, j = 0, del = false;

  const tick = () => {
    const line = lines[i];
    if (!del) {
      el.textContent = line.slice(0, j++);
      if (j > line.length + 5) del = true;
    } else {
      el.textContent = line.slice(0, j--);
      if (j < 0) { del = false; i = (i + 1) % lines.length; }
    }
    setTimeout(tick, del ? 35 : 55);
  };
  tick();
})();

// ---------------------------
// Reveal on scroll
// ---------------------------
(() => {
  const items = $$("[data-reveal]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("reveal-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16 });
  items.forEach((it) => io.observe(it));
})();

// ---------------------------
// Job data (demo)
// ---------------------------
const JOBS = [
  { id:1, title:"Frontend Engineer", company:"NovaLabs", location:"Bengaluru, IN", remote:true, salary:1800000, category:"Engineering", tags:["React","TypeScript","Tailwind"], featured:true },
  { id:2, title:"UI/UX Designer", company:"PixelWorks", location:"Remote", remote:true, salary:1400000, category:"Design", tags:["Figma","Prototyping","Design Systems"], featured:true },
  { id:3, title:"Backend Developer", company:"CloudCraft", location:"Hyderabad, IN", remote:false, salary:2000000, category:"Engineering", tags:["Node.js","PostgreSQL","AWS"], featured:true },
  { id:4, title:"Product Manager", company:"FlowHQ", location:"Gurugram, IN", remote:false, salary:2800000, category:"Product", tags:["Roadmaps","A/B","Analytics"], featured:true },
  { id:5, title:"Marketing Specialist", company:"Growthify", location:"Mumbai, IN", remote:false, salary:900000, category:"Marketing", tags:["SEO","Content","Paid Ads"], featured:false },
  { id:6, title:"HR Generalist", company:"PeopleFirst", location:"Pune, IN", remote:false, salary:800000, category:"HR", tags:["Hiring","Payroll","Onboarding"], featured:false },
  { id:7, title:"SRE Engineer", company:"UptimeX", location:"Remote", remote:true, salary:2400000, category:"Engineering", tags:["Kubernetes","Terraform","GCP"], featured:false },
  { id:8, title:"Product Designer", company:"DesignDen", location:"Bengaluru, IN", remote:true, salary:1600000, category:"Design", tags:["Figma","UX Research","Motion"], featured:false },
  { id:9, title:"Ops Manager", company:"MoveFast", location:"Noida, IN", remote:false, salary:1200000, category:"Operations", tags:["Process","Vendor","SLA"], featured:false },
  { id:10, title:"Growth PM", company:"Looply", location:"Remote", remote:true, salary:2200000, category:"Product", tags:["Experimentation","Funnels","SQL"], featured:false },
  { id:11, title:"Junior Frontend (Fresher)", company:"SparkStart", location:"Remote", remote:true, salary:600000, category:"Engineering", tags:["Fresher","HTML","CSS","JS"], featured:false },
  { id:12, title:"Copywriter", company:"StoryLab", location:"Remote", remote:true, salary:700000, category:"Marketing", tags:["Copy","Social","Email"], featured:false },
];

// ---------------------------
// Render “Recommended” mini-list in Hero mockup
// ---------------------------
(() => {
  const ul = $("#mockupList");
  if (!ul) return;
  const rec = JOBS.filter(j => j.featured).slice(0,3);
  ul.innerHTML = rec.map(j => `
    <li>
      <div class="logo">${j.company[0]}</div>
      <div>
        <div class="mockup-company">${j.company}</div>
        <div class="mockup-role">${j.title}</div>
        <div class="muted">${j.location}${j.remote ? " • Remote" : ""}</div>
      </div>
    </li>
  `).join("");
})();

// ---------------------------
// Job rendering, filtering, sorting, pagination
// ---------------------------
const state = {
  query: "",
  city: "",
  category: "All",
  remoteOnly: false,
  sortBy: "newest",
  page: 1,
  perPage: 6,
  dataset: [...JOBS]
};

const jobGrid = $("#jobGrid");
const searchQuery = $("#searchQuery");
const searchCity = $("#searchCity");
const searchBtn = $("#searchBtn");
const quickTags = $$(".tag");
const catBtns = $$(".cat-btn");
const remoteOnly = $("#remoteOnly");
const sortBy = $("#sortBy");
const loadMore = $("#loadMore");

function applyFilters(){
  let arr = [...JOBS];

  // text search
  const q = state.query.toLowerCase();
  const c = state.city.toLowerCase();

  if (q) {
    arr = arr.filter(j =>
      `${j.title} ${j.company} ${j.tags.join(" ")}`.toLowerCase().includes(q)
    );
  }
  if (c) {
    const isRemote = c.includes("remote");
    arr = arr.filter(j => isRemote ? j.remote : j.location.toLowerCase().includes(c));
  }
  if (state.category !== "All") {
    arr = arr.filter(j => j.category === state.category);
  }
  if (state.remoteOnly) {
    arr = arr.filter(j => j.remote);
  }
  // sort
  if (state.sortBy === "salaryHigh") arr.sort((a,b)=>b.salary-a.salary);
  else if (state.sortBy === "salaryLow") arr.sort((a,b)=>a.salary-b.salary);
  else arr.sort((a,b)=>b.id-a.id); // newest = higher id

  state.dataset = arr;
  state.page = 1;
  renderJobs();
}

function renderJobs(){
  const start = 0;
  const end = state.page * state.perPage;
  const shown = state.dataset.slice(start, end);

  jobGrid.innerHTML = shown.map(cardTemplate).join("");
  // show/hide load more
  loadMore.style.display = state.dataset.length > end ? "inline-block" : "none";

  // small fade-in
  $$(".job-card").forEach((el,i)=>{
    el.style.opacity = 0;
    el.style.transform = "translateY(8px)";
    setTimeout(()=>{
      el.style.transition = "opacity .35s ease, transform .35s ease";
      el.style.opacity = 1; el.style.transform = "translateY(0)";
    }, 30 + i*30);
  });
}

function cardTemplate(j){
  const tagHtml = j.tags.map(t=>`<span class="tag-chip">${t}</span>`).join("");
  return `
  <article class="job-card">
    ${j.featured ? `<div class="job-badge">FEATURED</div>` : ""}
    <div class="job-top">
      <div class="logo">${j.company[0]}</div>
      <div>
        <div class="title">${j.title}</div>
        <div class="loc">${j.company} • ${j.location}${j.remote ? " • Remote" : ""}</div>
      </div>
    </div>
    <div class="tags">${tagHtml}</div>
    <div class="job-bottom">
      <div class="salary">${currencyFormat(j.salary)}</div>
      <button class="apply" data-apply="${j.id}">Apply Now</button>
    </div>
  </article>`;
}

// events
searchBtn.addEventListener("click", () => {
  state.query = searchQuery.value.trim();
  state.city = searchCity.value.trim();
  applyFilters();
});
[searchQuery, searchCity].forEach(inp =>
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { state.query = searchQuery.value.trim(); state.city = searchCity.value.trim(); applyFilters(); }
  })
);
quickTags.forEach(btn => btn.addEventListener("click", () => {
  state.query = btn.dataset.q;
  searchQuery.value = state.query;
  applyFilters();
}));
catBtns.forEach(btn => btn.addEventListener("click", () => {
  catBtns.forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  state.category = btn.dataset.cat;
  applyFilters();
}));
remoteOnly.addEventListener("change", () => { state.remoteOnly = remoteOnly.checked; applyFilters(); });
sortBy.addEventListener("change", () => { state.sortBy = sortBy.value; applyFilters(); });
loadMore.addEventListener("click", () => {
  state.page += 1;
  renderJobs();
});
// Initial render
applyFilters();

// Apply Now (demo)
jobGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-apply]");
  if (!btn) return;
  const id = Number(btn.dataset.apply);
  const job = JOBS.find(j => j.id === id);
  alert(`✅ Applied to ${job.title} @ ${job.company} (demo).`);
});

// ---------------------------
// Stats counters
// ---------------------------
(() => {
  const blocks = $$("[data-counter]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const n = Number(el.dataset.counter);
      const numEl = $("[data-counter-num]", el);
      let cur = 0;
      const step = Math.ceil(n / 60);
      const t = setInterval(()=>{
        cur += step;
        if (cur >= n) { cur = n; clearInterval(t); }
        numEl.textContent = cur.toLocaleString("en-IN");
      }, 20);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  blocks.forEach(b => io.observe(b));
})();

// ---------------------------
// Testimonials carousel
// ---------------------------
(() => {
  const slides = [
    { quote:"I landed my first frontend role within two weeks. The Quick Apply is a game-changer!", name:"Aryan M." },
    { quote:"As a recruiter, I filled 3 roles in 10 days. Relevance of candidates was top-notch.", name:"Aditi S." },
    { quote:"Filtering by tags + remote helped me find exactly what I wanted.", name:"Rahul K." },
  ];
  const track = $("#carTrack");
  const prev = $("#carPrev");
  const next = $("#carNext");
  let idx = 0, timer;

  function render(){
    track.innerHTML = slides.map(s => `
      <div class="slide">
        <div class="testi">
          <div class="quote">“${s.quote}”</div>
          <div class="name">— ${s.name}</div>
        </div>
      </div>`).join("");
    move(0);
    start();
  }
  function move(delta){
    idx = (idx + delta + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
  }
  function start(){
    stop();
    timer = setInterval(()=>move(1), 4000);
  }
  function stop(){ if (timer) clearInterval(timer); }

  prev.addEventListener("click", ()=>{ move(-1); start(); });
  next.addEventListener("click", ()=>{ move(1); start(); });
  render();
})();

// ---------------------------
// FAQ accordion
// ---------------------------
(() => {
  $$(".faq-item").forEach(item => {
    $(".faq-q", item).addEventListener("click", ()=>{
      item.classList.toggle("open");
    });
  });
})();

// ---------------------------
// Newsletter validation
// ---------------------------
(() => {
  const form = $("#newsletterForm");
  const email = $("#newsletterEmail");
  const hint = $("#newsletterHint");
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const val = String(email.value || "").trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      hint.textContent = "Please enter a valid email address.";
      hint.style.color = "#ff8e8e";
      email.focus();
      return;
    }
    hint.textContent = "Subscribed! Check your inbox for confirmation.";
    hint.style.color = "#9ee7c9";
    email.value = "";
  });
})();

// ---------------------------
// Employer modal + fake submit adds job to grid
// ---------------------------
(() => {
  const modal = $("#employerModal");
  const openBtns = ["#openEmployerModal","#openEmployerModalMobile","#openEmployerModal2"].map(sel => $(sel));
  const closeElems = $$("[data-close]", modal);
  const form = $("#employerForm");
  const success = $("#employerSuccess");

  function open(){ modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); }
  function close(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); success.hidden = true; form.hidden = false; form.reset(); }
  openBtns.forEach(b => b && b.addEventListener("click", open));
  closeElems.forEach(el => el.addEventListener("click", close));
  $(".modal-backdrop", modal).addEventListener("click", close);
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") close(); });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    // Basic validation
    const comp = $("#emCompany").value.trim();
    const title = $("#emTitle").value.trim();
    const loc = $("#emLocation").value.trim();
    const salary = clamp(Number($("#emSalary").value), 1, 100000000);
    const tags = $("#emTags").value.split(",").map(t=>t.trim()).filter(Boolean);
    const category = $("#emCategory").value;

    if(!comp || !title || !loc || !salary) return;

    const newJob = {
      id: JOBS.length + 1,
      title,
      company: comp,
      location: loc,
      remote: /remote/i.test(loc),
      salary,
      category,
      tags: tags.length ? tags : ["New"],
      featured: true
    };
    JOBS.unshift(newJob); // add to top (newest)
    applyFilters(); // re-render grid
    success.hidden = false;
    form.hidden = true;
  });
})();

// ---------------------------
// Misc
// ---------------------------
(() => {
  $("#year").textContent = new Date().getFullYear();
})();
