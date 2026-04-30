/**
 * Shared Components for Raghuvir Consultants Website
 * Renders consistent header and footer across all pages.
 */

function renderHeader(activePage) {
    const nav = document.getElementById('site-header');
    if (!nav) return;

    const links = [
        { label: 'Home', href: 'index.html', id: 'home' },
        { label: 'Services', href: 'services.html', id: 'services' },
        { label: 'Smallcase', href: 'smallcase.html', id: 'smallcase' },
        { label: 'About', href: 'about.html', id: 'about' },
        { label: 'Contact', href: 'contact.html', id: 'contact' },
    ];

    const navLinksHTML = links.map(link => {
        const isActive = link.id === activePage;
        const cls = isActive
            ? 'text-black font-bold transition-colors'
            : 'hover:text-black transition-colors';
        return `<a href="${link.href}" class="${cls}">${link.label}</a>`;
    }).join('\n                ');

    nav.innerHTML = `
    <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" role="navigation" aria-label="Main navigation">
        <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="index.html" class="flex items-center space-x-2" aria-label="Raghuvir Consultants Home">
                <div class="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <span class="text-white font-bold text-xs">RC</span>
                </div>
                <span class="font-semibold tracking-tight uppercase text-sm">Raghuvir Consultants</span>
            </a>
            <div class="hidden md:flex space-x-8 text-xs font-medium uppercase tracking-widest text-gray-500">
                ${navLinksHTML}
            </div>
            <!-- Mobile menu button -->
            <button id="mobile-menu-btn" class="md:hidden w-10 h-10 flex items-center justify-center" aria-label="Toggle menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            </button>
        </div>
        <!-- Mobile menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            ${links.map(link => {
                const isActive = link.id === activePage;
                const cls = isActive ? 'text-black font-bold' : 'text-gray-500 hover:text-black';
                return `<a href="${link.href}" class="block text-sm uppercase tracking-widest ${cls}">${link.label}</a>`;
            }).join('\n            ')}
        </div>
    </nav>`;

    // Mobile menu toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }
}

function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    footer.innerHTML = `
    <footer class="py-20 px-6 bg-black text-white" role="contentinfo">
        <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <!-- Brand -->
                <div class="md:col-span-1">
                    <a href="index.html" class="flex items-center space-x-2 mb-6 inline-flex" aria-label="Raghuvir Consultants Home">
                        <div class="w-8 h-8 bg-white rounded flex items-center justify-center">
                            <span class="text-black font-bold text-xs">RC</span>
                        </div>
                        <span class="font-semibold tracking-tight uppercase text-sm">Raghuvir Consultants</span>
                    </a>
                    <p class="text-gray-500 text-sm leading-relaxed mb-6">
                        SEBI Registered Investment Advisor. Professional wealth advisory for high-net-worth individuals and professionals.
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <span class="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded">Ahmedabad</span>
                        <span class="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded">Mumbai</span>
                        <span class="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded">London</span>
                    </div>
                </div>

                <!-- Quick Links -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Quick Links</h4>
                    <ul class="space-y-3">
                        <li><a href="index.html" class="text-sm text-gray-500 hover:text-white transition-colors">Home</a></li>
                        <li><a href="services.html" class="text-sm text-gray-500 hover:text-white transition-colors">Services</a></li>
                        <li><a href="smallcase.html" class="text-sm text-gray-500 hover:text-white transition-colors">Smallcase</a></li>
                        <li><a href="about.html" class="text-sm text-gray-500 hover:text-white transition-colors">About</a></li>
                        <li><a href="contact.html" class="text-sm text-gray-500 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>

                <!-- Strategies -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Strategies</h4>
                    <ul class="space-y-3">
                        <li><a href="all-weather-strategy.html" class="text-sm text-gray-500 hover:text-white transition-colors">All-Weather Strategy</a></li>
                        <li><a href="trend-following-conservative.html" class="text-sm text-gray-500 hover:text-white transition-colors">Trend Following (Cons.)</a></li>
                        <li><a href="trend-following-aggressive.html" class="text-sm text-gray-500 hover:text-white transition-colors">Trend Following (Agg.)</a></li>
                    </ul>
                </div>

                <!-- CTA -->
                <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Confidential Advisory</p>
                    <p class="text-2xl serif mb-6 italic">Secure your legacy.</p>
                    <a href="contact.html" class="inline-block bg-white text-black px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all rounded-full">
                        Get in Touch
                    </a>
                </div>
            </div>

            <!-- Bottom bar -->
            <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-[10px] text-gray-600 uppercase tracking-widest">© 2026 Raghuvir Consultants. All Rights Reserved.</p>
                <div class="flex space-x-6">
                    <a href="terms.html" class="text-[10px] text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors">Terms & Conditions</a>
                    <a href="privacy.html" class="text-[10px] text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors">Privacy Policy</a>
                </div>
                <p class="text-[10px] text-gray-600 uppercase tracking-widest">Investment is subject to market risks.</p>
            </div>
        </div>
    </footer>`;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const headerEl = document.getElementById('site-header');
    if (headerEl) {
        const activePage = headerEl.getAttribute('data-active') || '';
        renderHeader(activePage);
    }
    renderFooter();
});
