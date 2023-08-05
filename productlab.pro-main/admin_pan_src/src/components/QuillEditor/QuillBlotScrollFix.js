import { DeleteAction, ResizeAction, AlignAction, ImageSpec } from 'quill-blot-formatter';

export class CustomImageSpec extends ImageSpec {
    getActions() {
        return [DeleteAction, ResizeAction, AlignAction];
    }

    init() {
        this.formatter.quill.root.addEventListener('click', this.onClick);

        // handling scroll event
        this.formatter.quill.root.addEventListener('scroll', () => {
            //   this.formatter.repositionOverlay();
            this.formatter.hide();
        });

        window.addEventListener('scroll', () => {
            //   this.formatter.repositionOverlay();
            this.formatter.hide();
        });

        // handling align
        this.formatter.quill.on('editor-change', (eventName, ...args) => {
            if (eventName === 'selection-change' && args[2] === 'api') {
                setTimeout(() => {
                    this.formatter.repositionOverlay();
                }, 10);
            }
        });
    }
}