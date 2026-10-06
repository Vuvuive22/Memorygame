export default class NotificationUI {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create container if not exists
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }
        this.container = container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Basic Styles for the toast
        // We can also add these to app.css, but inline for now ensures it works immediately
        toast.style.background = type === 'error' ? '#ff4d4f' :
            type === 'success' ? '#52c41a' :
                'rgba(46, 61, 73, 0.9)'; // Default dark blue/gray
        toast.style.color = '#fff';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.minWidth = '200px';
        toast.style.maxWidth = '400px';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';
        toast.style.fontSize = '16px';
        toast.style.fontFamily = "'Coda', cursive";

        // Icon based on type
        let iconClass = 'fa-info-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';
        if (type === 'success') iconClass = 'fa-check-circle';

        toast.innerHTML = `
      <i class="fa ${iconClass}" style="margin-right: 10px; font-size: 1.2em;"></i>
      <span>${message}</span>
    `;

        this.container.appendChild(toast);

        // Animate In
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Auto Remove
        setTimeout(() => {
            this.hide(toast);
        }, duration);

        // Click to remove
        toast.addEventListener('click', () => {
            this.hide(toast);
        });
    }

    hide(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.addEventListener('transitionend', () => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        });
    }
}
