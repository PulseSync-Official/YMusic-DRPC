import { useEffect } from 'react';

interface Theme {
    charCount: string;
}

export function useCharCount(containerRef: React.RefObject<HTMLDivElement>, theme: Theme) {
    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const updateCharCount = (
            inputElement: HTMLInputElement | HTMLTextAreaElement,
            counterElement: HTMLElement
        ) => {
            const maxLength = inputElement.maxLength > 0 ? inputElement.maxLength : null;
            const currentLength = inputElement.value.length;

            if (maxLength) {
                counterElement.textContent = `${currentLength}/${maxLength} символов`;
            } else {
                counterElement.textContent = `${currentLength} символов`;
            }
        };

        const createCharCountElement = (inputElement: HTMLInputElement | HTMLTextAreaElement) => {
            const counterElement = document.createElement('div');
            counterElement.className = theme.charCount || 'default-char-count';
            updateCharCount(inputElement, counterElement);

            inputElement.addEventListener('input', () => updateCharCount(inputElement, counterElement));

            inputElement.parentNode?.insertBefore(counterElement, inputElement.nextSibling);
        };

        const textInputs = container.querySelectorAll<HTMLInputElement>('input[type="text"]');
        const textAreas = container.querySelectorAll<HTMLTextAreaElement>('textarea');

        textInputs.forEach(input => createCharCountElement(input));
        textAreas.forEach(textarea => createCharCountElement(textarea));
    }, [containerRef, theme]);
}
