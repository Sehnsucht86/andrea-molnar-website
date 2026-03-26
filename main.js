/* ==========================================================
   Andrea Molnár - Personal Website
   main.js - Language switching, form, menu, animations
   ========================================================== */

(function () {
    'use strict';

    // ========== STATE ==========
    let currentLang = 'hu';
    let translations = {};

    // ========== DOM ELEMENTS ==========
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const langToggle = document.getElementById('lang-toggle');
    const form = document.getElementById('newsletter-form');
    const formMessage = document.getElementById('form-message');

    // ========== LANGUAGE SYSTEM ==========

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`./i18n/${lang}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            return await response.json();
        } catch (error) {
            console.warn(`Could not load translations for "${lang}":`, error);
            return {};
        }
    }

    function applyTranslations(trans) {
        // Text content
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (trans[key]) {
                el.textContent = trans[key];
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (trans[key]) {
                el.placeholder = trans[key];
            }
        });
    }

    function updateLangToggleUI(lang) {
        document.querySelectorAll('.lang-option').forEach(function (el) {
            if (el.getAttribute('data-lang') === lang) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        document.documentElement.lang = lang;
    }

    async function setLanguage(lang) {
        translations = await loadTranslations(lang);
        if (Object.keys(translations).length === 0) return;

        currentLang = lang;
        applyTranslations(translations);
        updateLangToggleUI(lang);
        localStorage.setItem('preferred-lang', lang);
    }

    function detectLanguage() {
        // 1. Check localStorage
        var saved = localStorage.getItem('preferred-lang');
        if (saved && (saved === 'hu' || saved === 'en')) return saved;

        // 2. Check browser language
        var browserLang = navigator.language || navigator.userLanguage || '';
        if (browserLang.startsWith('hu')) return 'hu';

        // 3. Default to Hungarian
        return 'hu';
    }

    // ========== NAVIGATION ==========

    // Sticky header shadow on scroll
    function handleScroll() {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Hamburger menu toggle
    function toggleMenu() {
        var isOpen = hamburger.classList.toggle('open');
        nav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
    }

    // Close mobile menu when clicking a nav link
    function closeMenu() {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    // ========== SUPABASE CONNECTION ==========
    // A Supabase kliens csatlakozik az adatbázishoz az anon (publikus) kulccsal.
    // Ez a kulcs biztonságos a frontenden, mert a Row Level Security szabályok
    // korlátozzák, hogy csak INSERT műveletet lehessen végrehajtani.

    var SUPABASE_URL = 'https://qoynbefsawqyjnukuhvm.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFveW5iZWZzYXdxeWpudWt1aHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzAzMzgsImV4cCI6MjA5MDEwNjMzOH0.jYMfYCs_0gl2Kh-pll-OZa_PgcfP6cAtWIXmNJ0esMo';
    var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ========== NEWSLETTER FORM ==========

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showMessage(type, text) {
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
    }

    function clearMessage() {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }

    // Elküldi a feliratkozó adatait a Supabase "subscribers" táblába.
    // Ha az email már létezik (23505 = unique constraint violation), jelzi a felhasználónak.
    async function saveSubscriber(data) {
        var result = await supabaseClient
            .from('subscribers')
            .insert([data]);
        if (result.error) {
            if (result.error.code === '23505') {
                showMessage('error', translations['form.already_subscribed'] || 'Ezzel az email címmel már feliratkoztál.');
            } else {
                showMessage('error', translations['form.error_server'] || 'Hiba történt. Kérlek próbáld újra később.');
            }
            return false;
        }
        return true;
    }

    // A form submit kezelője:
    // 1. Validálja az email címet
    // 2. Összegyűjti a név, email és nyelvi preferencia adatokat
    // 3. Elküldi a Supabase-be a saveSubscriber() függvénnyel
    // 4. Siker esetén üzenetet mutat, hiba esetén hibaüzenetet
    async function handleFormSubmit(e) {
        e.preventDefault();
        clearMessage();

        var emailInput = form.querySelector('input[name="email"]');
        var email = emailInput.value.trim();

        if (!email || !isValidEmail(email)) {
            emailInput.classList.add('error');
            showMessage('error', translations['form.error_invalid_email'] || 'Kérlek adj meg egy érvényes email címet.');
            return;
        }

        emailInput.classList.remove('error');

        // Adatok összegyűjtése a formból
        var name = form.querySelector('input[name="name"]').value.trim();
        var langPref = form.querySelector('input[name="lang_pref"]:checked').value;

        // Mentés a Supabase adatbázisba
        var saved = await saveSubscriber({ name: name, email: email, lang_pref: langPref });
        if (saved) {
            showMessage('success', translations['form.success'] || 'Köszönöm a feliratkozást! Hamarosan jelentkezem.');
            form.reset();
        }
    }

    // ========== SCROLL ANIMATIONS ==========

    function initScrollAnimations() {
        var elements = document.querySelectorAll('.animate-on-scroll');

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show everything immediately
            elements.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    // ========== INITIALIZATION ==========

    function init() {
        // Set initial language
        var lang = detectLanguage();
        updateLangToggleUI(lang);
        setLanguage(lang);

        // Event: scroll
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // Event: hamburger menu
        hamburger.addEventListener('click', toggleMenu);

        // Event: nav links close mobile menu
        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        // Event: language toggle
        langToggle.addEventListener('click', function () {
            var newLang = currentLang === 'hu' ? 'en' : 'hu';
            setLanguage(newLang);
        });

        // Event: form submit
        form.addEventListener('submit', handleFormSubmit);

        // Event: clear error on email input
        var emailInput = form.querySelector('input[name="email"]');
        emailInput.addEventListener('input', function () {
            emailInput.classList.remove('error');
            clearMessage();
        });

        // Scroll animations
        initScrollAnimations();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
